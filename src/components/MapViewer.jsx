import { Leva, useControls } from "leva";
import normalizeWheel from "normalize-wheel";
import React, { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { ACESFilmicToneMapping, SRGBColorSpace } from "three";
import { PerspectiveCamera, Stats } from "@react-three/drei";
import Scene from "./MapViewerComponents/Scene";
import Modal from "./Modal/Modal";
import InfoButton from "./InfoButton/InfoButton";
import AudioButton from "./InfoButton/AudioButton";
import LoadingScreen from "./LoadingScreen/LoadingScreen";

import { useProgressionStore } from "./stores/progressionStore";
import { useModalStore } from "./stores/modalStore";

/* eslint-disable react/display-name */
// Memoized Canvas to prevent re-renders when UI state changes
const GameCanvas = React.memo(
  ({ cameraMode, scrollProgress, targetScrollProgress }) => {
    return (
      <Canvas
        shadows
        dpr={1} // Force 100% resolution, avoid upscaling on Retina/HighDPI for performance
        gl={{ antialias: true, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          gl.toneMapping = ACESFilmicToneMapping;
          gl.outputColorSpace = SRGBColorSpace;
        }}
      >
        <Stats />
        <PerspectiveCamera makeDefault fov={50} position={[0, 0, 0]} />

        <Scene
          scrollProgress={scrollProgress}
          targetScrollProgress={targetScrollProgress}
          cameraMode={cameraMode}
        />
      </Canvas>
    );
  },
);

export default function MapViewer() {
  const scrollProgress = useRef(0);
  const targetScrollProgress = useRef(0);
  const scrollSpeed = 0.002; // Lebih cepat

  // Stores
  const {
    villagerCheckpointPassed,
    setVillagerCheckpointPassed,
    isHoveringVillager,
  } = useProgressionStore();
  const { isModalOpen } = useModalStore();

  // State to track if we have opened the modal at least once at this checkpoint
  // (to prevent unlocking just by scrolling back and forth without interaction)
  const [hasInteractedAtCheckpoint, setHasInteractedAtCheckpoint] =
    useState(false);

  // 1. Controls for Camera Mode (Lifted here to control event listener)
  const { cameraMode } = useControls("Camera Mode", {
    cameraMode: {
      value: "Path",
      options: ["Path", "Free"],
      label: "Mode",
    },
  });

  // Effect: Handle Modal Close to Unlock Checkpoint
  useEffect(() => {
    // If modal is closed AND we have interacted (meaning we just finished interacting)
    if (!isModalOpen && hasInteractedAtCheckpoint) {
      setVillagerCheckpointPassed(true);
    }
  }, [isModalOpen, hasInteractedAtCheckpoint, setVillagerCheckpointPassed]);

  useEffect(() => {
    // If modal opens, mark interaction as started
    if (isModalOpen) {
      setHasInteractedAtCheckpoint(true);
    }
  }, [isModalOpen]);

  useEffect(() => {
    const handleWheel = (e) => {
      // If Free mode, let OrbitControls handle the zoom (do nothing here)
      if (cameraMode === "Free") return;

      const normalized = normalizeWheel(e);
      const delta = normalized.pixelY;
      // Adjust speed
      const move =
        Math.sign(delta) * scrollSpeed * Math.min(Math.abs(delta) / 50, 2);

      const nextTarget = targetScrollProgress.current + move;

      // CHECKPOINT LOGIC: 0.2
      // If NOT passed yet, clamp at 0.2
      if (!villagerCheckpointPassed && nextTarget > 0.2) {
        // Allow going back, but not forward past 0.2
        targetScrollProgress.current = 0.2;
      } else {
        targetScrollProgress.current = nextTarget;
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    return () => window.removeEventListener("wheel", handleWheel);
  }, [cameraMode, villagerCheckpointPassed]); // Re-bind if checkpoint status changes

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100vh",
        zIndex: 0,
      }}
    >
      <Leva hidden />
      <LoadingScreen />
      <Modal />

      {/* HUD Buttons */}
      <div
        style={{
          position: "absolute",
          display: "flex",
          gap: "10px",
          top: 20,
          right: 20,
          zIndex: 10,
          color: "white",
          fontFamily: "monospace",
        }}
      >
        <AudioButton />
        <InfoButton />
      </div>
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 20,
          background: "rgba(0,0,0,0.6)",
          color: "white",
          padding: "10px 20px",
          borderRadius: "8px",
          pointerEvents: "none",
          transition: "opacity 0.3s ease",
          opacity: isHoveringVillager && !isModalOpen ? 1 : 0,
          fontFamily: "var(--font-primary)",
        }}
      >
        Press Left Mouse
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 20,
          left: 20,
          zIndex: 10,
          color: "white",
          fontFamily: "monospace",
          pointerEvents: "none",
        }}
      >
        SCROLL TO EXPLORE
      </div>

      <GameCanvas
        cameraMode={cameraMode}
        scrollProgress={scrollProgress}
        targetScrollProgress={targetScrollProgress}
      />
    </div>
  );
}
