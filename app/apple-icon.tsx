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
          background: "linear-gradient(160deg, #2f7d4f, #1f4d38)",
        }}
      >
        <svg width="110" height="110" viewBox="0 0 24 24">
          <ellipse cx="12" cy="15" rx="6.3" ry="5.3" fill="#fff" />
          <circle cx="5" cy="9" r="2.3" fill="#fff" />
          <circle cx="10" cy="5" r="2.1" fill="#fff" />
          <circle cx="14" cy="5" r="2.1" fill="#fff" />
          <circle cx="19" cy="9" r="2.3" fill="#fff" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
