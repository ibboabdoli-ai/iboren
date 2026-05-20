import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
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
            width: 138,
            height: 138,
            borderRadius: 999,
            border: "4px solid rgba(212,165,116,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#D4A574",
            fontFamily: "Georgia",
            fontSize: 78,
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
