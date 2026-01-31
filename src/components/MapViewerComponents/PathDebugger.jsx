import React from "react";

const PathDebugger = ({ curve }) => {
  const points = curve.getPoints(50);
  return (
    <line>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={points.length}
          array={new Float32Array(points.flatMap((p) => [p.x, p.y, p.z]))}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial color="red" />
    </line>
  );
};

export default PathDebugger;
