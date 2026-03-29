/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useFrame } from "@react-three/fiber";
import { useRef, useMemo, useState } from "react";
import * as THREE from "three";
import { Float, MeshDistortMaterial, Sphere, Line, Trail } from "@react-three/drei";

function DataStream({ radius, speed, color, yOffset }: { radius: number, speed: number, color: string, yOffset: number }) {
  const ref = useRef<THREE.Group>(null!);
  
  useFrame((state) => {
    ref.current.rotation.y = state.clock.getElapsedTime() * speed;
  });

  return (
    <group ref={ref} position={[0, yOffset, 0]}>
      <Trail
        width={2}
        length={8}
        color={new THREE.Color(color)}
        attenuation={(t) => t * t}
      >
        <mesh position={[radius, 0, 0]}>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshBasicMaterial color={color} />
        </mesh>
      </Trail>
    </group>
  );
}

function TransformationRings() {
  const ringsRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    ringsRef.current.rotation.x = Math.sin(time * 0.2) * 0.2;
    ringsRef.current.rotation.z = Math.cos(time * 0.2) * 0.2;
  });

  return (
    <group ref={ringsRef}>
      {[1.5, 2.2, 3].map((radius, i) => (
        <mesh key={i} rotation-x={Math.PI / 2}>
          <torusGeometry args={[radius, 0.01, 16, 100]} />
          <meshBasicMaterial color="#10b981" transparent opacity={0.1 + (i * 0.05)} />
        </mesh>
      ))}
    </group>
  );
}

function OrchestrationNodes() {
  const nodesRef = useRef<THREE.Group>(null!);
  
  const nodes = useMemo(() => {
    return Array.from({ length: 12 }).map((_, i) => {
      const angle = (i / 12) * Math.PI * 2;
      const radius = 2.5 + Math.random() * 1.5;
      return new THREE.Vector3(
        Math.cos(angle) * radius,
        (Math.random() - 0.5) * 2,
        Math.sin(angle) * radius
      );
    });
  }, []);

  useFrame((state) => {
    nodesRef.current.rotation.y = state.clock.getElapsedTime() * 0.05;
  });

  return (
    <group ref={nodesRef}>
      {nodes.map((pos, i) => (
        <group key={i} position={pos}>
          <mesh>
            <octahedronGeometry args={[0.08]} />
            <meshStandardMaterial color="#34d399" emissive="#34d399" emissiveIntensity={0.5} wireframe />
          </mesh>
          {/* Connection to center */}
          <Line
            points={[[0, 0, 0], [-pos.x, -pos.y, -pos.z]]}
            color="#10b981"
            transparent
            opacity={0.1}
            lineWidth={0.5}
          />
        </group>
      ))}
    </group>
  );
}

function IntelligenceCore() {
  const coreRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHover] = useState(false);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const targetScale = hovered ? 1.1 : 1 + Math.sin(time * 3) * 0.02;
    const currentScale = coreRef.current.scale.x;
    coreRef.current.scale.setScalar(THREE.MathUtils.lerp(currentScale, targetScale, 0.1));
    coreRef.current.rotation.y += 0.01;
    coreRef.current.rotation.x += 0.005;
  });

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.2}>
      <Sphere 
        ref={coreRef} 
        args={[0.8, 64, 64]}
        onPointerOver={() => setHover(true)}
        onPointerOut={() => setHover(false)}
      >
        <MeshDistortMaterial
          color={hovered ? "#10b981" : "#059669"}
          emissive={hovered ? "#059669" : "#064e3b"}
          distort={hovered ? 0.4 : 0.2}
          speed={hovered ? 3 : 1}
          roughness={0.2}
          metalness={0.8}
          wireframe={hovered}
        />
      </Sphere>
      
      {/* Inner glowing core */}
      <Sphere args={[0.4, 32, 32]}>
        <meshBasicMaterial color="#34d399" />
      </Sphere>
    </Float>
  );
}

export function HeroScene() {
  return (
    <group>
      <IntelligenceCore />
      <TransformationRings />
      <OrchestrationNodes />
      
      {/* Ingestion Streams */}
      <DataStream radius={1.5} speed={1.2} color="#3b82f6" yOffset={0.5} />
      <DataStream radius={2.2} speed={-0.8} color="#8b5cf6" yOffset={-0.2} />
      <DataStream radius={3.0} speed={0.5} color="#f59e0b" yOffset={0.8} />
      
      {/* Output Stream */}
      <DataStream radius={4.0} speed={1.5} color="#10b981" yOffset={-0.5} />
    </group>
  );
}
