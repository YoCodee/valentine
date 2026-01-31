import React, { useEffect, useRef, useMemo } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import { useControls } from "leva";
import { useModalStore } from "../stores/modalStore";
import { useProgressionStore } from "../stores/progressionStore";
import { playSound } from "../../utils/audioSystem";
import { SkeletonUtils } from "three-stdlib";
import { useGraph } from "@react-three/fiber";

function VillagerModel({
  name = "Villager",
  initialPosition = [0, 0, 0],
  initialRotation = [0, 0, 0],
  modalTitle = "Villager says:",
  modalBody = "Hello!",
}) {
  const group = useRef();
  const { scene, animations } = useGLTF("/3d/Villager.glb");

  // Clone the scene so we can have multiple independent instances
  const clone = useMemo(() => SkeletonUtils.clone(scene), [scene]);
  const { nodes } = useGraph(clone);

  const { actions, names } = useAnimations(animations, group);
  const { openModal } = useModalStore();
  const { setIsHoveringVillager } = useProgressionStore();

  const { position, scale, rotation } = useControls(`${name} Controls`, {
    position: {
      value: initialPosition,
      step: 0.1,
    },
    rotation: {
      value: initialRotation,
      step: 0.1,
    },
    scale: {
      value: 1.5,
      min: 0.1,
      max: 5,
      step: 0.1,
    },
  });

  useEffect(() => {
    if (!clone) return;
    clone.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material) {
          // Fix for "tembus tembus" / transparency sorting issues
          child.material.transparent = true; // Use texture transparency
          child.material.alphaTest = 0.5; // Cutout transparency (critical for correct depth sorting)
          child.material.depthWrite = true; // Ensure it writes to depth buffer
          child.material.side = 2; // DoubleSide
          child.material.needsUpdate = true;
        }
      }
    });
  }, [clone]);

  // Interaction Handler
  const handleInteract = (e) => {
    e.stopPropagation(); // Prevent click from dragging Scene or hitting other things
    playSound("villager");

    // Play Animation
    if (names.length > 0) {
      const action = actions[names[0]];
      if (action) {
        action.reset().fadeIn(0.2).play();
      }
    }

    // Open Modal with custom content
    openModal(modalTitle, modalBody, "info");
  };

  return (
    <primitive
      ref={group}
      object={clone}
      position={position}
      rotation={rotation}
      scale={scale}
      onClick={handleInteract}
      onPointerOver={() => {
        document.body.style.cursor = "pointer";
        setIsHoveringVillager(true);
      }}
      onPointerOut={() => {
        document.body.style.cursor = "auto";
        setIsHoveringVillager(false);
      }}
    />
  );
}

export default VillagerModel;
