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
          background: "#eef3ef"
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            position: "relative",
            background: "linear-gradient(135deg, #eef3ef 0%, #dfeae2 50%, #f7faf7 100%)"
          }}
        >
          <div style={{ position: "absolute", inset: "46px 64px 54px 64px", display: "flex", borderRadius: 46, background: "#ffffff", border: "4px solid #d6e4da", boxShadow: "0 24px 70px rgba(18,55,42,0.12)" }} />
          <div style={{ position: "absolute", left: 104, top: 104, width: 304, height: 190, display: "flex", borderRadius: 26, background: "#edf5ef", border: "4px solid #cfe0d4" }} />
          <div style={{ position: "absolute", left: 254, top: 104, width: 4, height: 190, background: "#cfe0d4" }} />
          <div style={{ position: "absolute", left: 104, top: 198, width: 304, height: 4, background: "#cfe0d4" }} />
          <div style={{ position: "absolute", left: 520, top: 310, width: 175, height: 92, display: "flex", borderRadius: 24, background: "#dfeae2", border: "5px solid #12372a" }} />
          <div style={{ position: "absolute", left: 553, top: 262, width: 108, height: 96, display: "flex", borderRadius: 999, border: "5px solid #12372a", background: "transparent" }} />
          <div style={{ position: "absolute", left: 520, top: 318, width: 175, height: 92, display: "flex", background: "#dfeae2" }} />
          <div style={{ position: "absolute", left: 718, top: 210, width: 8, height: 198, borderRadius: 999, background: "#12372a", transform: "rotate(-16deg)" }} />
          <div style={{ position: "absolute", left: 694, top: 198, width: 56, height: 30, display: "flex", borderRadius: 10, background: "#ffffff", border: "4px solid #12372a" }} />
          <div style={{ position: "absolute", left: 838, top: 268, width: 84, height: 84, display: "flex", borderRadius: 999, background: "#5f9271" }} />
          <div style={{ position: "absolute", left: 900, top: 250, width: 98, height: 102, display: "flex", borderRadius: 999, background: "#78a985" }} />
          <div style={{ position: "absolute", left: 887, top: 342, width: 9, height: 66, borderRadius: 999, background: "#12372a" }} />
          <div style={{ position: "absolute", left: 838, top: 396, width: 114, height: 44, display: "flex", borderRadius: 13, background: "#dfeae2", border: "4px solid #12372a" }} />
          <div style={{ position: "absolute", left: 116, top: 407, width: 968, height: 5, borderRadius: 999, background: "#d6e4da" }} />
          <div style={{ position: "absolute", left: 764, top: 126, width: 36, height: 36, display: "flex", background: "#12372a", transform: "rotate(45deg)", borderRadius: 8 }} />
          <div style={{ position: "absolute", left: 826, top: 180, width: 24, height: 24, display: "flex", background: "#456255", transform: "rotate(45deg)", borderRadius: 7 }} />
          <div style={{ position: "absolute", left: 104, bottom: 82, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px 34px 22px", borderRadius: 24, background: "#12372a", boxShadow: "0 20px 44px rgba(18,55,42,0.24)", color: "#ffffff", fontSize: 52, fontWeight: 800, letterSpacing: "0.02em", lineHeight: 1 }}>Iboren</div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 520,
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable"
      }
    }
  );
}
