import React, { useState, useEffect } from "react";
import { useProgress } from "@react-three/drei";

export default function LoadingScreen() {
  const { active, progress } = useProgress();
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (!active && progress === 100) {
      // Add a small delay to ensure Scene/Shaders are fully ready/rendered
      const timer = setTimeout(() => {
        setFinished(true);
      }, 1500); // 1.5s delay
      return () => clearTimeout(timer);
    }
  }, [active, progress]);

  // Only remove from DOM if 'finished' is true.
  // But we want to fade out first, so we use 'finished' to trigger opacity change?
  // Actually, let's keep it simpler: render until finished only.

  if (finished) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background:
          "linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        color: "#d63384",
        fontFamily: "'Courier New', Courier, monospace",
        transition: "opacity 1s ease-out",
        opacity: active || progress < 100 ? 1 : 0, // Fade out when not active
        pointerEvents: active || progress < 100 ? "auto" : "none",
      }}
    >
      <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>💌</div>

      <h1
        style={{
          fontSize: "2.5rem",
          marginBottom: "2rem",
          textShadow: "2px 2px 0px #fff",
          letterSpacing: "2px",
          fontWeight: "bold",
          textAlign: "center",
        }}
      >
        VALENTINE'S JOURNEY
      </h1>

      {/* Heart Loading Spinner or Simple Bar */}
      <div
        style={{
          width: "300px",
          height: "20px",
          border: "4px solid #fff",
          position: "relative",
          background: "rgba(255,255,255,0.5)",
          borderRadius: "10px",
          overflow: "hidden",
        }}
      >
        {/* Progress Fill */}
        <div
          style={{
            width: `${progress}%`,
            height: "100%",
            background: "#ff4d6d",
            transition: "width 0.2s ease",
            borderRadius: "10px",
          }}
        />
      </div>

      <p style={{ marginTop: "1rem", fontSize: "1.2rem", fontWeight: "bold" }}>
        {progress < 100
          ? `Preparing Surprise... ${Math.round(progress)}%`
          : "Ready!"}
      </p>
    </div>
  );
}
