import React, { Suspense } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Environment, Sky, OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import { EffectComposer, Bloom, N8AO } from "@react-three/postprocessing";
import { useControls, button } from "leva";

import MapModel from "./MapModel";
import VillagerModel from "./VillagerModel";
import ChestModel from "./ChestModel";
import PathDebugger from "./PathDebugger";
import {
  SecretNoteOne,
  SecretNoteTwo,
  SecretNoteThree,
} from "./ValentineModals";

// Helper to convert Degrees to Radians
const toRad = (deg) => deg * (Math.PI / 180);

const Scene = ({ scrollProgress, targetScrollProgress, cameraMode }) => {
  const { camera } = useThree();

  // Listener for 'P' key to log camera position
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key.toLowerCase() === "p") {
        const { x, y, z } = camera.position;
        // Round to 2 decimal places for cleaner output
        const cx = x.toFixed(2);
        const cy = y.toFixed(2);
        const cz = z.toFixed(2);

        console.log(`new THREE.Vector3(${cx}, ${cy}, ${cz}),`);
        alert(`Copied to console: new THREE.Vector3(${cx}, ${cy}, ${cz})`);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [camera]);

  // --- LEVA CONTROLS START ---
  // Camera Mode is now passed from parent

  // 1. Controls for Timeline Scrubbing
  const { manualScrub, debugProgress } = useControls("Timeline (Debug)", {
    manualScrub: { value: false, label: "Enable Manual Scrub" },
    debugProgress: {
      value: 0,
      min: 0,
      max: 1,
      step: 0.01,
      label: "Scrub Progress",
    },
  });

  // 2. Controls for Each Keyframe Rotation
  const rot0 = useControls("Keyframe 0% (Start)", {
    r0_x: { value: 0, min: -180, max: 180, step: 1 },
    r0_y: { value: 21, min: -180, max: 180, step: 1 },
    r0_z: { value: 0, min: -180, max: 180, step: 1 },
  });

  const rot20 = useControls("Keyframe 20%", {
    r20_x: { value: 0, min: -180, max: 180, step: 1 },
    r20_y: { value: 180, min: -180, max: 180, step: 1 },
    r20_z: { value: 0, min: -180, max: 180, step: 1 },
  });

  const rot21 = useControls("Keyframe 21%", {
    r22_x: { value: 0, min: -180, max: 180, step: 1 },
    r22_y: { value: 0, min: -180, max: 180, step: 1 },
    r22_z: { value: 0, min: -180, max: 180, step: 1 },
  });

  const rot38 = useControls("Keyframe 38%", {
    r38_x: { value: 0, min: -180, max: 180, step: 1 },
    r38_y: { value: 180, min: -180, max: 180, step: 1 }, // Facing back
    r38_z: { value: 0, min: -180, max: 180, step: 1 },
  });

  const rot50 = useControls("Keyframe 50%", {
    r50_x: { value: 0, min: -180, max: 180, step: 1 },
    r50_y: { value: 27, min: -180, max: 180, step: 1 },
    r50_z: { value: 0, min: -180, max: 180, step: 1 },
  });

  const rot80 = useControls("Keyframe 80%", {
    r80_x: { value: 0, min: -180, max: 180, step: 1 },
    r80_y: { value: 69, min: -180, max: 180, step: 1 },
    r80_z: { value: 0, min: -180, max: 180, step: 1 },
  });

  const rot100 = useControls("Keyframe 100% (End)", {
    r100_x: { value: 0, min: -180, max: 180, step: 1 },
    r100_y: { value: 90, min: -180, max: 180, step: 1 },
    r100_z: { value: 0, min: -180, max: 180, step: 1 },
  });

  // Button to print values
  useControls({
    "PRINT CONFIG": button(() => {
      console.log(`
  // COPY PASTE INI KE KODE:
  const rotationTargets = [
    { progress: 0, rotation: new THREE.Euler(toRad(${rot0.r0_x}), toRad(${rot0.r0_y}), toRad(${rot0.r0_z})) },
    { progress: 0.2, rotation: new THREE.Euler(toRad(${rot20.r20_x}), toRad(${rot20.r20_y}), toRad(${rot20.r20_z})) },
    { progress: 0.21, rotation: new THREE.Euler(toRad(${rot21.r22_x}), toRad(${rot21.r22_y}), toRad(${rot21.r22_z})) },
    { progress: 0.38, rotation: new THREE.Euler(toRad(${rot38.r38_x}), toRad(${rot38.r38_y}), toRad(${rot38.r38_z})) },
    { progress: 0.5, rotation: new THREE.Euler(toRad(${rot50.r50_x}), toRad(${rot50.r50_y}), toRad(${rot50.r50_z})) },
    { progress: 0.8, rotation: new THREE.Euler(toRad(${rot80.r80_x}), toRad(${rot80.r80_y}), toRad(${rot80.r80_z})) },
    { progress: 1, rotation: new THREE.Euler(toRad(${rot100.r100_x}), toRad(${rot100.r100_y}), toRad(${rot100.r100_z})) },
  ];
     `);
      alert("Config dicetak di Console (F12)!");
    }),
  });

  // Construct dynamic targets from Leva values
  const rotationTargets = [
    {
      progress: 0,
      rotation: new THREE.Euler(
        toRad(rot0.r0_x),
        toRad(rot0.r0_y),
        toRad(rot0.r0_z),
      ),
    },
    {
      progress: 0.2,
      rotation: new THREE.Euler(
        toRad(rot20.r20_x),
        toRad(rot20.r20_y),
        toRad(rot20.r20_z),
      ),
    },
    {
      progress: 0.21,
      rotation: new THREE.Euler(
        toRad(rot21.r22_x),
        toRad(rot21.r22_y),
        toRad(rot21.r22_z),
      ),
    },
    {
      progress: 0.38,
      rotation: new THREE.Euler(
        toRad(rot38.r38_x),
        toRad(rot38.r38_y),
        toRad(rot38.r38_z),
      ),
    },
    {
      progress: 0.5,
      rotation: new THREE.Euler(
        toRad(rot50.r50_x),
        toRad(rot50.r50_y),
        toRad(rot50.r50_z),
      ),
    },
    {
      progress: 0.8,
      rotation: new THREE.Euler(
        toRad(rot80.r80_x),
        toRad(rot80.r80_y),
        toRad(rot80.r80_z),
      ),
    },
    {
      progress: 1,
      rotation: new THREE.Euler(
        toRad(rot100.r100_x),
        toRad(rot100.r100_y),
        toRad(rot100.r100_z),
      ),
    },
  ];

  // Define your custom camera path here
  const cameraCurve = new THREE.CatmullRomCurve3(
    [
      new THREE.Vector3(21.42, 4.84, 48.16),
      new THREE.Vector3(7.63, 5.75, 30.63),
      new THREE.Vector3(16.85, 4.92, 23.44),
      new THREE.Vector3(22.35, 2.42, -6.96),
      new THREE.Vector3(10.83, 3, -21.16),
      new THREE.Vector3(16.2, 11.57, 11.09),
      new THREE.Vector3(7.25, 16.41, 10.9),
      new THREE.Vector3(7.31, 16.74, -0.05),
      new THREE.Vector3(-16.87, 15.34, -0.03),
    ],
    false, // Closed loop
  );

  const getLerpedRotation = (progress) => {
    // Basic finding of prev/next keyframes
    // Note: This logic assumes rotationTargets are sorted by progress
    let start = rotationTargets[0];
    let end = rotationTargets[rotationTargets.length - 1];

    for (let i = 0; i < rotationTargets.length - 1; i++) {
      if (
        progress >= rotationTargets[i].progress &&
        progress <= rotationTargets[i + 1].progress
      ) {
        start = rotationTargets[i];
        end = rotationTargets[i + 1];
        break;
      }
    }

    const range = end.progress - start.progress;
    const rangeProgress = range === 0 ? 0 : (progress - start.progress) / range;

    const startQuaternion = new THREE.Quaternion().setFromEuler(start.rotation);
    const endQuaternion = new THREE.Quaternion().setFromEuler(end.rotation);

    const result = new THREE.Quaternion();
    result.slerpQuaternions(startQuaternion, endQuaternion, rangeProgress);
    return result;
  };

  useFrame((state, delta) => {
    // SKIP Path Logic if in Free Mode
    if (cameraMode === "Free") return;

    // DEBUG MODE CHECK
    let currentProgressValue = 0;

    if (manualScrub) {
      // Pakai Slider Leva
      currentProgressValue = debugProgress;
      scrollProgress.current = debugProgress; // Sync ref for smoother switch back
    } else {
      // Pakai Scroll Normal (Ping Pong Loop)
      const dampSpeed = 1.5;

      scrollProgress.current = THREE.MathUtils.damp(
        scrollProgress.current,
        targetScrollProgress.current,
        dampSpeed,
        delta,
      );

      // PING-PONG / YOYO LOOP LOGIC
      const cycle = 2;
      let modulo = scrollProgress.current % cycle;

      // Handle negative buffer
      if (modulo < 0) modulo += cycle;

      // Jika lebih dari 1, berarti sedang "Waktu Mundur" (1.1 -> 0.9)
      currentProgressValue = modulo > 1 ? 2 - modulo : modulo;
    }

    // 1. Update Position based on Path
    const basePoint = cameraCurve.getPoint(currentProgressValue);

    // 2. Update Rotation based on Manual Keyframes (Dynamic from Leva)
    const targetQuaternion = getLerpedRotation(currentProgressValue);

    // Apply directly to camera
    camera.position.copy(basePoint);
    camera.quaternion.copy(targetQuaternion);
  });

  return (
    <>
      {cameraMode === "Free" && <OrbitControls makeDefault />}

      <color attach="background" args={["#a1c4fd"]} />

      <Sky sunPosition={[100, 10, 100]} turbidity={0.1} rayleigh={0.5} />
      <fog attach="fog" args={["#ffffff", 30, 160]} />

      <ambientLight intensity={1.2} color="#ffffff" />
      <directionalLight
        castShadow
        position={[50, 40, 50]}
        intensity={2.5}
        color="#fff5e6"
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0001}
        shadow-normalBias={0.04}
        shadow-camera-near={0.5}
        shadow-camera-far={300}
        shadow-camera-left={-70}
        shadow-camera-right={70}
        shadow-camera-top={70}
        shadow-camera-bottom={-70}
      />

      <Suspense fallback={null}>
        <Environment
          background={false}
          files={[
            "/cubemap/px.webp",
            "/cubemap/nx.webp",
            "/cubemap/py.webp",
            "/cubemap/ny.webp",
            "/cubemap/pz.webp",
            "/cubemap/nz.webp",
          ]}
        />
        <MapModel />
        <VillagerModel
          name="Villager 1"
          initialPosition={[0.56, 3.6, 32.8]}
          initialRotation={[0, 2.1, 0]}
          modalTitle="Pesan #1"
          modalBody={<SecretNoteOne />}
        />
        <VillagerModel
          name="Villager 2"
          initialPosition={[9, 0.4, -26.3]}
          initialRotation={[0, 0.4, 0]}
          modalTitle="Pesan #2"
          modalBody={<SecretNoteTwo />}
        />
        <VillagerModel
          name="Villager 3"
          initialPosition={[0.9000000000000006, 13.5, 11.9]}
          initialRotation={[0, 2.0, 0]}
          modalTitle="Pesan #3"
          modalBody={<SecretNoteThree />}
        />
        <ChestModel />
        {/* Debugger: Visualize the path in Red */}
        <PathDebugger curve={cameraCurve} />
      </Suspense>

      {/* Optimization: Ultra-low settings for N8AO, enable MipmapBlur for Bloom */}
      <EffectComposer disableNormalPass multisampling={0}>
        <N8AO
          halfRes
          aoSamples={2}
          denoiseSamples={1}
          aoRadius={2}
          intensity={1}
          distanceFalloff={2}
        />
        <Bloom luminanceThreshold={1.2} intensity={0.5} mipmapBlur={true} />
      </EffectComposer>
    </>
  );
};

export default Scene;
