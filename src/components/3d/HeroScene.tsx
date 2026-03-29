/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useFrame, useThree } from "@react-three/fiber";
import { Line, Trail } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import type { MotionValue } from "motion/react";

interface HeroAnchor {
  x: MotionValue<number>;
  y: MotionValue<number>;
}

function ndcToWorldAtZ(
  camera: THREE.PerspectiveCamera,
  ndcX: number,
  ndcY: number,
  targetZ: number,
  target: THREE.Vector3
) {
  const point = new THREE.Vector3(ndcX, ndcY, 0.5).unproject(camera);
  const direction = point.sub(camera.position).normalize();
  const distance = (targetZ - camera.position.z) / direction.z;
  target.copy(camera.position).add(direction.multiplyScalar(distance));
  return target;
}

function DataStream({
  radius,
  speed,
  color,
  yOffset,
  introProgress,
  trailWidth = 1.9,
  trailLength = 8,
}: {
  radius: number;
  speed: number;
  color: string;
  yOffset: number;
  introProgress: MotionValue<number>;
  trailWidth?: number;
  trailLength?: number;
}) {
  const ref = useRef<THREE.Group>(null!);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const intro = introProgress.get();
    ref.current.rotation.y = time * speed * (0.88 + intro * 0.3);
    ref.current.rotation.z = Math.sin(time * 0.25 + radius) * (0.035 + intro * 0.015);
    ref.current.position.y = yOffset + Math.sin(time * 0.45 + radius) * 0.04 * (0.35 + intro * 0.4);
  });

  return (
    <group ref={ref} position={[0, yOffset, 0]}>
      <Trail width={trailWidth} length={trailLength} color={new THREE.Color(color)} attenuation={(t) => t * t}>
        <mesh position={[radius, 0, 0]}>
          <sphereGeometry args={[0.045, 16, 16]} />
          <meshBasicMaterial color={color} />
        </mesh>
      </Trail>
    </group>
  );
}

function TransformationRings({ introProgress }: { introProgress: MotionValue<number> }) {
  const ringsRef = useRef<THREE.Group>(null!);
  const ringRefs = useRef<THREE.Mesh[]>([]);
  const ringOpacities = [0.1, 0.068, 0.092];

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const intro = introProgress.get();
    ringsRef.current.rotation.x = Math.sin(time * 0.16) * (0.12 + intro * 0.06);
    ringsRef.current.rotation.z = Math.cos(time * 0.14) * (0.1 + intro * 0.05);
    ringsRef.current.rotation.y = Math.sin(time * 0.09) * 0.08;

    ringRefs.current.forEach((ring, index) => {
      const material = ring.material as THREE.MeshBasicMaterial;
      material.opacity = ringOpacities[index] + intro * (index === 0 ? 0.05 : index === 1 ? 0.025 : 0.03);
    });
  });

  return (
    <group ref={ringsRef}>
      {[1.86, 2.82, 3.55].map((radius, index) => (
        <mesh
          key={radius}
          ref={(node) => {
            if (node) ringRefs.current[index] = node;
          }}
          rotation={[Math.PI / 2.45 + index * 0.08, index * 0.18, index === 1 ? 0.32 : -0.18]}
        >
          <torusGeometry args={[radius, index === 0 ? 0.013 : index === 1 ? 0.011 : 0.01, 16, 160]} />
          <meshBasicMaterial color={index === 1 ? "#3b82f6" : "#10b981"} transparent opacity={ringOpacities[index]} />
        </mesh>
      ))}
    </group>
  );
}

function OrchestrationNodes({ introProgress }: { introProgress: MotionValue<number> }) {
  const nodesRef = useRef<THREE.Group>(null!);

  const nodes = useMemo(() => {
    return Array.from({ length: 10 }).map((_, index) => {
      const angle = (index / 10) * Math.PI * 2;
      const radius = 2.45 + Math.sin(index * 1.7) * 0.72 + 0.7;
      return new THREE.Vector3(
        Math.cos(angle) * radius,
        Math.sin(index * 1.35) * 0.36,
        Math.sin(angle) * radius
      );
    });
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const intro = introProgress.get();
    nodesRef.current.rotation.y = time * (0.035 + intro * 0.018);
    nodesRef.current.rotation.x = Math.sin(time * 0.12) * 0.05;
  });

  return (
    <group ref={nodesRef}>
      {nodes.map((position, index) => (
        <group key={index} position={position}>
          <mesh>
            <octahedronGeometry args={[0.065]} />
            <meshStandardMaterial color="#34d399" emissive="#34d399" emissiveIntensity={0.45} wireframe />
          </mesh>
          <Line
            points={[[0, 0, 0], [-position.x, -position.y, -position.z]]}
            color={index % 3 === 1 ? "#3b82f6" : "#10b981"}
            transparent
            opacity={0.1}
            lineWidth={0.45}
          />
        </group>
      ))}
    </group>
  );
}

function IntelligenceHub({ introProgress }: { introProgress: MotionValue<number> }) {
  const hubRef = useRef<THREE.Group>(null!);
  const shellRef = useRef<THREE.Mesh>(null!);
  const glowRef = useRef<THREE.Mesh>(null!);
  const ringRef = useRef<THREE.Mesh>(null!);
  const lightRef = useRef<THREE.PointLight>(null!);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const intro = introProgress.get();

    hubRef.current.rotation.z = Math.sin(time * 0.11) * 0.035;
    hubRef.current.scale.setScalar(1 + intro * 0.05);

    (shellRef.current.material as THREE.MeshBasicMaterial).opacity = 0.04 + intro * 0.025;
    (glowRef.current.material as THREE.MeshBasicMaterial).opacity = 0.05 + intro * 0.025;
    (ringRef.current.material as THREE.MeshBasicMaterial).opacity = 0.08 + intro * 0.03;
    lightRef.current.intensity = 4.6 + intro * 2.1;

    ringRef.current.rotation.z += 0.001 + intro * 0.00035;
  });

  return (
    <group ref={hubRef}>
      <pointLight ref={lightRef} color="#10b981" intensity={4.6} distance={18} decay={2} />
      <mesh ref={shellRef}>
        <sphereGeometry args={[0.64, 48, 48]} />
        <meshBasicMaterial color="#34d399" transparent opacity={0.04} />
      </mesh>
      <mesh ref={glowRef} position={[0, -0.05, -0.2]}>
        <sphereGeometry args={[0.84, 40, 40]} />
        <meshBasicMaterial color="#10b981" transparent opacity={0.08} />
      </mesh>
      <mesh ref={ringRef} rotation={[Math.PI / 2.35, 0.18, 0.08]}>
        <torusGeometry args={[0.92, 0.012, 18, 180]} />
        <meshBasicMaterial color="#a7f3d0" transparent opacity={0.1} />
      </mesh>
    </group>
  );
}

export function HeroScene({
  heroAnchor,
  heroIntroProgress,
}: {
  heroAnchor: HeroAnchor;
  heroIntroProgress: MotionValue<number>;
}) {
  const { camera } = useThree();
  const rootRef = useRef<THREE.Group>(null!);
  const worldAnchorRef = useRef(new THREE.Vector3(0, 0, 0));

  useFrame((state) => {
    const intro = heroIntroProgress.get();
    const targetRootZ = -intro * 0.24;
    const rootPositionLerp = intro <= 0.02 ? 0.18 : 0.1;

    camera.updateMatrixWorld();
    ndcToWorldAtZ(
      camera as THREE.PerspectiveCamera,
      heroAnchor.x.get(),
      heroAnchor.y.get(),
      targetRootZ,
      worldAnchorRef.current
    );

    rootRef.current.position.x = THREE.MathUtils.lerp(rootRef.current.position.x, worldAnchorRef.current.x, rootPositionLerp);
    rootRef.current.position.y = THREE.MathUtils.lerp(rootRef.current.position.y, worldAnchorRef.current.y - 0.32, rootPositionLerp);
    rootRef.current.position.z = THREE.MathUtils.lerp(rootRef.current.position.z, targetRootZ, intro <= 0.02 ? 0.16 : 0.08);
    rootRef.current.rotation.y = THREE.MathUtils.lerp(rootRef.current.rotation.y, 0, 0.12);
    rootRef.current.rotation.x = THREE.MathUtils.lerp(rootRef.current.rotation.x, 0, 0.12);
  });

  return (
    <group ref={rootRef}>
      <IntelligenceHub introProgress={heroIntroProgress} />
      <TransformationRings introProgress={heroIntroProgress} />
      <OrchestrationNodes introProgress={heroIntroProgress} />

      <DataStream
        radius={1.92}
        speed={1.1}
        color="#3b82f6"
        yOffset={0.36}
        introProgress={heroIntroProgress}
        trailWidth={2.55}
        trailLength={11}
      />
      <DataStream
        radius={2.88}
        speed={-0.78}
        color="#8b5cf6"
        yOffset={0.02}
        introProgress={heroIntroProgress}
        trailWidth={1.8}
        trailLength={8}
      />
      <DataStream radius={3.42} speed={0.48} color="#f59e0b" yOffset={0.72} introProgress={heroIntroProgress} />
      <DataStream radius={4.25} speed={1.32} color="#10b981" yOffset={-0.28} introProgress={heroIntroProgress} />
    </group>
  );
}
