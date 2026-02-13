import React, { Suspense } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Environment, Sky, OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import {
  EffectComposer,
  Bloom,
  SSAO,
  ToneMapping,
  BrightnessContrast,
} from "@react-three/postprocessing";
import { useControls, button } from "leva";

import MapModel from "./MapModel";
import VillagerModel from "./VillagerModel";
import ChestModel from "./ChestModel";
import PathDebugger from "./PathDebugger";
import {
  SecretNoteOne,
  SecretNoteTwo,
  SecretNoteThree,
  SecretNoteFour,
} from "./ValentineModals";

// Helper to convert Degrees to Radians
const toRad = (deg) => deg * (Math.PI / 180);

const Scene = ({
  scrollProgress,
  targetScrollProgress,
  cameraMode,
  isCinematic,
  isCredits, // New prop for credits mode
  onStartCinematic,
  onCinematicEnd, // Callback for when cinematic sequence finishes
}) => {
  const { camera } = useThree();
  const cinematicTime = React.useRef(0);

  // Listener for 'P' key to log camera position
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key.toLowerCase() === "p") {
        const { x, y, z } = camera.position;
        const { x: rx, y: ry, z: rz } = camera.rotation;

        // Round position to 2 decimal places
        const cx = x.toFixed(2);
        const cy = y.toFixed(2);
        const cz = z.toFixed(2);

        // Convert rotation to degrees and round
        const dx = Math.round(THREE.MathUtils.radToDeg(rx));
        const dy = Math.round(THREE.MathUtils.radToDeg(ry));
        const dz = Math.round(THREE.MathUtils.radToDeg(rz));

        console.log(`Position: new THREE.Vector3(${cx}, ${cy}, ${cz})`);
        console.log(`Rotation (Deg): x: ${dx}, y: ${dy}, z: ${dz}`);

        alert(
          `Logged to Console:\nPos: [${cx}, ${cy}, ${cz}]\nRot(Deg): [${dx}, ${dy}, ${dz}]`,
        );
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [camera]);

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

  // --- 3. Environment & Sky Controls ---
  const {
    sunPosition,
    turbidity,
    rayleigh,
    mieCoefficient,
    fogColor,
    fogNear,
    fogFar,
  } = useControls(
    "Sky Environment",
    {
      sunPosition: { value: [100, 5, 100] },
      turbidity: { value: 0.3, min: 0, max: 1, step: 0.01 },
      rayleigh: { value: 3, min: 0, max: 10, step: 0.1 },
      mieCoefficient: { value: 0.005, min: 0, max: 0.1, step: 0.001 },
      fogColor: { value: "#ffeebb" },
      fogNear: { value: 30, min: 0, max: 100 },
      fogFar: { value: 200, min: 50, max: 500 },
    },
    { collapsed: true },
  );

  // --- 4. Lighting Controls ---
  const { ambIntensity, ambColor, dirIntensity, dirColor, dirPos } =
    useControls(
      "Lighting",
      {
        ambIntensity: { value: 0.6, min: 0, max: 2, step: 0.1 },
        ambColor: { value: "#fff0e6" },
        dirIntensity: { value: 10.0, min: 0, max: 10, step: 0.1 },
        dirColor: { value: "#ffe3c2" },
        dirPos: { value: [80, 20, 80] },
      },
      { collapsed: true },
    );

  // --- 5. Post-Processing Controls ---
  const {
    // SSAO
    ssaoRadius,
    ssaoIntensity,
    ssaoLumInfluence,
    ssaoColor,
    // Bloom
    bloomThreshold,
    bloomIntensity,
    bloomRadius,
    // ToneMapping
    tmMiddleGrey,
    tmMaxLum,
    tmAvgLum,
    // BrightnessContrast
    brightness,
    contrast,
  } = useControls(
    "Post-Processing",
    {
      // SSAO
      ssaoRadius: {
        value: 0.5,
        min: 0,
        max: 5,
        step: 0.1,
        label: "SSAO Radius",
      },
      ssaoIntensity: {
        value: 80,
        min: 0,
        max: 200,
        step: 1,
        label: "SSAO Intensity",
      },
      ssaoLumInfluence: {
        value: 0.4,
        min: 0,
        max: 1,
        step: 0.01,
        label: "SSAO Lum Infl",
      },
      ssaoColor: { value: "black", label: "SSAO Color" },

      // Bloom
      bloomThreshold: {
        value: 1.2,
        min: 0,
        max: 3,
        label: "Bloom Threshold",
      },
      bloomIntensity: {
        value: 0.6,
        min: 0,
        max: 3,
        label: "Bloom Intensity",
      },
      bloomRadius: {
        value: 0.5,
        min: 0,
        max: 2,
        label: "Bloom Radius",
      },

      // ToneMapping
      tmMiddleGrey: {
        value: 0.7,
        min: 0,
        max: 2,
        label: "TM Middle Grey",
      },
      tmMaxLum: { value: 16.0, min: 0, max: 30, label: "TM Max Lum" },
      tmAvgLum: { value: 0.9, min: 0, max: 5, label: "TM Avg Lum" },

      // BC
      brightness: {
        value: 0.1,
        min: -1,
        max: 1,
        step: 0.05,
        label: "Brightness",
      },
      contrast: {
        value: 0.2,
        min: -1,
        max: 1,
        step: 0.05,
        label: "Contrast",
      },
    },
    { collapsed: true },
  );

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

  const [cinematicFinished, setCinematicFinished] = React.useState(false);

  useFrame((state, delta) => {
    // SKIP Path Logic if in Free Mode
    if (cameraMode === "Free") return;

    // CREDITS MODE CAMERA
    if (isCredits) {
      // Target Position
      const credPos = new THREE.Vector3(21.52, -7.14, -73.89);
      // Target Rotation (Converted from Deg: 159, 20, -173)
      const credRot = new THREE.Euler(toRad(159), toRad(20), toRad(-173));

      camera.position.lerp(credPos, 0.05);
      camera.quaternion.slerp(
        new THREE.Quaternion().setFromEuler(credRot),
        0.05,
      );
      return;
    }

    if (isCinematic) {
      cinematicTime.current += delta;
      const sceneDuration = 8.0; // Slow scenic duration
      const totalDuration = sceneDuration * 4; // 4 Scenes total

      // Clamp to end (Do not loop)
      let t = cinematicTime.current;
      if (t >= totalDuration) {
        t = totalDuration;
        if (!cinematicFinished) {
          setCinematicFinished(true);
          // Trigger the ending sequence (Flash + Text)
          if (onCinematicEnd) onCinematicEnd();
        }
      }

      let posStart, posEnd, rotStart, rotEnd;
      let alpha = 0;

      if (t < sceneDuration) {
        // SCENE 1
        posStart = new THREE.Vector3(64.12, -5.37, -15.01);
        posEnd = new THREE.Vector3(36.97, -7.58, 49.77);
        rotStart = new THREE.Euler(toRad(127), toRad(70), toRad(-128));
        rotEnd = new THREE.Euler(toRad(21), toRad(32), toRad(-11));

        alpha = t / sceneDuration;
      } else if (t < sceneDuration * 2) {
        // SCENE 2
        posStart = new THREE.Vector3(-22.27, 6.87, -61.62);
        posEnd = new THREE.Vector3(35.51, 6.36, -18.39);

        rotStart = new THREE.Euler(toRad(175), toRad(-23), toRad(178));
        rotEnd = new THREE.Euler(toRad(161), toRad(62), toRad(-163));

        alpha = (t - sceneDuration) / sceneDuration;
      } else if (t < sceneDuration * 3) {
        // SCENE 3 (3 Points -> 2 Segments)
        const localT = t - sceneDuration * 2;
        const segmentDuration = sceneDuration / 2;

        if (localT < segmentDuration) {
          // Point 1 -> Point 2
          posStart = new THREE.Vector3(-50.2, 12.75, -60.72);
          posEnd = new THREE.Vector3(-65.09, 26.97, 20.31);
          rotStart = new THREE.Euler(toRad(160), toRad(-38), toRad(167));
          rotEnd = new THREE.Euler(toRad(5), toRad(-58), toRad(4));
          alpha = localT / segmentDuration;
        } else {
          // Point 2 -> Point 3
          posStart = new THREE.Vector3(-65.09, 26.97, 20.31);
          posEnd = new THREE.Vector3(46.5, 20.18, 44.17);
          rotStart = new THREE.Euler(toRad(5), toRad(-58), toRad(4));
          rotEnd = new THREE.Euler(toRad(8), toRad(56), toRad(-7));
          alpha = (localT - segmentDuration) / segmentDuration;
        }
      } else {
        // SCENE 4 (4 Points -> 3 Segments)
        const localT = t - sceneDuration * 3;
        const segmentDuration = sceneDuration / 3;

        if (localT < segmentDuration) {
          // Point 1 -> Point 2
          posStart = new THREE.Vector3(-11.34, 35.58, 0.18);
          posEnd = new THREE.Vector3(24.57, 38.2, -0.19);
          rotStart = new THREE.Euler(toRad(-96), toRad(84), toRad(96));
          rotEnd = new THREE.Euler(toRad(-98), toRad(86), toRad(98));
          alpha = localT / segmentDuration;
        } else if (localT < segmentDuration * 2) {
          // Point 2 -> Point 3
          posStart = new THREE.Vector3(24.57, 38.2, -0.19);
          posEnd = new THREE.Vector3(26.07, 17.55, -0.26);
          rotStart = new THREE.Euler(toRad(-98), toRad(86), toRad(98));
          rotEnd = new THREE.Euler(toRad(-98), toRad(86), toRad(98));
          alpha = (localT - segmentDuration) / segmentDuration;
        } else {
          // Point 3 -> Point 4
          posStart = new THREE.Vector3(26.07, 17.55, -0.26);
          posEnd = new THREE.Vector3(-11.47, 15.97, -0.03);
          rotStart = new THREE.Euler(toRad(-98), toRad(86), toRad(98));
          rotEnd = new THREE.Euler(toRad(167), toRad(87), toRad(-167));
          alpha = (localT - segmentDuration * 2) / segmentDuration;
        }
      }

      // Smooth Easing
      const smoothAlpha = THREE.MathUtils.smoothstep(alpha, 0, 1);

      camera.position.lerpVectors(posStart, posEnd, smoothAlpha);

      const qStart = new THREE.Quaternion().setFromEuler(rotStart);
      const qEnd = new THREE.Quaternion().setFromEuler(rotEnd);
      camera.quaternion.slerpQuaternions(qStart, qEnd, smoothAlpha);

      return; // EXIT early so we don't do path logic
    }

    // Reset cinematic state if no longer cinematic
    if (!isCinematic && cinematicFinished) {
      setCinematicFinished(false);
      cinematicTime.current = 0;
    }

    cinematicTime.current = 0;

    if (manualScrub) {
      scrollProgress.current = debugProgress;
    } else {
      const dampFactor = 2.0;
      scrollProgress.current = THREE.MathUtils.lerp(
        scrollProgress.current,
        targetScrollProgress.current,
        delta * dampFactor,
      );
    }

    // Clamp 0-1
    scrollProgress.current = Math.max(0, Math.min(1, scrollProgress.current));

    // Update Camera
    const finalPos = cameraCurve.getPointAt(scrollProgress.current);
    const finalRot = getLerpedRotation(scrollProgress.current);

    camera.position.copy(finalPos);
    camera.quaternion.copy(finalRot);
  });

  return (
    <>
      {cameraMode === "Free" && <OrbitControls makeDefault />}

      <color attach="background" args={["#a1c4fd"]} />

      <Sky
        sunPosition={sunPosition}
        turbidity={turbidity}
        rayleigh={rayleigh}
        mieCoefficient={mieCoefficient}
      />
      <fog attach="fog" args={[fogColor, fogNear, fogFar]} />

      <ambientLight intensity={ambIntensity} color={ambColor} />
      <directionalLight
        castShadow
        position={dirPos}
        intensity={dirIntensity}
        color={dirColor}
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
        <VillagerModel
          name="Villager 4"
          initialPosition={[-25.8, 15, 0]}
          initialRotation={[0, 1.6, 0]}
          modalTitle="Pesan #4"
          modalBody={<SecretNoteFour />}
          onInteract={() => {
            if (onStartCinematic) onStartCinematic();
          }}
        />
        <ChestModel triggerOpen={cinematicFinished} />
        {/* <PathDebugger curve={cameraCurve} /> */}
      </Suspense>

      <Environment preset="sunset" background={false} />

      <EffectComposer disableNormalPass={false} multisampling={4}>
        <SSAO
          radius={ssaoRadius}
          intensity={ssaoIntensity}
          luminanceInfluence={ssaoLumInfluence}
          color={ssaoColor}
        />
        <Bloom
          luminanceThreshold={bloomThreshold}
          intensity={bloomIntensity}
          mipmapBlur
          radius={bloomRadius}
        />
        <ToneMapping
          adaptive={true}
          resolution={256}
          middleGrey={tmMiddleGrey}
          maxLuminance={tmMaxLum}
          averageLuminance={tmAvgLum}
          adaptationRate={1.0}
        />

        <BrightnessContrast brightness={brightness} contrast={contrast} />
      </EffectComposer>
    </>
  );
};

export default Scene;
