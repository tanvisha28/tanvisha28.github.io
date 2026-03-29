/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useFrame } from "@react-three/fiber";
import { useRef, useMemo } from "react";
import * as THREE from "three";
import { Float, MeshDistortMaterial, Sphere, Box, Torus, Line, Trail } from "@react-three/drei";

// AI Workflow / Agentic Systems (formerly SDE)
export function SDEScene() {
  const group = useRef<THREE.Group>(null!);

  const nodes = useMemo(() => {
    return [
      new THREE.Vector3(-2, 1, 0), // Input
      new THREE.Vector3(0, 2, -1), // LLM Node 1
      new THREE.Vector3(0, 0, 1),  // Tool Node
      new THREE.Vector3(2, 1, 0),  // Output
      new THREE.Vector3(0, -1.5, 0) // Memory/Context
    ];
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    group.current.rotation.y = Math.sin(time * 0.2) * 0.3;
  });

  return (
    <group ref={group}>
      {/* Nodes */}
      {nodes.map((pos, i) => (
        <Float key={i} speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
          <mesh position={pos}>
            <octahedronGeometry args={[0.4]} />
            <meshStandardMaterial 
              color={i === 1 ? "#8b5cf6" : "#3b82f6"} 
              emissive={i === 1 ? "#6d28d9" : "#1d4ed8"} 
              emissiveIntensity={0.8} 
              wireframe={i !== 1}
            />
          </mesh>
        </Float>
      ))}
      
      {/* Orchestration Paths */}
      <Line points={[nodes[0], nodes[1]]} color="#3b82f6" transparent opacity={0.4} lineWidth={1} />
      <Line points={[nodes[0], nodes[2]]} color="#3b82f6" transparent opacity={0.4} lineWidth={1} />
      <Line points={[nodes[1], nodes[3]]} color="#8b5cf6" transparent opacity={0.6} lineWidth={2} />
      <Line points={[nodes[2], nodes[3]]} color="#3b82f6" transparent opacity={0.4} lineWidth={1} />
      <Line points={[nodes[1], nodes[4]]} color="#6366f1" transparent opacity={0.3} lineWidth={1} dashed />
      <Line points={[nodes[2], nodes[4]]} color="#6366f1" transparent opacity={0.3} lineWidth={1} dashed />

      {/* Active Signal */}
      <Trail width={2} length={4} color={new THREE.Color("#60a5fa")} attenuation={(t) => t * t}>
        <SignalPath path={[nodes[0], nodes[1], nodes[3]]} speed={0.5} />
      </Trail>
    </group>
  );
}

function SignalPath({ path, speed }: { path: THREE.Vector3[], speed: number }) {
  const ref = useRef<THREE.Mesh>(null!);
  const curve = useMemo(() => new THREE.CatmullRomCurve3(path), [path]);

  useFrame((state) => {
    const t = (state.clock.getElapsedTime() * speed) % 1;
    const pos = curve.getPoint(t);
    ref.current.position.copy(pos);
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.1, 8, 8]} />
      <meshBasicMaterial color="#60a5fa" />
    </mesh>
  );
}

// Data Engineering: Pipelines, DAGs, Layers
export function DEScene() {
  const group = useRef<THREE.Group>(null!);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    group.current.rotation.y = time * 0.05;
    group.current.rotation.x = Math.sin(time * 0.1) * 0.1;
  });

  return (
    <group ref={group}>
      {/* Medallion Architecture Layers */}
      <Float speed={1} rotationIntensity={0.1} floatIntensity={0.2}>
        {/* Bronze / Raw */}
        <mesh position={[0, -1.5, 0]} rotation-x={Math.PI / 2}>
          <cylinderGeometry args={[2.5, 2.5, 0.1, 32]} />
          <meshStandardMaterial color="#b45309" transparent opacity={0.2} wireframe />
        </mesh>
        
        {/* Silver / Clean */}
        <mesh position={[0, 0, 0]} rotation-x={Math.PI / 2}>
          <cylinderGeometry args={[2, 2, 0.1, 32]} />
          <meshStandardMaterial color="#94a3b8" transparent opacity={0.3} wireframe />
        </mesh>

        {/* Gold / Serve */}
        <mesh position={[0, 1.5, 0]} rotation-x={Math.PI / 2}>
          <cylinderGeometry args={[1.5, 1.5, 0.1, 32]} />
          <meshStandardMaterial color="#fbbf24" transparent opacity={0.4} wireframe />
        </mesh>
      </Float>

      {/* Pipeline Data Flow */}
      {Array.from({ length: 15 }).map((_, i) => (
        <PipelineParticle key={i} delay={i * 0.3} />
      ))}
    </group>
  );
}

function PipelineParticle({ delay = 0 }) {
  const mesh = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    const time = (state.clock.getElapsedTime() + delay) * 0.5;
    const t = time % 3; // 3 stages
    
    // Move up through the layers
    if (t < 1) {
      // Bronze to Silver
      mesh.current.position.y = THREE.MathUtils.lerp(-1.5, 0, t);
      mesh.current.position.x = Math.cos(time * 5) * 2;
      mesh.current.position.z = Math.sin(time * 5) * 2;
      (mesh.current.material as THREE.MeshBasicMaterial).color.setHex(0xb45309);
    } else if (t < 2) {
      // Silver to Gold
      mesh.current.position.y = THREE.MathUtils.lerp(0, 1.5, t - 1);
      mesh.current.position.x = Math.cos(time * 5) * 1.5;
      mesh.current.position.z = Math.sin(time * 5) * 1.5;
      (mesh.current.material as THREE.MeshBasicMaterial).color.setHex(0x94a3b8);
    } else {
      // Gold output
      mesh.current.position.y = 1.5 + (t - 2);
      mesh.current.position.x = Math.cos(time * 2) * 1;
      mesh.current.position.z = Math.sin(time * 2) * 1;
      (mesh.current.material as THREE.MeshBasicMaterial).color.setHex(0xfbbf24);
    }
  });

  return (
    <mesh ref={mesh}>
      <boxGeometry args={[0.1, 0.1, 0.1]} />
      <meshBasicMaterial color="#b45309" />
    </mesh>
  );
}

// Data Science: Embeddings, Clusters, Anomalies
export function DSScene() {
  const group = useRef<THREE.Group>(null!);

  // Generate clustered points
  const points = useMemo(() => {
    const p = [];
    // Cluster 1
    for (let i = 0; i < 40; i++) {
      p.push({
        pos: new THREE.Vector3((Math.random() - 0.5) * 2 - 1.5, (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2),
        color: "#8b5cf6",
        isAnomaly: false
      });
    }
    // Cluster 2
    for (let i = 0; i < 40; i++) {
      p.push({
        pos: new THREE.Vector3((Math.random() - 0.5) * 2 + 1.5, (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2),
        color: "#c084fc",
        isAnomaly: false
      });
    }
    // Anomalies
    for (let i = 0; i < 5; i++) {
      p.push({
        pos: new THREE.Vector3((Math.random() - 0.5) * 6, (Math.random() - 0.5) * 6, (Math.random() - 0.5) * 6),
        color: "#ef4444",
        isAnomaly: true
      });
    }
    return p;
  }, []);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    group.current.rotation.y = time * 0.05;
    group.current.rotation.z = Math.sin(time * 0.05) * 0.1;
  });

  return (
    <group ref={group}>
      {/* Decision Boundary Surface */}
      <Float speed={1} rotationIntensity={0.2} floatIntensity={0.2}>
        <mesh rotation-x={Math.PI / 2} position={[0, 0, 0]}>
          <planeGeometry args={[6, 6, 16, 16]} />
          <MeshDistortMaterial color="#4c1d95" distort={0.2} speed={1} transparent opacity={0.1} wireframe />
        </mesh>
      </Float>

      {/* Data Points */}
      {points.map((p, i) => (
        <DataPoint key={i} data={p} />
      ))}
    </group>
  );
}

function DataPoint({ data }: { data: { pos: THREE.Vector3, color: string, isAnomaly: boolean } }) {
  const mesh = useRef<THREE.Mesh>(null!);
  
  useFrame((state) => {
    if (data.isAnomaly) {
      const time = state.clock.getElapsedTime();
      const scale = 1 + Math.sin(time * 5 + data.pos.x) * 0.5;
      mesh.current.scale.setScalar(scale);
    }
  });

  return (
    <mesh ref={mesh} position={data.pos}>
      <sphereGeometry args={[data.isAnomaly ? 0.08 : 0.04, 8, 8]} />
      <meshBasicMaterial color={data.color} />
    </mesh>
  );
}
