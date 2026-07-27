import { ImageResponse } from "next/og"

export const size = {
  width: 180,
  height: 180,
}

export const contentType = "image/png"

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
          background: "linear-gradient(145deg, #164e63 0%, #0c1a24 100%)",
          borderRadius: 40,
          border: "4px solid rgba(34, 211, 238, 0.55)",
        }}
      >
        <svg
          width="120"
          height="120"
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M32 14 L46 22 V38 L32 46 L18 38 V22 Z"
            stroke="#22D3EE"
            strokeWidth="2.5"
            strokeLinejoin="round"
            fill="#22D3EE"
            fillOpacity="0.12"
          />
          <path
            d="M20 34 H26 L29 24 L35 40 L38 30 H44"
            stroke="#22D3EE"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="32" cy="42" r="2.8" fill="#22D3EE" />
        </svg>
      </div>
    ),
    { ...size }
  )
}
