import React, { useState, useEffect } from "react";
import { useProgress } from "@react-three/drei";
import { useAudioStore } from "../stores/audioStore";

export default function LoadingScreen() {
  const { active, progress, errors, item, loaded, total } = useProgress();
  const [finished, setFinished] = useState(false);
  const [showStartButton, setShowStartButton] = useState(false);

  useEffect(() => {
    // If loading takes too long (> 4s), show manual entry button as fallback
    const timeout = setTimeout(() => {
      setShowStartButton(true);
    }, 4000);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    // Auto-finish if we are 100% or effectively done
    // We also treat 99% as done to avoid getting stuck on rounding or tiny external assets
    const isBasicallyDone = progress >= 99 || (total > 0 && loaded >= total);

    // Filter out errors that are NOT fatal (like the HDRI preset failing to download)
    const criticalErrors =
      errors?.filter((e) => {
        const errStr = String(e).toLowerCase();
        // We ignore specific errors that we know are non-fatal "ambient" assets
        return (
          !errStr.includes("blob:") &&
          !errStr.includes("localhost") &&
          !errStr.includes("githack") &&
          !errStr.includes("hdr")
        );
      }) || [];

    const hasCriticalErrors = criticalErrors.length > 0;

    // Safety: If main models are loaded (Map is usually the biggest), just show start button
    if ((isBasicallyDone || progress > 95) && !hasCriticalErrors) {
      setShowStartButton(true);
    }
  }, [active, progress, loaded, total, errors]);

  const { setIsAudioEnabled } = useAudioStore();

  const handleManualEnter = () => {
    setIsAudioEnabled(true);
    setFinished(true);
  };

  if (finished) return null;

  // Safe percentage
  const percentage =
    Number.isFinite(progress) && progress >= 0 ? Math.round(progress) : 0;

  // Filter current item display to avoid showing the stuck HDRI URL
  const displayItem =
    item?.includes("githack") || item?.includes(".hdr")
      ? "Environment Lighting..."
      : item;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "#111",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        color: "#fff",
        fontFamily: "'Minecraft', 'Courier New', Courier, monospace",
        transition: "opacity 1s ease-out",
        opacity: finished ? 0 : 1,
        pointerEvents: finished ? "none" : "auto",
        imageRendering: "pixelated",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <p
          style={{
            fontSize: "1.2rem",
            marginBottom: "0.5rem",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
          }}
        >
          Hi 👋! Thanks for stopping by!! 💖
        </p>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            fontSize: "1.2rem",
            fontWeight: "bold",
          }}
        >
          <span style={{ fontSize: "1.4rem" }}>🖱️</span>
          <span>Drag/Scroll Up/Down to Navigate~ 👈</span>
        </div>
      </div>

      <div
        style={{
          width: "300px",
          height: "20px",
          border: "2px solid #fff",
          position: "relative",
          background: "transparent",
          padding: "2px",
        }}
      >
        <div
          style={{
            width: `${percentage}%`,
            height: "100%",
            background: "#fff",
            transition: "width 0.2s ease",
          }}
        />
      </div>

      <p style={{ marginTop: "0.5rem", fontSize: "1rem", fontWeight: "bold" }}>
        {percentage}%
      </p>

      {/* Display item being loaded, but cleaned up */}
      {active && displayItem && (
        <p
          style={{
            marginTop: "1rem",
            fontSize: "0.8rem",
            opacity: 0.7,
            maxWidth: "80%",
            textAlign: "center",
            wordBreak: "break-all",
          }}
        >
          Loading: {displayItem}
        </p>
      )}

      {/* Start / Fallback Button */}
      {showStartButton && (
        <button
          onClick={handleManualEnter}
          style={{
            marginTop: "2rem",
            background: "#fff",
            border: "none",
            color: "#111",
            padding: "15px 40px",
            fontFamily: "inherit",
            cursor: "pointer",
            fontSize: "1.2rem",
            fontWeight: "bold",
            borderRadius: "4px",
            boxShadow: "0 4px 15px rgba(255,255,255,0.3)",
            animation: "pulse 2s infinite",
            pointerEvents: "auto",
            transition: "transform 0.2s ease, background 0.2s ease",
          }}
          onMouseEnter={(e) => (e.target.style.transform = "scale(1.05)")}
          onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
        >
          {percentage >= 95
            ? "CLICK TO START ❤️"
            : "FORCE ENTER (Skip Loading)"}
        </button>
      )}

      <style>{`
        @keyframes pulse {
          0% { opacity: 0.7; }
          50% { opacity: 1; }
          100% { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}
