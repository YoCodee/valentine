import React, { useEffect, useRef, useState } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import { useControls } from "leva";
import * as THREE from "three";

import { useModalStore } from "../stores/modalStore";
import { useProgressionStore } from "../stores/progressionStore";
import { ConfessionModal } from "./ValentineModals";
import { playSound } from "../../utils/audioSystem";

function ChestModel({ triggerOpen }) {
  const group = useRef();
  const { scene, animations } = useGLTF("/3d/minecraft_chest (2).glb");
  const { actions, names } = useAnimations(animations, group);

  const { openModal, isModalOpen } = useModalStore();
  const { setIsHoveringChest } = useProgressionStore();

  const [isHovering, setIsHovering] = useState(false);

  // Leva controls
  const { position, rotation, scale, playAnimation } = useControls(
    "Chest Model",
    {
      position: {
        value: [-20.2, 14.2, 0],
        step: 0.1,
      },
      rotation: {
        value: [0, 0, 0],
        step: 0.1,
      },
      scale: {
        value: 0.8,
        min: 0.1,
        max: 5,
        step: 0.1,
      },
      playAnimation: {
        value: false,
        label: "Play Animation",
      },
    },
  );

  // Sync internal hover state with global store
  useEffect(() => {
    setIsHoveringChest(isHovering);
  }, [isHovering, setIsHoveringChest]);



  // Handle external trigger (from Cinematic End)
  useEffect(() => {
    if (triggerOpen) {
      // Play Open Animation without opening modal immediately (visual only)
      if (names.length > 0) {
        const action = actions[names[0]];
        if (action) {
          action.reset().fadeIn(0.1).play();
          action.clampWhenFinished = true;
          action.setLoop(THREE.LoopOnce, 1);
        }
      }
    }
  }, [triggerOpen, actions, names]);

  // Manual animation control (Leva)
  useEffect(() => {
    if (names.length > 0) {
      const action = actions[names[0]];
      if (action) {
        if (playAnimation) {
          action.reset().fadeIn(0.5).play();
          action.setLoop(THREE.LoopRepeat, Infinity);
        } else {
          // Default state: stop
          if (!isModalOpen) {
            // action.stop(); // Don't force stop if we want it to stay closed/open naturally
          }
        }
      }
    }
  }, [actions, names, playAnimation, isModalOpen]);

  // Shadow setup
  useEffect(() => {
    if (!scene) return;
    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [scene]);

 
  return (
    <primitive
      ref={group}
      object={scene}
      position={position}
      rotation={rotation}
      scale={scale}
      onClick={(e) => {
        e.stopPropagation();
        handleInteract();
      }}
      onPointerOver={() => {
        setIsHovering(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setIsHovering(false);
        document.body.style.cursor = "auto";
      }}
    />
  );
}

export default ChestModel;
