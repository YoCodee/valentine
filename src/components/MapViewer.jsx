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
  ({
    cameraMode,
    scrollProgress,
    targetScrollProgress,
    isCinematic,
    isCredits, // New prop
    onStartCinematic,
    onCinematicEnd,
  }) => {
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
          isCinematic={isCinematic}
          isCredits={isCredits}
          onStartCinematic={onStartCinematic}
          onCinematicEnd={onCinematicEnd}
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
    isHoveringChest,
  } = useProgressionStore();
  const { isModalOpen } = useModalStore();

  // State to track if we have opened the modal at least once at this checkpoint
  // (to prevent unlocking just by scrolling back and forth without interaction)
  const [hasInteractedAtCheckpoint, setHasInteractedAtCheckpoint] =
    useState(false);

  // Cinematic Mode State
  const [isCinematic, setIsCinematic] = useState(false);
  const [isEndingSequence, setIsEndingSequence] = useState(false);
  const [isCredits, setIsCredits] = useState(false); // CREDITS MODE

  // Transition State
  const [whiteOverlayOpacity, setWhiteOverlayOpacity] = useState(0);
  const [showTransitionText, setShowTransitionText] = useState(false);
  const [transitionText, setTransitionText] = useState("");
  const [isStuckAtCheckpoint, setIsStuckAtCheckpoint] = useState(false);

  const handleCinematicTrigger = () => {
    // 1. Flash White
    setWhiteOverlayOpacity(1);

    // 2. Show Text after white is full
    setTimeout(() => {
      setTransitionText("Happy Valentine ❤️");
      setShowTransitionText(true);
    }, 1000);

    // 3. Hide Text & Switch Mode
    setTimeout(() => {
      setShowTransitionText(false);
    }, 2500);

    // 4. Start Cinematic & Fade Out
    setTimeout(() => {
      setIsCinematic(true);

      // Fade out white
      setTimeout(() => {
        setWhiteOverlayOpacity(0);
      }, 1000);
    }, 3000);
  };

  const handleCinematicEnd = () => {
    if (isEndingSequence) return;
    setIsEndingSequence(true);

    setTimeout(() => {
      // 1. Flash White
      setWhiteOverlayOpacity(1);

      // 2. Show "I Love You" text
      setTimeout(() => {
        setTransitionText("I Love You ");
        setShowTransitionText(true);

        // 3. Wait 6 seconds, then start credits
        setTimeout(() => {
          startCredits();
        }, 6000);
      }, 500);
    }, 500);
  };

  const startCredits = () => {
    // Fade everything out and show credits
    setWhiteOverlayOpacity(1);
    setShowTransitionText(false);

    setTimeout(() => {
      setIsCredits(true);
      setWhiteOverlayOpacity(0);
    }, 1000);
  };

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
      setIsStuckAtCheckpoint(false); // Hide hint when interacting
    }
  }, [isModalOpen]);

  useEffect(() => {
    if (villagerCheckpointPassed) {
      setIsStuckAtCheckpoint(false);
    }
  }, [villagerCheckpointPassed]);

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

      const checkpoint = 0.139;

      if (!villagerCheckpointPassed && nextTarget > checkpoint) {
        // Allow going back, but not forward past checkpoint
        targetScrollProgress.current = checkpoint;
        setIsStuckAtCheckpoint(true);
      } else {
        targetScrollProgress.current = nextTarget;
        // If moved back significantly, hide hint
        if (nextTarget < checkpoint - 0.05) {
          setIsStuckAtCheckpoint(false);
        }
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
          transition: "opacity 0.5s ease",
          opacity: isCinematic || isEndingSequence || isCredits ? 0 : 1,
          pointerEvents:
            isCinematic || isEndingSequence || isCredits ? "none" : "auto",
        }}
      >
        <AudioButton isCinematic={isCinematic} />
        <InfoButton />
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

      {/* Checkpoint Hint - Minecraft Style */}
      {isStuckAtCheckpoint && !isModalOpen && !isCinematic && (
        <div
          className="checkpoint-hint"
          style={{
            position: "absolute",
            top: "20%",
            left: "50%",
            transform: "translateX(-50%)",
            background: "#c6c6c6",
            border: "2px solid #555555",
            borderBottom: "4px solid #1e1e1f",
            padding: "15px 30px",
            zIndex: 15,
            pointerEvents: "none",
            boxShadow:
              "inset 2px 2px #ffffff, inset -2px -2px #555555, 0 8px 0 rgba(0,0,0,0.3)",
            display: "flex",
            flexDirection: "column",
            gap: "5px",
            textAlign: "center",
            fontFamily: "'Minecraft', monospace",
          }}
        >
          <div
            style={{
              fontSize: "1.2rem",
              color: "#3f3f3f",
              textShadow: "1px 1px 0 #ffffff",
              fontWeight: "bold",
            }}
          >
            Click the Villager
          </div>
          <div
            style={{
              fontSize: "0.9rem",
              color: "#ff5555",
              textShadow: "1px 1px 0 #3f0000",
            }}
          ></div>
        </div>
      )}

      <GameCanvas
        cameraMode={cameraMode}
        scrollProgress={scrollProgress}
        targetScrollProgress={targetScrollProgress}
        isCinematic={isCinematic}
        isCredits={isCredits}
        onStartCinematic={handleCinematicTrigger}
        onCinematicEnd={handleCinematicEnd}
      />

      {/* CREDITS OVERLAY */}
      {isCredits && (
        <div className="credits-container">
          <div className="credits-content">
            <h1>The Journey of Love</h1>
            <p>A Special Experience by Yohanes</p>

            <h2>Directed & Written By</h2>
            <p>Yohanes</p>

            <h2>Lead Developer</h2>
            <p>Yohanes</p>

            <h2>Creative Design</h2>
            <p>Yohanes</p>

            <h2>Special Cast</h2>
            <p>You </p>
            <p>(The Main Character of My Life)</p>

            <h2>Music</h2>
            <p>Frieren - Beyond Journey's End</p>
            <p>Composed by Evan Call</p>

            <h2>3D Assets & Environment</h2>
            <p>Minecraft (Mojang Studios)</p>
            <p>Githack & Sketchfab Community</p>

            <h2>Built With</h2>
            <p>React Three Fiber</p>
            <p>Three.js</p>
            <p>Love & Dedication</p>

            <h2>Special Message</h2>
            <p>"Every moment with you is</p>
            <p>a beautiful adventure."</p>
            <p>Thank you for being part of my journey.</p>

            <h1 style={{ marginTop: "100px" }}>Thank You </h1>
          </div>
        </div>
      )}

      {/* WHITE FLASH OVERLAY */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: isCredits ? "black" : "white", // Switch to black background for credits
          zIndex: 99999, // Above everything
          pointerEvents: "none",
          opacity: whiteOverlayOpacity,
          transition: "opacity 1s ease-in-out, background-color 1s ease-in-out",
          display: "block",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <h1
            style={{
              color: "#ff4d6d", // Valentine Pink
              fontFamily: "var(--font-primary)",
              fontSize: "6rem",
              fontWeight: "bold",
              opacity: showTransitionText ? 1 : 0,
              transform: showTransitionText ? "scale(1)" : "scale(0.8)",
              transition: "all 0.8s ease-out",
              textShadow: "0 0 20px rgba(255, 182, 193, 0.8)",
              margin: 0,
            }}
          >
            {transitionText}
          </h1>
        </div>
      </div>

      {/* CINEMATIC BARS OVERLAY - Ensure they are on top of everything including white overlay */}
      <CinematicBars
        isCinematic={isCinematic || isEndingSequence || isCredits}
      />
    </div>
  );
}

const CinematicBars = ({ isCinematic }) => {
  return (
    <>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "8vh",
          backgroundColor: "black",
          zIndex: 100000, // Above White Overlay (99999)
          transform: isCinematic ? "translateY(0)" : "translateY(-100%)",
          transition: "transform 0.8s cubic-bezier(0.22, 1, 0.36, 1)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          width: "100%",
          height: "8vh",
          backgroundColor: "black",
          zIndex: 100000,
          transform: isCinematic ? "translateY(0)" : "translateY(100%)",
          transition: "transform 0.8s cubic-bezier(0.22, 1, 0.36, 1)",
          pointerEvents: "none",
        }}
      />
    </>
  );
};
