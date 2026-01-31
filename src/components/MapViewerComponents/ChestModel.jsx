import React, { useEffect, useRef, useState } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import { useControls } from "leva";
import * as THREE from "three";

import { useModalStore } from "../stores/modalStore";
import { ConfessionModal } from "./ValentineModals";
import { playSound } from "../../utils/audioSystem";

function ChestModel() {
  const group = useRef();
  const { scene, animations } = useGLTF("/3d/minecraft_chest (2).glb");
  const { actions, names } = useAnimations(animations, group);

  const { openModal, closeModal } = useModalStore();
  const [hasOpenedChest, setHasOpenedChest] = useState(false);

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
        value: 1,
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

  // Manual animation control (Leva)
  useEffect(() => {
    if (names.length > 0 && !hasOpenedChest) {
      const action = actions[names[0]];
      if (action) {
        if (playAnimation) {
          action.reset().fadeIn(0.5).play();
          action.setLoop(THREE.LoopRepeat, Infinity);
        } else {
          action.fadeOut(0.5).stop();
        }
      }
    }
  }, [actions, names, playAnimation, hasOpenedChest]);

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

  const handleClick = () => {
    if (hasOpenedChest) return;

    playSound("buttonClick");
    setHasOpenedChest(true);

    // Play "Open" animation (assuming it's at index 0 or named appropriately)
    if (names.length > 0) {
      const action = actions[names[0]]; // Or whatever the open animation name is
      if (action) {
        action.reset().fadeIn(0.2).play();
        action.clampWhenFinished = true;
        action.setLoop(THREE.LoopOnce, 1);
      }
    }

    // Delay the modal appearing slightly for the animation to start
    setTimeout(() => {
      openModal("SPECIAL QUESTION ❓", <ConfessionModal />);
    }, 800);
  };

  return (
    <primitive
      ref={group}
      object={scene}
      position={position}
      rotation={rotation}
      scale={scale}
      onClick={(e) => {
        e.stopPropagation();
        handleClick();
      }}
      onPointerOver={() => (document.body.style.cursor = "pointer")}
      onPointerOut={() => (document.body.style.cursor = "auto")}
    />
  );
}

export default ChestModel;
