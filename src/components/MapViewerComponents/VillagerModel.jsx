import React, { useEffect, useRef, useMemo } from "react";
import { useGLTF, useAnimations, Html } from "@react-three/drei";
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
  onInteract, // Optional custom interaction
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

    // Custom Interaction (Overrides Default Modal)
    if (onInteract) {
      onInteract();
      return;
    }

    // Open Modal with custom content
    openModal(modalTitle, modalBody, "info");
  };

  const [isHovering, setIsHovering] = React.useState(false);

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <primitive
        ref={group}
        object={clone}
        position={[0, 0, 0]}
        rotation={[0, 0, 0]}
        scale={1}
        onClick={handleInteract}
        onPointerOver={() => {
          document.body.style.cursor = "pointer";
          setIsHoveringVillager(true);
          setIsHovering(true);
        }}
        onPointerOut={() => {
          document.body.style.cursor = "auto";
          setIsHoveringVillager(false);
          setIsHovering(false);
        }}
      />
      {isHovering && !useModalStore.getState().isModalOpen && (
        <Html distanceFactor={10} position={[0, 2, 0]} center>
          <div
            style={{
              background: "#c6c6c6",
              border: "2px solid #555555",
              borderBottom: "4px solid #1e1e1f",
              padding: "5px 10px",
              whiteSpace: "nowrap",
              boxShadow: "inset 2px 2px #ffffff, inset -2px -2px #555555",
              fontFamily: "'Minecraft', monospace",
              color: "#3f3f3f",
              textShadow: "1px 1px 0 #ffffff",
              fontSize: "12px",
              pointerEvents: "none",
            }}
          >
            Press Left Mouse
          </div>
        </Html>
      )}
    </group>
  );
}

export default VillagerModel;
