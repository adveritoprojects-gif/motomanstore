import { NextResponse } from "next/server";
import { handleUploadPresigned } from "@vercel/blob/client";
import type { HandleUploadPresignedBody } from "@vercel/blob/client";
import {
  BlobContentTypeNotAllowedError,
  BlobError,
  BlobFileTooLargeError,
  issueSignedToken,
} from "@vercel/blob";
import { requireAdmin } from "@/lib/auth";
import {
  PRODUCT_IMAGE_CONTENT_TYPES,
  formatBytes,
  getMaxProductImageBytes,
  isValidProductImagePathname,
} from "@/lib/product-images";

export const dynamic = "force-dynamic";

/** Server-side credential requirements for the presigned upload flow. */
function blobConfigurationError(): NextResponse | null {
  if (!process.env.BLOB_READ_WRITE_TOKEN && !process.env.BLOB_STORE_ID) {
    return NextResponse.json(
      {
        error:
          "Image uploads are not configured (BLOB_READ_WRITE_TOKEN / BLOB_STORE_ID missing)",
      },
      { status: 503 }
    );
  }
  return null;
}

function blobConfigured(): boolean {
  return Boolean(
    process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_STORE_ID
  );
}

async function authorize(): Promise<NextResponse | null> {
  try {
    await requireAdmin();
    return null;
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

/** Upload limits for the admin uploader (no secrets are ever returned). */
export async function GET() {
  const unauthorized = await authorize();
  if (unauthorized) return unauthorized;

  return NextResponse.json({
    maxBytes: getMaxProductImageBytes(),
    contentTypes: [...PRODUCT_IMAGE_CONTENT_TYPES],
    configured: blobConfigured(),
  });
}

/**
 * Issues short-lived, single-file presigned upload URLs for Vercel Blob using
 * the official `@vercel/blob` presigned client-upload flow. The read/write
 * token never leaves the server — clients only receive a URL constrained to
 * one validated pathname, an allow-list of image content types and a
 * maximum file size.
 */
export async function POST(request: Request) {
  const unauthorized = await authorize();
  if (unauthorized) return unauthorized;

  const notConfigured = blobConfigurationError();
  if (notConfigured) return notConfigured;

  let body: HandleUploadPresignedBody;
  try {
    body = (await request.json()) as HandleUploadPresignedBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (
    body.type !== "blob.generate-presigned-url" &&
    body.type !== "blob.upload-completed"
  ) {
    return NextResponse.json(
      { error: "Unsupported request type" },
      { status: 400 }
    );
  }

  try {
    const result = await handleUploadPresigned({
      request,
      body,
      getSignedToken: async (pathname) => {
        if (!isValidProductImagePathname(pathname)) {
          throw new Error("Invalid image filename");
        }
        const token = await issueSignedToken({
          pathname,
          operations: ["put"],
          allowedContentTypes: [...PRODUCT_IMAGE_CONTENT_TYPES],
          maximumSizeInBytes: getMaxProductImageBytes(),
          validUntil: Date.now() + 15 * 60 * 1000, // 15 minutes
        });
        return { token };
      },
    });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof BlobFileTooLargeError) {
      return NextResponse.json(
        {
          error: `File is larger than the ${formatBytes(
            getMaxProductImageBytes()
          )} limit`,
        },
        { status: 413 }
      );
    }
    if (error instanceof BlobContentTypeNotAllowedError) {
      return NextResponse.json(
        { error: "This file type is not allowed" },
        { status: 415 }
      );
    }
    if (error instanceof Error && error.message === "Invalid image filename") {
      return NextResponse.json(
        { error: "Invalid image filename" },
        { status: 400 }
      );
    }
    if (error instanceof BlobError) {
      if (/No blob credentials/i.test(error.message)) {
        return NextResponse.json(
          { error: "Blob storage credentials are missing on the server" },
          { status: 503 }
        );
      }
      console.error("[uploads] blob error", error);
      return NextResponse.json(
        { error: "Blob storage is unavailable" },
        { status: 503 }
      );
    }
    console.error("[uploads] failed to handle upload", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
