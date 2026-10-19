import { NextResponse } from "next/server";
import { runDueNotifications } from "@/lib/notifications";

export const dynamic = "force-dynamic";

/**
 * Protected retry worker: delivers due outbox notifications (retries with
 * backoff, recovery of rows stuck `processing` after a deploy). Vercel Cron
 * invokes it every 5 minutes with `Authorization: Bearer $CRON_SECRET`;
 * it can also be triggered manually with the same header.
 */
async function handle(request: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { processed } = await runDueNotifications();
    return NextResponse.json({ ok: true, processed });
  } catch {
    return NextResponse.json(
      { error: "Notification processing failed" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  return handle(request);
}

export async function POST(request: Request) {
  return handle(request);
}
