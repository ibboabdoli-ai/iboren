import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Iboren – Städning i Södertälje och Stockholm";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
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
          color: "#FFF8EF",
          padding: "58px 72px"
        }}
      >
        <div style={{ fontFamily: "Georgia", fontSize: 138, fontWeight: 700, lineHeight: 1, marginBottom: 26 }}>
          Iboren
        </div>
        <div
          style={{
            width: 680,
            height: 2,
            background: "rgba(212,165,116,0.45)",
            marginBottom: 32
          }}
        />
        <div style={{ fontFamily: "Arial", fontSize: 30, fontWeight: 700, letterSpacing: 8, color: "#D4A574", marginBottom: 28 }}>
          PRIS DIREKT & ENKEL BOKNING
        </div>
        <div style={{ fontFamily: "Arial", fontSize: 32, color: "#E6D0B0", textAlign: "center", maxWidth: 860, lineHeight: 1.35 }}>
          Hemstädning, flyttstädning, kontorsstädning och fönsterputs i Södertälje och Stockholm
        </div>
      </div>
    ),
    size
  );
}
