"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { frostings, sponges, type CakeConfig, type DecorationId } from "@/content/cake";

/* ---------------------------------------------------------------------------
 * The cake is built from four reusable primitives (tier, frosting shell,
 * decoration, candle) that every shape and flavour reuses. No external models,
 * no textures beyond one generated message plaque.
 * ------------------------------------------------------------------------- */

const TIER_HEIGHT = 0.55;
/** The surface things stand on: the top face of a tier's frosting cap. */
const CAP_TOP = (y: number) => y + TIER_HEIGHT * 0.5 + 0.03;

/** Heart profile, extruded. Built once and shared by every heart tier. */
function heartShape(): THREE.Shape {
  const s = new THREE.Shape();
  s.moveTo(0, -0.95);
  s.bezierCurveTo(0.95, -0.2, 0.78, 0.72, 0.02, 0.42);
  s.bezierCurveTo(-0.78, 0.72, -0.95, -0.2, 0, -0.95);
  return s;
}

function useTierGeometry(shape: CakeConfig["shape"], radius: number) {
  return useMemo(() => {
    if (shape === "round") {
      return new THREE.CylinderGeometry(radius, radius * 1.015, TIER_HEIGHT, 56, 1);
    }
    if (shape === "square") {
      return new THREE.BoxGeometry(radius * 1.72, TIER_HEIGHT, radius * 1.72);
    }
    const geo = new THREE.ExtrudeGeometry(heartShape(), {
      depth: TIER_HEIGHT,
      bevelEnabled: true,
      bevelSize: 0.03,
      bevelThickness: 0.03,
      bevelSegments: 2,
      curveSegments: 20,
    });
    geo.rotateX(-Math.PI / 2);
    geo.scale(radius * 1.05, 1, radius * 1.05);
    geo.center();
    return geo;
  }, [shape, radius]);
}

/** Points around a tier's rim, used for every decoration type. */
function rimPoints(shape: CakeConfig["shape"], radius: number, count: number) {
  const pts: [number, number, number][] = [];
  for (let i = 0; i < count; i += 1) {
    const a = (i / count) * Math.PI * 2;
    if (shape === "square") {
      // Walk the perimeter of a square instead of a circle.
      const t = (i / count) * 4;
      const side = Math.floor(t);
      const f = t - side;
      const r = radius * 0.82;
      const map: [number, number][] = [
        [-r + f * 2 * r, -r],
        [r, -r + f * 2 * r],
        [r - f * 2 * r, r],
        [-r, r - f * 2 * r],
      ];
      pts.push([map[side][0], 0, map[side][1]]);
    } else if (shape === "heart") {
      const x = 16 * Math.sin(a) ** 3;
      const z = 13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a);
      pts.push([(x / 17) * radius * 0.86, 0, (-z / 17) * radius * 0.86]);
    } else {
      pts.push([Math.cos(a) * radius * 0.86, 0, Math.sin(a) * radius * 0.86]);
    }
  }
  return pts;
}

function Decoration({
  kind,
  position,
  seed,
}: {
  kind: DecorationId;
  position: [number, number, number];
  seed: number;
}) {
  const wobble = ((seed * 9301 + 49297) % 233280) / 233280;

  switch (kind) {
    case "strawberries":
      return (
        <mesh
          position={[position[0], position[1] + 0.03, position[2]]}
          rotation={[Math.PI * 0.58, wobble * 6, 0.25]}
        >
          <coneGeometry args={[0.062, 0.14, 12]} />
          <meshStandardMaterial color="#c0243a" roughness={0.42} />
        </mesh>
      );
    case "cherries":
      return (
        <group position={position}>
          <mesh>
            <sphereGeometry args={[0.075, 14, 12]} />
            <meshStandardMaterial color="#8e1026" roughness={0.25} metalness={0.05} />
          </mesh>
          <mesh position={[0.02, 0.1, 0]} rotation={[0, 0, -0.5]}>
            <cylinderGeometry args={[0.008, 0.008, 0.16, 6]} />
            <meshStandardMaterial color="#4b5d2a" />
          </mesh>
        </group>
      );
    case "sprinkles":
      return (
        <mesh position={position} rotation={[wobble * 3, wobble * 6, 1.2 + wobble]}>
          <capsuleGeometry args={[0.016, 0.07, 2, 6]} />
          <meshStandardMaterial
            color={["#f2b5c4", "#f6e07a", "#9fd3c7", "#f4f0e8", "#c86b8a"][seed % 5]}
            roughness={0.5}
          />
        </mesh>
      );
    case "pearls":
      return (
        <mesh position={position}>
          <sphereGeometry args={[0.045, 12, 10]} />
          <meshStandardMaterial color="#f7f1e2" roughness={0.12} metalness={0.55} />
        </mesh>
      );
    case "stars":
      return (
        <mesh position={position} rotation={[-Math.PI / 2, 0, wobble * 3]}>
          <circleGeometry args={[0.07, 5]} />
          <meshStandardMaterial color="#b49a65" roughness={0.2} metalness={0.7} side={THREE.DoubleSide} />
        </mesh>
      );
    case "hearts":
      return (
        <mesh position={position} rotation={[-Math.PI / 2, 0, wobble]} scale={0.055}>
          <extrudeGeometry args={[heartShape(), { depth: 0.3, bevelEnabled: false, curveSegments: 10 }]} />
          <meshStandardMaterial color="#b91f3d" roughness={0.35} />
        </mesh>
      );
    case "bows":
      return (
        <group position={position} rotation={[0, wobble * 6, 0]}>
          {[-1, 1].map((side) => (
            <mesh key={side} position={[side * 0.06, 0, 0]} rotation={[0, 0, side * 0.5]}>
              <torusGeometry args={[0.05, 0.016, 8, 14]} />
              <meshStandardMaterial color="#7b2fb5" roughness={0.3} />
            </mesh>
          ))}
        </group>
      );
    case "flowers":
      return (
        <group position={position} rotation={[0, wobble * 6, 0]}>
          {[0, 1, 2, 3, 4].map((i) => (
            <mesh
              key={i}
              position={[Math.cos((i / 5) * 6.28) * 0.045, 0, Math.sin((i / 5) * 6.28) * 0.045]}
            >
              <sphereGeometry args={[0.032, 10, 8]} />
              <meshStandardMaterial color="#f4dce4" roughness={0.6} />
            </mesh>
          ))}
          <mesh>
            <sphereGeometry args={[0.025, 10, 8]} />
            <meshStandardMaterial color="#d9b24c" roughness={0.4} />
          </mesh>
        </group>
      );
    default:
      return null;
  }
}

function Candle({
  position,
  style,
  color,
  lit,
  blown,
}: {
  position: [number, number, number];
  style: string;
  color: string;
  lit: boolean;
  blown: boolean;
}) {
  const flameRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    const flame = flameRef.current;
    if (!flame) return;
    const t = state.clock.elapsedTime;
    if (blown) {
      // Rise and fade rather than vanish.
      flame.position.y += 0.004;
      const m = flame.material as THREE.MeshBasicMaterial;
      m.opacity = Math.max(0, m.opacity - 0.012);
      if (lightRef.current) lightRef.current.intensity = Math.max(0, lightRef.current.intensity - 0.08);
      return;
    }
    if (!lit) return;
    flame.scale.y = 1 + Math.sin(t * 9 + position[0] * 5) * 0.14;
    flame.scale.x = 1 + Math.cos(t * 7 + position[2] * 5) * 0.07;
    flame.position.x = position[0] + Math.sin(t * 3.4 + position[2]) * 0.004;
  });

  const height = style === "sparkler" ? 0.5 : style === "taper" ? 0.46 : 0.34;

  return (
    <group>
      {style === "twist" ? (
        <mesh position={[position[0], position[1] + height / 2, position[2]]}>
          <torusKnotGeometry args={[0.022, 0.012, 48, 6, 2, 7]} />
          <meshStandardMaterial color={color} roughness={0.55} />
        </mesh>
      ) : (
        <mesh position={[position[0], position[1] + height / 2, position[2]]}>
          <cylinderGeometry
            args={[style === "taper" ? 0.016 : 0.022, 0.026, height, 10]}
          />
          <meshStandardMaterial color={color} roughness={0.55} />
        </mesh>
      )}

      {/* Wick */}
      <mesh position={[position[0], position[1] + height + 0.02, position[2]]}>
        <cylinderGeometry args={[0.004, 0.004, 0.04, 5]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>

      {lit || blown ? (
        <>
          <mesh
            ref={flameRef}
            position={[position[0], position[1] + height + 0.1, position[2]]}
          >
            <coneGeometry args={[0.032, 0.11, 10]} />
            <meshBasicMaterial color="#ffce7a" transparent opacity={0.95} />
          </mesh>
          <pointLight
            ref={lightRef}
            position={[position[0], position[1] + height + 0.14, position[2]]}
            color="#ffb866"
            intensity={0.5}
            distance={2.2}
          />
        </>
      ) : null}
    </group>
  );
}

/** The message, rendered to a canvas texture and laid on the top tier. */
function MessagePlaque({ text, radius, y }: { text: string; radius: number; y: number }) {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#7b2fb5";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const size = text.length > 22 ? 78 : text.length > 14 ? 100 : 128;
    ctx.font = `600 ${size}px Fredoka, ui-rounded, system-ui, sans-serif`;
    ctx.fillText(text.slice(0, 34), canvas.width / 2, canvas.height / 2);
    const tex = new THREE.CanvasTexture(canvas);
    tex.anisotropy = 4;
    return tex;
  }, [text]);

  if (!texture || !text.trim()) return null;

  return (
    <mesh position={[0, y + 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[radius * 1.68, radius * 0.42]} />
      <meshBasicMaterial map={texture} transparent opacity={0.92} />
    </mesh>
  );
}

function Tier({
  config,
  level,
  radius,
  y,
  frostingColor,
  spongeColor,
  lit,
  blown,
  topTier,
}: {
  config: CakeConfig;
  level: number;
  radius: number;
  y: number;
  frostingColor: string;
  spongeColor: string;
  lit: boolean;
  blown: boolean;
  topTier: boolean;
}) {
  const spongeGeo = useTierGeometry(config.shape, radius * 0.985);
  const frostingGeo = useTierGeometry(config.shape, radius);

  /* Decorations ring the rim of every tier; the top tier also gets candles. */
  const decoPoints = useMemo(() => {
    if (config.decorations.length === 0) return [];
    const perRing = config.shape === "square" ? 16 : 14;
    return rimPoints(config.shape, radius, perRing).map((p, i) => ({
      position: [p[0], CAP_TOP(y), p[2]] as [number, number, number],
      kind: config.decorations[i % config.decorations.length],
      seed: i + level * 7,
    }));
  }, [config.decorations, config.shape, radius, y, level]);

  const candlePoints = useMemo(() => {
    if (!topTier) return [];
    const n = Math.max(1, Math.min(config.candleCount, 12));
    return rimPoints(config.shape, radius * 0.62, n).map(
      (p) => [p[0], CAP_TOP(y), p[2]] as [number, number, number],
    );
  }, [topTier, config.candleCount, config.shape, radius, y]);

  return (
    <group>
      {/* Sponge, visible as a seam between frosting layers. */}
      <mesh geometry={spongeGeo} position={[0, y, 0]}>
        <meshStandardMaterial color={spongeColor} roughness={0.9} />
      </mesh>
      {/* Frosting shell, slightly shorter so the sponge shows. */}
      <mesh geometry={frostingGeo} position={[0, y, 0]} scale={[1, 0.86, 1]}>
        <meshStandardMaterial color={frostingColor} roughness={0.62} metalness={0.02} />
      </mesh>
      {/* Frosting cap. The sponge cylinder's top face sits at y + H/2, so the
          cap is centred there and its own top becomes the surface everything
          else stands on — otherwise the iced message z-fights with sponge. */}
      <mesh position={[0, y + TIER_HEIGHT * 0.5, 0]}>
        <cylinderGeometry args={[radius * 0.995, radius * 0.995, 0.06, 48]} />
        <meshStandardMaterial color={frostingColor} roughness={0.6} />
      </mesh>

      {/* Piped border, lying flat around the rim. */}
      <mesh
        position={[0, y + TIER_HEIGHT * 0.5 + 0.02, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        visible={config.shape === "round"}
      >
        <torusGeometry args={[radius * 0.97, 0.038, 10, 64]} />
        <meshStandardMaterial color={frostingColor} roughness={0.5} />
      </mesh>

      {decoPoints.map((d, i) => (
        <Decoration key={`${d.kind}-${i}`} kind={d.kind} position={d.position} seed={d.seed} />
      ))}

      {candlePoints.map((p, i) => (
        <Candle
          key={i}
          position={p}
          style={config.candleStyle}
          color={config.candleColor}
          lit={lit}
          blown={blown}
        />
      ))}

      {topTier ? (
        <MessagePlaque text={config.message} radius={radius} y={CAP_TOP(y) + 0.004} />
      ) : null}
    </group>
  );
}

function CakeModel({
  config,
  lit,
  blown,
  spin,
}: {
  config: CakeConfig;
  lit: boolean;
  blown: boolean;
  spin: boolean;
}) {
  const group = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (spin && group.current) group.current.rotation.y += delta * 0.18;
  });

  const spongeColor = sponges.find((s) => s.id === config.sponge)?.hex ?? "#f2e3c2";
  const baseFrosting = frostings.find((f) => f.id === config.frosting)?.hex ?? "#f6ecd9";
  // The chosen colour tints the frosting flavour rather than replacing it.
  const frostingColor = new THREE.Color(baseFrosting).lerp(new THREE.Color(config.color), 0.72);

  const tiers = Array.from({ length: config.tiers }, (_, i) => {
    const level = config.tiers - 1 - i; // 0 = bottom
    const radius = 1.15 - level * 0.26;
    const y = level * (TIER_HEIGHT * 0.86) - 0.35;
    return { level, radius, y, topTier: level === config.tiers - 1 };
  });

  return (
    <group ref={group}>
      {/* Cake stand. */}
      <mesh position={[0, -0.72, 0]}>
        <cylinderGeometry args={[1.45, 1.5, 0.07, 48]} />
        <meshStandardMaterial color="#e8dff5" roughness={0.3} metalness={0.25} />
      </mesh>
      <mesh position={[0, -0.86, 0]}>
        <cylinderGeometry args={[0.28, 0.42, 0.22, 24]} />
        <meshStandardMaterial color="#e8dff5" roughness={0.3} metalness={0.25} />
      </mesh>

      {tiers.map((t) => (
        <Tier
          key={t.level}
          config={config}
          level={t.level}
          radius={t.radius}
          y={t.y}
          frostingColor={`#${frostingColor.getHexString()}`}
          spongeColor={spongeColor}
          lit={lit}
          blown={blown}
          topTier={t.topTier}
        />
      ))}
    </group>
  );
}

/**
 * Keeps the whole cake in frame. A tall, narrow canvas has a small horizontal
 * field of view, so the camera has to step back; without this the cake is
 * cropped on phones and on any layout that stretches the preview column.
 */
function FitCamera({ tiers }: { tiers: number }) {
  const { camera, size } = useThree();
  useEffect(() => {
    const aspect = size.width / Math.max(size.height, 1);
    const radius = 1.35 + tiers * 0.12;
    const perspective = camera as THREE.PerspectiveCamera;
    const vFov = (perspective.fov * Math.PI) / 180;
    // Distance needed to fit the cake vertically, and horizontally.
    const distV = radius / Math.tan(vFov / 2);
    const distH = radius / (Math.tan(vFov / 2) * aspect);
    const distance = Math.min(9, Math.max(3.4, Math.max(distV, distH) * 1.25));
    perspective.position.set(0, distance * 0.3, distance);
    perspective.lookAt(0, -0.1, 0);
    perspective.updateProjectionMatrix();
  }, [camera, size.width, size.height, tiers]);
  return null;
}

export default function CakeScene({
  config,
  lit,
  blown,
  spin = false,
  onReady,
}: {
  config: CakeConfig;
  lit: boolean;
  blown: boolean;
  spin?: boolean;
  onReady?: (canvas: HTMLCanvasElement) => void;
}) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 1.5, 4.6], fov: 38 }}
      gl={{ preserveDrawingBuffer: true, antialias: true }}
      onCreated={({ gl }) => onReady?.(gl.domElement)}
      style={{ touchAction: "pan-y" }}
    >
      <color attach="background" args={["#faf7ff"]} />
      <ambientLight intensity={0.78} />
      <directionalLight position={[3.5, 5, 2.5]} intensity={1.15} />
      <directionalLight position={[-3, 2, -2]} intensity={0.35} color="#ffd9c9" />

      <FitCamera tiers={config.tiers} />
      <CakeModel config={config} lit={lit} blown={blown} spin={spin} />

      {/* A soft ground wash instead of real shadows. */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.78, 0]}>
        <circleGeometry args={[3.4, 48]} />
        <meshBasicMaterial color="#e6dcf7" transparent opacity={0.5} />
      </mesh>

      <OrbitControls
        enablePan={false}
        enableZoom
        minDistance={3.1}
        maxDistance={7}
        minPolarAngle={0.5}
        maxPolarAngle={1.42}
        enableDamping
        dampingFactor={0.08}
        autoRotate={false}
      />
    </Canvas>
  );
}
