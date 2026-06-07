import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 256, height: 256 };
export const contentType = "image/png";

export default function Icon() {
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
          background: "radial-gradient(circle at 50% 35%, #101513 0%, #060807 62%, #020303 100%)",
          color: "#FFF8EF"
        }}
      >
        <div style={{ fontFamily: "Georgia", fontSize: 54, fontWeight: 700, lineHeight: 1 }}>
          Iboren
        </div>
        <div style={{ marginTop: 14, fontFamily: "Arial", fontSize: 11, fontWeight: 700, letterSpacing: 4, color: "#D4A574" }}>
          ENKEL BOKNING
        </div>
      </div>
    ),
    size
  );
}
