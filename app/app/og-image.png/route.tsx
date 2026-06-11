import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0B0E0C",
          color: "#FFF8EF",
          padding: "58px 72px",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            border: "2px solid rgba(212,165,116,0.38)",
            borderRadius: 44,
          }}
        >
          <div style={{ fontFamily: "Georgia", fontSize: 118, fontWeight: 700, lineHeight: 1, marginBottom: 24 }}>
            Iboren
          </div>

          <div style={{ fontFamily: "Arial", fontSize: 30, fontWeight: 800, letterSpacing: 8, color: "#D4A574", marginBottom: 30 }}>
            STÄDSERVICE
          </div>

          <div style={{ fontFamily: "Arial", fontSize: 34, fontWeight: 700, marginBottom: 18 }}>
            Hemstädning • Flyttstädning • Kontorsstädning
          </div>

          <div style={{ fontFamily: "Arial", fontSize: 30, color: "#E6D0B0" }}>
            Södertälje & Stockholm • iboren.se
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
