import React, { useEffect } from "react";
import { useGLTF } from "@react-three/drei";

function MapModel() {
  const { scene } = useGLTF("/3d/mapMc.glb");

  useEffect(() => {
    if (!scene) return;
    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material) {
          child.material.transparent = true;
          child.material.alphaTest = 0.5;
          child.material.side = 2;
          if (child.material.envMapIntensity === undefined)
            child.material.envMapIntensity = 1;
          child.material.needsUpdate = true;
        }
      }
    });
  }, [scene]);

  return <primitive object={scene} />;
}

export default MapModel;
