import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "MOTOMAN — Premium Car Care & Detailing Products";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#0a0a0a",
          padding: 80,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div
            style={{
              width: 16,
              height: 16,
              backgroundColor: "#f97316",
              borderRadius: 8,
            }}
          />
          <span
            style={{
              color: "#f97316",
              fontSize: 28,
              letterSpacing: 6,
              textTransform: "uppercase",
              fontWeight: 600,
            }}
          >
            Premium Car Care
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <span
            style={{
              color: "#ffffff",
              fontSize: 88,
              fontWeight: 700,
              lineHeight: 1.05,
            }}
          >
            MOTOMAN
          </span>
          <span
            style={{
              color: "#a3a3a3",
              fontSize: 36,
              lineHeight: 1.3,
              maxWidth: 900,
            }}
          >
            Car Care &amp; Detailing Products Online
          </span>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ color: "#525252", fontSize: 24 }}>
            Drive Cleaner. Drive Better.
          </span>
          <span style={{ color: "#525252", fontSize: 24 }}>motoman.in</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
