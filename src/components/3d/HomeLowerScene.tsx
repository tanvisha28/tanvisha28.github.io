import { useFrame, useThree } from "@react-three/fiber";
import { useScroll } from "@react-three/drei";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import {
  homeSceneData,
  homeSceneTuning,
  type HomeSceneRanges,
  type SceneFramePlane,
  type SceneHalo,
  type SceneTone,
  type SectionRange,
} from "../../data/homeSceneData";

const TONE_COLORS: Record<SceneTone, string> = {
  emerald: "#34d399",
  blue: "#38bdf8",
  amber: "#fbbf24",
};

const TONE_RGB: Record<SceneTone, string> = {
  emerald: "52,211,153",
  blue: "56,189,248",
  amber: "251,191,36",
};

type OpacityMaterial = THREE.Material & { opacity: number; transmission?: number };

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

function drawRoundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  const boundedRadius = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + boundedRadius, y);
  context.lineTo(x + width - boundedRadius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + boundedRadius);
  context.lineTo(x + width, y + height - boundedRadius);
  context.quadraticCurveTo(x + width, y + height, x + width - boundedRadius, y + height);
  context.lineTo(x + boundedRadius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - boundedRadius);
  context.lineTo(x, y + boundedRadius);
  context.quadraticCurveTo(x, y, x + boundedRadius, y);
  context.closePath();
}

function getRangePresence(offset: number, range: SectionRange, feather = 0.08) {
  const fadeIn = THREE.MathUtils.smoothstep(
    offset,
    Math.max(0, range.start - feather),
    Math.min(1, range.start + feather)
  );
  const fadeOut = 1 - THREE.MathUtils.smoothstep(
    offset,
    Math.max(0, range.end - feather),
    Math.min(1, range.end + feather)
  );
  return clamp01(fadeIn * fadeOut);
}

function getRangeDepth(range: SectionRange, bias = 0) {
  return -((range.start + range.end) / 2) * 160 + bias;
}

function createLabelTexture(label: string, tone: SceneTone) {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 168;

  const context = canvas.getContext("2d");
  if (!context) {
    const fallbackTexture = new THREE.CanvasTexture(canvas);
    return { texture: fallbackTexture, aspect: canvas.width / canvas.height };
  }

  const toneRgb = TONE_RGB[tone];
  context.clearRect(0, 0, canvas.width, canvas.height);

  drawRoundedRect(context, 8, 24, canvas.width - 16, canvas.height - 48, 30);
  context.fillStyle = "rgba(2, 8, 10, 0.5)";
  context.fill();
  context.strokeStyle = `rgba(${toneRgb}, 0.16)`;
  context.lineWidth = 2;
  context.stroke();

  context.beginPath();
  context.moveTo(60, canvas.height / 2);
  context.lineTo(178, canvas.height / 2);
  context.lineWidth = 3;
  context.strokeStyle = `rgba(${toneRgb}, 0.55)`;
  context.stroke();

  context.beginPath();
  context.arc(42, canvas.height / 2, 8, 0, Math.PI * 2);
  context.fillStyle = `rgba(${toneRgb}, 0.95)`;
  context.fill();

  context.font = "600 48px system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
  context.textAlign = "left";
  context.textBaseline = "middle";
  context.fillStyle = "rgba(244, 246, 247, 0.96)";
  context.fillText(label.toUpperCase(), 214, canvas.height / 2 + 2);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.generateMipmaps = false;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return { texture, aspect: canvas.width / canvas.height };
}

function useMaterialRegistry() {
  const materialsRef = useRef<OpacityMaterial[]>([]);

  const registerMaterial = useCallback((material: OpacityMaterial | null) => {
    if (!material || materialsRef.current.includes(material)) return;
    material.transparent = true;
    material.userData.baseOpacity = material.opacity;
    if ("transmission" in material) {
      material.userData.baseTransmission = (material as THREE.MeshPhysicalMaterial).transmission;
    }
    materialsRef.current.push(material);
  }, []);

  return { materialsRef, registerMaterial };
}

function setRegisteredOpacity(materials: OpacityMaterial[], opacity: number) {
  const alpha = clamp01(opacity);
  materials.forEach((material) => {
    material.opacity = ((material.userData.baseOpacity as number | undefined) ?? 1) * alpha;
    if ("transmission" in material) {
      (material as THREE.MeshPhysicalMaterial).transmission =
        ((material.userData.baseTransmission as number | undefined) ?? 0) * alpha;
    }
  });
}

function useReducedMotionPreference() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReducedMotion(mediaQuery.matches);
    sync();
    mediaQuery.addEventListener("change", sync);
    return () => mediaQuery.removeEventListener("change", sync);
  }, []);

  return reducedMotion;
}

function useSceneProfile() {
  const { size } = useThree();
  const reducedMotion = useReducedMotionPreference();

  return useMemo(() => {
    const simplified = reducedMotion || size.width < homeSceneTuning.mobileBreakpoint;
    const tablet = !simplified && size.width < homeSceneTuning.tabletBreakpoint;

    return {
      projectLanes: simplified ? 2 : tablet ? 3 : homeSceneData.projects.lanes.length,
      projectCallouts: simplified ? 0 : tablet ? 3 : 6,
      projectNodes: simplified ? 2 : tablet ? 3 : homeSceneData.projects.nodes.length,
      packetsPerLane: simplified ? 1 : tablet ? 2 : 3,
      experienceCallouts: simplified ? 0 : tablet ? 2 : 4,
      experienceNodes: simplified ? 4 : tablet ? 5 : homeSceneData.experience.nodes.length,
      experienceConnections: simplified ? 4 : tablet ? 6 : homeSceneData.experience.connections.length,
      experiencePacketsPerRail: simplified ? 0 : tablet ? 1 : 2,
      contactParticles: simplified ? 5 : tablet ? 7 : homeSceneData.contact.particles.length,
      simplified,
      tablet,
    };
  }, [reducedMotion, size.width]);
}

function LabelSprite({
  label,
  position,
  tone,
  registerMaterial,
}: {
  label: string;
  position: [number, number, number];
  tone: SceneTone;
  registerMaterial: (material: OpacityMaterial | null) => void;
}) {
  const { texture, aspect } = useMemo(() => createLabelTexture(label, tone), [label, tone]);

  useEffect(() => () => texture.dispose(), [texture]);

  return (
    <sprite position={position} scale={[aspect * 0.35, 0.35, 1]} renderOrder={2}>
      <spriteMaterial
        ref={registerMaterial}
        map={texture}
        transparent
        opacity={0.82}
        depthWrite={false}
        toneMapped={false}
      />
    </sprite>
  );
}

function SignalHalo({
  halo,
  registerMaterial,
}: {
  halo: SceneHalo;
  registerMaterial: (material: OpacityMaterial | null) => void;
}) {
  const rotorRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    if (!rotorRef.current) return;
    rotorRef.current.rotation.z = Math.sin(state.clock.getElapsedTime() * 0.08) * 0.08;
  });

  return (
    <group position={halo.position} rotation={halo.rotation}>
      <group ref={rotorRef}>
        <mesh>
          <ringGeometry args={[halo.radius, halo.radius + 0.03, 96]} />
          <meshBasicMaterial
            ref={registerMaterial}
            color={TONE_COLORS[halo.tone]}
            transparent
            opacity={0.14}
            side={THREE.DoubleSide}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 5]}>
          <ringGeometry args={[halo.radius * 0.72, halo.radius * 0.72 + 0.018, 96]} />
          <meshBasicMaterial
            ref={registerMaterial}
            color={TONE_COLORS[halo.tone]}
            transparent
            opacity={0.08}
            side={THREE.DoubleSide}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
        <mesh>
          <circleGeometry args={[halo.radius * 0.92, 48]} />
          <meshBasicMaterial
            ref={registerMaterial}
            color={TONE_COLORS[halo.tone]}
            transparent
            opacity={0.025}
            side={THREE.DoubleSide}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      </group>
    </group>
  );
}

function TierPlate({
  position,
  size,
  tone,
  registerMaterial,
}: {
  position: readonly [number, number, number];
  size: readonly [number, number, number];
  tone: SceneTone;
  registerMaterial: (material: OpacityMaterial | null) => void;
}) {
  return (
    <group position={position as [number, number, number]}>
      <mesh>
        <boxGeometry args={size as [number, number, number]} />
        <meshPhysicalMaterial
          ref={registerMaterial}
          color={TONE_COLORS[tone]}
          metalness={0.08}
          roughness={0.12}
          transmission={0.52}
          thickness={0.34}
          ior={1.24}
          transparent
          opacity={0.18}
        />
      </mesh>
      <mesh scale={[1.012, 1.08, 1.012]}>
        <boxGeometry args={size as [number, number, number]} />
        <meshBasicMaterial
          ref={registerMaterial}
          color={TONE_COLORS[tone]}
          wireframe
          transparent
          opacity={0.08}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

function GlassNode({
  position,
  size,
  tone,
  registerMaterial,
}: {
  position: readonly [number, number, number];
  size: number;
  tone: SceneTone;
  registerMaterial: (material: OpacityMaterial | null) => void;
}) {
  const shellRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    if (!shellRef.current) return;
    const elapsed = state.clock.getElapsedTime();
    shellRef.current.rotation.x = elapsed * 0.12;
    shellRef.current.rotation.y = elapsed * 0.16;
  });

  return (
    <group position={position as [number, number, number]}>
      <mesh ref={shellRef}>
        <icosahedronGeometry args={[size, 1]} />
        <meshPhysicalMaterial
          ref={registerMaterial}
          color={TONE_COLORS[tone]}
          metalness={0.05}
          roughness={0.08}
          transmission={0.7}
          thickness={size * 1.2}
          ior={1.35}
          transparent
          opacity={0.4}
        />
      </mesh>
      <mesh scale={0.42}>
        <icosahedronGeometry args={[size, 0]} />
        <meshBasicMaterial
          ref={registerMaterial}
          color={TONE_COLORS[tone]}
          transparent
          opacity={0.9}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

function WireLatticePlane({
  plane,
  registerMaterial,
}: {
  plane: SceneFramePlane;
  registerMaterial: (material: OpacityMaterial | null) => void;
}) {
  const wobbleRef = useRef<THREE.Group>(null!);

  const verticalOffsets = useMemo(
    () => Array.from({ length: 6 }, (_, index) => (index / 5 - 0.5) * plane.size[0]),
    [plane.size]
  );
  const horizontalOffsets = useMemo(
    () => Array.from({ length: 4 }, (_, index) => (index / 3 - 0.5) * plane.size[1]),
    [plane.size]
  );

  useFrame((state) => {
    if (!wobbleRef.current) return;
    wobbleRef.current.rotation.z = Math.sin(state.clock.getElapsedTime() * 0.05) * 0.045;
  });

  return (
    <group position={plane.position} rotation={plane.rotation}>
      <group ref={wobbleRef}>
        <mesh>
          <planeGeometry args={plane.size as [number, number]} />
          <meshBasicMaterial
            ref={registerMaterial}
            color={TONE_COLORS[plane.tone]}
            transparent
            opacity={0.02}
            side={THREE.DoubleSide}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
        {verticalOffsets.map((offset) => (
          <mesh key={`v-${offset}`} position={[offset, 0, 0.002]}>
            <planeGeometry args={[0.018, plane.size[1]]} />
            <meshBasicMaterial
              ref={registerMaterial}
              color={TONE_COLORS[plane.tone]}
              transparent
              opacity={0.055}
              side={THREE.DoubleSide}
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>
        ))}
        {horizontalOffsets.map((offset) => (
          <mesh key={`h-${offset}`} position={[0, offset, 0.002]}>
            <planeGeometry args={[plane.size[0], 0.018]} />
            <meshBasicMaterial
              ref={registerMaterial}
              color={TONE_COLORS[plane.tone]}
              transparent
              opacity={0.05}
              side={THREE.DoubleSide}
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function ProjectsDataCosmos({
  ranges,
  profile,
}: {
  ranges: HomeSceneRanges;
  profile: ReturnType<typeof useSceneProfile>;
}) {
  const scroll = useScroll();
  const rootRef = useRef<THREE.Group>(null!);
  const packetRefs = useRef<Array<THREE.Mesh | null>>([]);
  const tempPointRef = useRef(new THREE.Vector3());
  const tempTangentRef = useRef(new THREE.Vector3());
  const tempLookRef = useRef(new THREE.Vector3());

  const rails = useMemo(
    () =>
      homeSceneData.projects.lanes.slice(0, profile.projectLanes).map((lane) => ({
        ...lane,
        curve: new THREE.CatmullRomCurve3(lane.points.map(([x, y, z]) => new THREE.Vector3(x, y, z))),
      })),
    [profile.projectLanes]
  );

  const packetMeta = useMemo(
    () =>
      rails.flatMap((lane) => {
        const packetCount = Math.max(1, profile.packetsPerLane - (lane.emphasis === "support" ? 1 : 0));
        return lane.packetOffsets.slice(0, packetCount).map((offset) => ({
          curve: lane.curve,
          tone: lane.tone,
          offset,
          speed: lane.packetSpeed,
          emphasis: lane.emphasis ?? "primary",
        }));
      }),
    [profile.packetsPerLane, rails]
  );

  const visibleNodes = useMemo(
    () => homeSceneData.projects.nodes.slice(0, profile.projectNodes),
    [profile.projectNodes]
  );
  const visibleLabels = useMemo(
    () => homeSceneData.projects.labels.slice(0, profile.projectCallouts),
    [profile.projectCallouts]
  );
  const anchorZ = useMemo(() => getRangeDepth(ranges.projects, 0), [ranges.projects.end, ranges.projects.start]);
  const [focusX, focusY, focusZ] = homeSceneData.projects.focalOffset;

  const { materialsRef: sceneMaterials, registerMaterial: registerSceneMaterial } = useMaterialRegistry();
  const { materialsRef: uiMaterials, registerMaterial: registerUiMaterial } = useMaterialRegistry();

  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime();
    const presence = getRangePresence(scroll.offset, ranges.projects, 0.055);
    const calm = THREE.MathUtils.smoothstep(
      scroll.offset,
      Math.max(0, ranges.contact.start - 0.1),
      Math.min(1, ranges.contact.start + 0.02)
    );
    const alpha = presence * (1 - calm * 0.82);

    // Provide a consistent "rise from bottom and deep space" entrance
    const yEntrance = -(1 - presence) * 8;
    const zEntrance = -(1 - presence) * 6;

    rootRef.current.visible = alpha > 0.01;
    rootRef.current.position.set(focusX, focusY + yEntrance, anchorZ + focusZ + zEntrance);
    rootRef.current.rotation.x = THREE.MathUtils.lerp(rootRef.current.rotation.x, -0.06, 0.04);
    rootRef.current.rotation.y = THREE.MathUtils.lerp(
      rootRef.current.rotation.y,
      Math.sin(elapsed * 0.06) * 0.035,
      0.04
    );
    rootRef.current.scale.setScalar(0.95 + presence * 0.05);

    setRegisteredOpacity(sceneMaterials.current, alpha);
    setRegisteredOpacity(uiMaterials.current, alpha * 0.92);

    packetRefs.current.forEach((packetMesh, index) => {
      if (!packetMesh) return;
      const packet = packetMeta[index];
      const t = (packet.offset + elapsed * packet.speed) % 1;
      packet.curve.getPoint(t, tempPointRef.current);
      packet.curve.getTangent(t, tempTangentRef.current);
      packetMesh.position.copy(tempPointRef.current);
      tempLookRef.current.copy(tempPointRef.current).add(tempTangentRef.current);
      packetMesh.lookAt(tempLookRef.current);

      const material = packetMesh.material as THREE.MeshBasicMaterial;
      material.opacity = alpha * (packet.emphasis === "support" ? 0.28 : 0.62);
    });
  });

  return (
    <group ref={rootRef}>
      {homeSceneData.projects.halos.map((halo) => (
        <SignalHalo
          key={`${halo.position.join(":")}-${halo.radius}`}
          halo={halo}
          registerMaterial={registerSceneMaterial}
        />
      ))}

      {homeSceneData.projects.tierPlanes.map((plane) => (
        <TierPlate
          key={`${plane.position.join(":")}-${plane.tone}`}
          position={plane.position}
          size={plane.size}
          tone={plane.tone}
          registerMaterial={registerSceneMaterial}
        />
      ))}

      {rails.map((lane, index) => (
        <mesh key={`project-rail-${index}`}>
          <tubeGeometry
            args={[lane.curve, lane.emphasis === "support" ? 36 : 52, lane.radius, 10, false]}
          />
          <meshPhysicalMaterial
            ref={registerSceneMaterial}
            color={TONE_COLORS[lane.tone]}
            transmission={0.64}
            opacity={lane.emphasis === "support" ? 0.14 : 0.24}
            transparent
            ior={1.22}
            thickness={0.2}
            roughness={0.16}
            metalness={0.08}
          />
        </mesh>
      ))}

      {visibleNodes.map((position, index) => (
        <GlassNode
          key={`project-node-${index}`}
          position={position}
          size={0.16 + index * 0.018}
          tone={index % 3 === 0 ? "emerald" : index % 3 === 1 ? "blue" : "amber"}
          registerMaterial={registerSceneMaterial}
        />
      ))}

      {packetMeta.map((packet, index) => (
        <mesh
          key={`project-packet-${index}`}
          ref={(node) => {
            packetRefs.current[index] = node;
          }}
        >
          <capsuleGeometry args={[packet.emphasis === "support" ? 0.012 : 0.016, 0.2, 4, 8]} />
          <meshBasicMaterial
            color={TONE_COLORS[packet.tone]}
            transparent
            opacity={0.6}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      ))}

      {visibleLabels.map((label) => (
        <LabelSprite
          key={label.label}
          label={label.label}
          position={label.position}
          tone={label.tone}
          registerMaterial={registerUiMaterial}
        />
      ))}
    </group>
  );
}

function ExperienceSystemsField({
  ranges,
  profile,
}: {
  ranges: HomeSceneRanges;
  profile: ReturnType<typeof useSceneProfile>;
}) {
  const scroll = useScroll();
  const rootRef = useRef<THREE.Group>(null!);
  const railPacketRefs = useRef<Array<THREE.Mesh | null>>([]);
  const tempPointRef = useRef(new THREE.Vector3());
  const tempTangentRef = useRef(new THREE.Vector3());
  const tempLookRef = useRef(new THREE.Vector3());

  const visibleNodes = useMemo(
    () => homeSceneData.experience.nodes.slice(0, profile.experienceNodes),
    [profile.experienceNodes]
  );
  const visibleLabels = useMemo(
    () => homeSceneData.experience.labels.slice(0, profile.experienceCallouts),
    [profile.experienceCallouts]
  );
  const anchorZ = useMemo(
    () => getRangeDepth(ranges.experience, -4),
    [ranges.experience.end, ranges.experience.start]
  );
  const [focusX, focusY, focusZ] = homeSceneData.experience.focalOffset;

  const connections = useMemo(
    () =>
      homeSceneData.experience.connections
        .slice(0, profile.experienceConnections)
        .filter(([start, end]) => start < visibleNodes.length && end < visibleNodes.length)
        .map(([start, end], index) => {
          const pointA = new THREE.Vector3(...visibleNodes[start]);
          const pointB = new THREE.Vector3(...visibleNodes[end]);
          const mid = pointA.clone().lerp(pointB, 0.5);
          mid.y += index % 2 === 0 ? 0.26 : 0.18;
          return {
            curve: new THREE.CatmullRomCurve3([pointA, mid, pointB]),
            tone: index % 3 === 0 ? "blue" : "emerald" as SceneTone,
          };
        }),
    [profile.experienceConnections, visibleNodes]
  );

  const rails = useMemo(
    () =>
      homeSceneData.experience.rails.map((rail) => ({
        ...rail,
        curve: new THREE.CatmullRomCurve3(rail.points.map(([x, y, z]) => new THREE.Vector3(x, y, z))),
      })),
    []
  );

  const railPackets = useMemo(
    () =>
      rails.flatMap((rail) => {
        if (profile.experiencePacketsPerRail === 0) return [];
        return rail.packetOffsets.slice(0, profile.experiencePacketsPerRail).map((offset) => ({
          curve: rail.curve,
          tone: rail.tone,
          offset,
          speed: rail.packetSpeed,
          emphasis: rail.emphasis ?? "primary",
        }));
      }),
    [profile.experiencePacketsPerRail, rails]
  );

  const { materialsRef: sceneMaterials, registerMaterial: registerSceneMaterial } = useMaterialRegistry();
  const { materialsRef: uiMaterials, registerMaterial: registerUiMaterial } = useMaterialRegistry();

  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime();
    const presence = getRangePresence(scroll.offset, ranges.experience, 0.055);
    const calm = THREE.MathUtils.smoothstep(
      scroll.offset,
      Math.max(0, ranges.contact.start - 0.08),
      Math.min(1, ranges.contact.start + 0.02)
    );
    const alpha = presence * (1 - calm * 0.72);

    // Provide a consistent "rise from bottom and deep space" entrance
    const yEntrance = -(1 - presence) * 8;
    const zEntrance = -(1 - presence) * 6;

    rootRef.current.visible = alpha > 0.01;
    rootRef.current.position.set(focusX, focusY + yEntrance, anchorZ + focusZ + zEntrance);
    rootRef.current.rotation.x = THREE.MathUtils.lerp(rootRef.current.rotation.x, -0.04, 0.04);
    rootRef.current.rotation.y = THREE.MathUtils.lerp(
      rootRef.current.rotation.y,
      Math.sin(elapsed * 0.04) * 0.028,
      0.04
    );
    rootRef.current.scale.setScalar(0.97 + presence * 0.035);

    setRegisteredOpacity(sceneMaterials.current, alpha);
    setRegisteredOpacity(uiMaterials.current, alpha * 0.9);

    railPacketRefs.current.forEach((packetMesh, index) => {
      if (!packetMesh) return;
      const packet = railPackets[index];
      const t = (packet.offset + elapsed * packet.speed) % 1;
      packet.curve.getPoint(t, tempPointRef.current);
      packet.curve.getTangent(t, tempTangentRef.current);
      packetMesh.position.copy(tempPointRef.current);
      tempLookRef.current.copy(tempPointRef.current).add(tempTangentRef.current);
      packetMesh.lookAt(tempLookRef.current);

      const material = packetMesh.material as THREE.MeshBasicMaterial;
      material.opacity = alpha * (packet.emphasis === "support" ? 0.24 : 0.42);
    });
  });

  return (
    <group ref={rootRef}>
      {homeSceneData.experience.halos.map((halo) => (
        <SignalHalo
          key={`${halo.position.join(":")}-${halo.radius}`}
          halo={halo}
          registerMaterial={registerSceneMaterial}
        />
      ))}

      {homeSceneData.experience.latticePlanes.map((plane) => (
        <WireLatticePlane
          key={`${plane.position.join(":")}-${plane.tone}`}
          plane={plane}
          registerMaterial={registerSceneMaterial}
        />
      ))}

      {rails.map((rail, index) => (
        <mesh key={`experience-rail-${index}`}>
          <tubeGeometry args={[rail.curve, 48, rail.radius, 10, false]} />
          <meshPhysicalMaterial
            ref={registerSceneMaterial}
            color={TONE_COLORS[rail.tone]}
            transmission={0.58}
            opacity={rail.emphasis === "support" ? 0.12 : 0.18}
            transparent
            ior={1.2}
            thickness={0.16}
            roughness={0.22}
            metalness={0.06}
          />
        </mesh>
      ))}

      {connections.map((connection, index) => (
        <mesh key={`experience-connection-${index}`}>
          <tubeGeometry args={[connection.curve, 28, 0.006, 6, false]} />
          <meshBasicMaterial
            ref={registerSceneMaterial}
            color={TONE_COLORS[connection.tone]}
            transparent
            opacity={0.13}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      ))}

      {visibleNodes.map((position, index) => (
        <GlassNode
          key={`experience-node-${index}`}
          position={position}
          size={index === 4 ? 0.17 : 0.13}
          tone={index % 2 === 0 ? "blue" : "emerald"}
          registerMaterial={registerSceneMaterial}
        />
      ))}

      {railPackets.map((packet, index) => (
        <mesh
          key={`experience-packet-${index}`}
          ref={(node) => {
            railPacketRefs.current[index] = node;
          }}
        >
          <capsuleGeometry args={[0.01, 0.14, 4, 8]} />
          <meshBasicMaterial
            color={TONE_COLORS[packet.tone]}
            transparent
            opacity={0.4}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      ))}

      {visibleLabels.map((label) => (
        <LabelSprite
          key={label.label}
          label={label.label}
          position={label.position}
          tone={label.tone}
          registerMaterial={registerUiMaterial}
        />
      ))}
    </group>
  );
}

function ContactTaper({
  ranges,
  profile,
}: {
  ranges: HomeSceneRanges;
  profile: ReturnType<typeof useSceneProfile>;
}) {
  const scroll = useScroll();
  const rootRef = useRef<THREE.Group>(null!);
  const particlesRef = useRef<THREE.InstancedMesh>(null!);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const anchorZ = useMemo(() => getRangeDepth(ranges.contact, -8), [ranges.contact.end, ranges.contact.start]);
  const [focusX, focusY, focusZ] = homeSceneData.contact.focalOffset;
  const { materialsRef: sceneMaterials, registerMaterial: registerSceneMaterial } = useMaterialRegistry();

  const particleData = useMemo(
    () =>
      homeSceneData.contact.particles.slice(0, profile.contactParticles).map((position, index) => ({
        position: new THREE.Vector3(...position),
        phase: index * 0.76,
        speed: 0.22 + index * 0.012,
      })),
    [profile.contactParticles]
  );

  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime();
    const presence = getRangePresence(scroll.offset, ranges.contact, 0.075);
    const footerFade = THREE.MathUtils.smoothstep(
      scroll.offset,
      Math.max(0, ranges.contact.end - 0.06),
      Math.min(1, ranges.contact.end + 0.05)
    );
    const alpha = presence * (0.78 - footerFade * 0.18);

    // Provide a consistent "rise from bottom" entrance
    const yEntrance = -(1 - presence) * 8;
    const zEntrance = -(1 - presence) * 4;

    rootRef.current.visible = alpha > 0.01;
    rootRef.current.position.set(focusX, focusY + yEntrance, anchorZ + focusZ + zEntrance);
    rootRef.current.rotation.y = THREE.MathUtils.lerp(
      rootRef.current.rotation.y,
      Math.sin(elapsed * 0.03) * 0.02,
      0.04
    );

    setRegisteredOpacity(sceneMaterials.current, alpha);

    if (particlesRef.current) {
      particleData.forEach((particle, index) => {
        const time = elapsed * particle.speed + particle.phase;
        dummy.position.set(
          particle.position.x + Math.sin(time) * 0.14,
          particle.position.y + Math.cos(time * 0.8) * 0.12,
          particle.position.z + Math.sin(time * 1.15) * 0.14
        );
        dummy.scale.setScalar(0.55 + alpha * 0.24);
        dummy.updateMatrix();
        particlesRef.current!.setMatrixAt(index, dummy.matrix);
      });
      particlesRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group ref={rootRef}>
      <mesh>
        <sphereGeometry args={[1.34, 40, 40]} />
        <meshPhysicalMaterial
          ref={registerSceneMaterial}
          color="#34d399"
          transmission={0.58}
          ior={1.22}
          thickness={0.8}
          roughness={0.08}
          transparent
          opacity={0.1}
        />
      </mesh>

      <mesh scale={0.35}>
        <sphereGeometry args={[1, 24, 24]} />
        <meshBasicMaterial
          ref={registerSceneMaterial}
          color="#34d399"
          transparent
          opacity={0.55}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      <mesh rotation={[Math.PI / 2.55, 0.18, 0]}>
        <torusGeometry args={[2.05, 0.018, 16, 100]} />
        <meshBasicMaterial
          ref={registerSceneMaterial}
          color="#38bdf8"
          transparent
          opacity={0.14}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      <mesh rotation={[-Math.PI / 2.35, -0.24, 0]}>
        <torusGeometry args={[1.68, 0.018, 16, 100]} />
        <meshBasicMaterial
          ref={registerSceneMaterial}
          color="#34d399"
          transparent
          opacity={0.18}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      <instancedMesh ref={particlesRef} args={[undefined, undefined, particleData.length]}>
        <sphereGeometry args={[0.045, 10, 10]} />
        <meshBasicMaterial color="#34d399" transparent opacity={0.42} depthWrite={false} toneMapped={false} />
      </instancedMesh>
    </group>
  );
}

export function HomeLowerScene({ sectionRanges }: { sectionRanges: HomeSceneRanges }) {
  const profile = useSceneProfile();

  return (
    <>
      <ProjectsDataCosmos ranges={sectionRanges} profile={profile} />
      <ExperienceSystemsField ranges={sectionRanges} profile={profile} />
      <ContactTaper ranges={sectionRanges} profile={profile} />
    </>
  );
}
