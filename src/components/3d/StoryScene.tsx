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

export function StoryScene() {
  const scroll = useScroll();
  const { camera } = useThree();
  const group = useRef<THREE.Group>(null!);

  useFrame((state) => {
    // scroll.offset goes from 0 to 1
    const offset = scroll.offset;
    const targetZ = -offset * 160; // Total depth 160

    // Smooth camera movement forward
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ + 5, 0.05);

    // Sway based on mouse and scroll
    const mouseX = state.pointer.x;
    const mouseY = state.pointer.y;

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, Math.sin(offset * Math.PI * 2) * 4 + mouseX * 2, 0.05);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, Math.cos(offset * Math.PI * 2) * 2 + mouseY * 2, 0.05);

    // Look slightly ahead
    const lookAtZ = targetZ - 20;
    camera.lookAt(camera.position.x * 0.2, camera.position.y * 0.2, lookAtZ);
  });

  return (
    <>
      <fog attach="fog" args={["#000000", 5, 40]} />
      <Stars radius={50} depth={150} count={5000} factor={4} saturation={0} fade speed={2} />
      <Sparkles count={2000} scale={[30, 30, 150]} position={[0, 0, -75]} size={2} speed={0.4} opacity={0.2} color="#10b981" />

      <group ref={group}>
        {/* Page 1: Hero (Z=0) */}
        <group position={[0, 0, 0]}>
          <HeroScene />
        </group>

        {/* Page 3: Skills (Z=-40) */}
        <group position={[5, 0, -40]}>
           <Float speed={2} rotationIntensity={2} floatIntensity={2}>
             <mesh>
               <icosahedronGeometry args={[3, 1]} />
               <meshStandardMaterial color="#10b981" wireframe transparent opacity={0.2} />
             </mesh>
           </Float>
        </group>

        {/* Page 5: AI Project (Z=-80) */}
        <group position={[-5, 1, -80]}>
          <SDEScene />
        </group>

        {/* Page 6: DE Project (Z=-100) */}
        <group position={[5, -1, -100]}>
          <DEScene />
        </group>

        {/* Page 7: DS Project (Z=-120) */}
        <group position={[-4, 2, -120]}>
          <DSScene />
        </group>

        {/* Page 9: End Core (Z=-160) */}
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
