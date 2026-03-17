import { ImageResponse } from "next/og";

export const alt = "THE JEROME - Tournament Prediction League";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Impact, Arial Black, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Basketball court lines decoration */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: "400px",
            height: "400px",
            border: "3px solid rgba(249, 115, 22, 0.15)",
            borderRadius: "50%",
            transform: "translate(-50%, -50%)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: "200px",
            height: "200px",
            border: "3px solid rgba(249, 115, 22, 0.1)",
            borderRadius: "50%",
            transform: "translate(-50%, -50%)",
            display: "flex",
          }}
        />

        {/* Title */}
        <div
          style={{
            fontSize: 120,
            color: "#f97316",
            letterSpacing: "8px",
            lineHeight: 1,
            display: "flex",
          }}
        >
          THE JEROME
        </div>

        {/* Divider */}
        <div
          style={{
            width: "600px",
            height: "4px",
            background: "#f97316",
            margin: "24px 0",
            borderRadius: "2px",
            display: "flex",
          }}
        />

        {/* Subtitle */}
        <div
          style={{
            fontSize: 36,
            color: "rgba(255, 255, 255, 0.9)",
            letterSpacing: "12px",
            textTransform: "uppercase",
            display: "flex",
          }}
        >
          Tournament Prediction League
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 22,
            color: "rgba(255, 255, 255, 0.5)",
            marginTop: "20px",
            letterSpacing: "4px",
            display: "flex",
          }}
        >
          Dominate the bracket. Own the leaderboard.
        </div>
      </div>
    ),
    { ...size }
  );
}
