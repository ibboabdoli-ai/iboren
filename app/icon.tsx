import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#050706"
        }}
      >
        <div
          style={{
            width: 50,
            height: 50,
            borderRadius: 999,
            border: "2px solid rgba(212,165,116,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#D4A574",
            fontFamily: "Georgia",
            fontSize: 30,
            fontWeight: 700
          }}
        >
          I
        </div>
      </div>
    ),
    size
  );
}
