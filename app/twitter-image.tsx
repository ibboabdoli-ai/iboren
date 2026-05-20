import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Iboren – Städning i Södertälje och Stockholm";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #050706 0%, #0B0E0C 52%, #131816 100%)",
          color: "#FFF8EF"
        }}
      >
        <div
          style={{
            width: 220,
            height: 220,
            borderRadius: 999,
            border: "4px solid rgba(212,165,116,0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#D4A574",
            fontFamily: "Georgia",
            fontSize: 110,
            fontWeight: 700,
            marginBottom: 36
          }}
        >
          I
        </div>
        <div style={{ fontFamily: "Georgia", fontSize: 104, fontWeight: 700, marginBottom: 22 }}>Iboren</div>
        <div style={{ fontFamily: "Arial", fontSize: 28, fontWeight: 700, letterSpacing: 8, color: "#D4A574", marginBottom: 22 }}>
          PRIS DIREKT & ENKEL BOKNING
        </div>
        <div style={{ fontFamily: "Arial", fontSize: 24, color: "#E6D0B0" }}>Städning i Södertälje och Stockholm</div>
      </div>
    ),
    size
  );
}
