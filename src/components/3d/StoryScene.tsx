/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useFrame, useThree } from "@react-three/fiber";
import { useScroll, Float, Stars, Sparkles } from "@react-three/drei";
import { useRef } from "react";
import * as THREE from "three";
import { HeroScene } from "./HeroScene";
import { SDEScene, DEScene, DSScene } from "./ProjectScenes";
import { EffectComposer, Bloom, ChromaticAberration } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
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

export function StoryScene({
  heroAnchor,
  heroIntroProgress,
}: {
  heroAnchor: HeroAnchor;
  heroIntroProgress: MotionValue<number>;
}) {
  const scroll = useScroll();
  const { camera } = useThree();
  const group = useRef<THREE.Group>(null!);
  const heroAnchorRef = useRef(new THREE.Vector3(0, 0, 0));

  useFrame((state) => {
    const offset = scroll.offset;
    const introProgress = heroIntroProgress.get();
    const heroReset = introProgress <= 0.02;
    const effectiveOffset = heroReset ? 0 : offset;
    const targetZ = -effectiveOffset * 160;
    const heroLock = heroReset ? 1 : 1 - THREE.MathUtils.smoothstep(introProgress, 0.72, 0.96);
    const heroDepth = heroReset ? 0 : THREE.MathUtils.smoothstep(introProgress, 0.04, 0.78);
    const cameraLerp = heroReset ? 0.16 : 0.05;
    const rollLerp = heroReset ? 0.12 : 0.04;

    ndcToWorldAtZ(
      camera as THREE.PerspectiveCamera,
      heroAnchor.x.get(),
      heroAnchor.y.get(),
      0,
      heroAnchorRef.current
    );

    const heroPushIn = heroDepth * 0.8;
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ + 5 - heroPushIn, cameraLerp);

    const mouseX = state.pointer.x;
    const mouseY = state.pointer.y;
    const heroCameraX = 0;
    const heroCameraY = 0;
    const storyCameraX = Math.sin(effectiveOffset * Math.PI * 2) * 4 + mouseX * 2;
    const storyCameraY = Math.cos(effectiveOffset * Math.PI * 2) * 2 + mouseY * 2;

    camera.position.x = THREE.MathUtils.lerp(
      camera.position.x,
      THREE.MathUtils.lerp(storyCameraX, heroCameraX, heroLock),
      cameraLerp
    );
    camera.position.y = THREE.MathUtils.lerp(
      camera.position.y,
      THREE.MathUtils.lerp(storyCameraY, heroCameraY, heroLock),
      cameraLerp
    );

    const lookAtZ = targetZ - 20;
    const lookAtX = THREE.MathUtils.lerp(camera.position.x * 0.16, heroAnchorRef.current.x * 0.2, heroLock);
    const lookAtY = THREE.MathUtils.lerp(camera.position.y * 0.16, heroAnchorRef.current.y * 0.26, heroLock);
    camera.lookAt(lookAtX, lookAtY, lookAtZ);

    const storyRoll = Math.sin(effectiveOffset * Math.PI * 0.8) * 0.015;
    group.current.rotation.z = THREE.MathUtils.lerp(
      group.current.rotation.z,
      THREE.MathUtils.lerp(storyRoll, 0, heroLock),
      rollLerp
    );
  });

  return (
    <>
      <fog attach="fog" args={["#000000", 5, 40]} />
      <Stars radius={50} depth={150} count={5000} factor={4} saturation={0} fade speed={2} />
      <Sparkles count={2000} scale={[30, 30, 150]} position={[0, 0, -75]} size={2} speed={0.4} opacity={0.2} color="#10b981" />

      <group ref={group}>
        <group position={[0, 0, 0]}>
          <HeroScene heroAnchor={heroAnchor} heroIntroProgress={heroIntroProgress} />
        </group>

        <group position={[5, 0, -40]}>
          <Float speed={2} rotationIntensity={2} floatIntensity={2}>
            <mesh>
              <icosahedronGeometry args={[3, 1]} />
              <meshStandardMaterial color="#10b981" wireframe transparent opacity={0.2} />
            </mesh>
          </Float>
        </group>

        <group position={[-5, 1, -80]}>
          <SDEScene />
        </group>

        <group position={[5, -1, -100]}>
          <DEScene />
        </group>

        <group position={[-4, 2, -120]}>
          <DSScene />
        </group>

        <group position={[0, 0, -170]}>
          <pointLight color="#10b981" intensity={100} distance={50} />
          <mesh>
            <sphereGeometry args={[5, 64, 64]} />
            <meshBasicMaterial color="#10b981" />
          </mesh>
        </group>
      </group>

      <EffectComposer>
        <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} height={300} intensity={1.5} />
        <ChromaticAberration offset={new THREE.Vector2(0.002, 0.002)} blendFunction={BlendFunction.NORMAL} />
      </EffectComposer>
    </>
  );
}
