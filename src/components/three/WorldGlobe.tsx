import { Component, Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import {
  AdditiveBlending,
  BackSide,
  DoubleSide,
  BufferGeometry,
  Color,
  Curve,
  DataTexture,
  Float32BufferAttribute,
  NoColorSpace,
  LinearFilter,
  RGBAFormat,
  ShapeUtils,
  TubeGeometry,
  Vector2,
  Vector3,
  type Group,
  type IUniform,
  type Texture,
} from 'three';
import turkey from '../../data/turkey.json';
import { brand } from '../../data/brand';
import { globeVertex, surfaceFragment, atmosphereFragment, beamFragment } from './globe-shaders';
type Props = { label: string; pauseLabel: string; playLabel: string };
class Boundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
const TEXTURE_URL = '/data/world-texture.webp?v=2';
const TAU = Math.PI * 2;
function createGlowTexture() {
  const size = 32;
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      const radius = Math.hypot(((x + 0.5) / size) * 2 - 1, ((y + 0.5) / size) * 2 - 1);
      const index = (y * size + x) * 4;
      data[index] = data[index + 1] = data[index + 2] = 255;
      data[index + 3] = Math.round(255 * Math.pow(Math.max(0, 1 - radius), 2.5));
    }
  const texture = new DataTexture(data, size, size, RGBAFormat);
  texture.minFilter = texture.magFilter = LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

class OrbitCurve extends Curve<Vector3> {
  constructor(private radius: number) {
    super();
  }
  getPoint(t: number, target = new Vector3()) {
    return target.set(Math.cos(t * TAU) * this.radius, Math.sin(t * TAU) * this.radius, 0);
  }
}

function Framing() {
  const { camera, size, invalidate } = useThree();
  useEffect(() => {
    // Fit the complete light paths on portrait screens as well as wide canvases.
    const height = Math.max(5.75, 5.75 / (size.width / size.height));
    camera.position.set(0, 0, height / (2 * Math.tan((42 * Math.PI) / 360)));
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
    invalidate();
  }, [camera, size.width, size.height, invalidate]);
  return null;
}

function LightOrbit({
  time,
  mobile,
  radius,
  rotation,
  duration,
  phase,
  glow,
}: {
  time: IUniform<number>;
  mobile: boolean;
  radius: number;
  rotation: [number, number, number];
  duration: number;
  phase: number;
  glow: Texture;
}) {
  const head = useRef<Group>(null);
  const geometry = useMemo(() => {
    const curve = new OrbitCurve(radius);
    const segments = mobile ? 112 : 208;
    return {
      core: new TubeGeometry(curve, segments, 0.008, 5, true),
      glow: new TubeGeometry(curve, segments, 0.035, 6, true),
    };
  }, [radius, mobile]);
  const uniforms = useMemo(
    () => ({
      uTime: time,
      uDuration: { value: duration },
      uPhase: { value: phase },
      uColor: { value: new Color(brand.red) },
      uGlow: { value: 0 },
    }),
    [time, duration, phase],
  );
  const haloUniforms = useMemo(() => ({ ...uniforms, uGlow: { value: 1 } }), [uniforms]);
  useEffect(
    () => () => {
      geometry.core.dispose();
      geometry.glow.dispose();
    },
    [geometry],
  );
  useFrame(() => {
    const angle = (time.value / duration + phase) * TAU;
    head.current?.position.set(Math.cos(angle) * radius, Math.sin(angle) * radius, 0);
  });
  return (
    <group rotation={rotation}>
      <mesh geometry={geometry.glow}>
        <shaderMaterial
          vertexShader={globeVertex}
          fragmentShader={beamFragment}
          uniforms={haloUniforms}
          transparent
          blending={AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <mesh geometry={geometry.core}>
        <shaderMaterial
          vertexShader={globeVertex}
          fragmentShader={beamFragment}
          uniforms={uniforms}
          transparent
          blending={AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <group ref={head}>
        <mesh>
          <sphereGeometry args={[0.022, 12, 8]} />
          <meshBasicMaterial color={brand.red} toneMapped={false} />
        </mesh>
        <sprite scale={[0.28, 0.28, 1]}>
          <spriteMaterial
            map={glow}
            color={brand.red}
            transparent
            opacity={0.85}
            blending={AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </sprite>
      </group>
    </group>
  );
}

function Earth({ animate, mobile }: { animate: boolean; mobile: boolean }) {
  const earth = useRef<Group>(null),
    rings = useRef<Group>(null);
  const texture = useTexture(TEXTURE_URL);
  texture.colorSpace = NoColorSpace;
  const time = useMemo<IUniform<number>>(() => ({ value: 0 }), []);
  const glow = useMemo(createGlowTexture, []);
  const surfaceUniforms = useMemo(() => ({ uMap: { value: texture } }), [texture]);
  const atmosphereUniforms = useMemo(
    () => ({
      uRed: { value: new Color(brand.red) },
      uCool: { value: new Color('#91a2ba') },
    }),
    [],
  );
  const turkeyGeometry = useMemo(() => {
    const geometry = new BufferGeometry();
    const polygons = turkey.type === 'Polygon' ? [turkey.coordinates] : turkey.coordinates;
    const positions: number[] = [];
    for (const polygon of polygons) {
      const contour = (polygon[0] as number[][]).map(([lon, lat]) => new Vector2(lon, lat));
      const triangles = ShapeUtils.triangulateShape(contour, []);
      for (const triangle of triangles)
        for (const index of triangle) {
          const point = contour[index]!;
          const lon = (point.x * Math.PI) / 180,
            lat = (point.y * Math.PI) / 180;
          positions.push(
            2.009 * Math.cos(lat) * Math.cos(lon),
            2.009 * Math.sin(lat),
            -2.009 * Math.cos(lat) * Math.sin(lon),
          );
        }
    }
    geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
    geometry.computeVertexNormals();
    return geometry;
  }, []);
  useEffect(
    () => () => {
      turkeyGeometry.dispose();
      texture.dispose();
      glow.dispose();
      useTexture.clear(TEXTURE_URL);
    },
    [turkeyGeometry, texture, glow],
  );
  useFrame((_, delta) => {
    if (animate) {
      const step = Math.min(delta, 0.08);
      time.value += step;
      if (earth.current) earth.current.rotation.y += step * 0.025;
      if (rings.current) rings.current.rotation.y -= step * 0.012;
    }
  });
  return (
    <>
      <Framing />
      <group ref={earth} rotation={[0.12, -2.18, 0.08]}>
        <mesh>
          <sphereGeometry args={[2, mobile ? 40 : 64, mobile ? 28 : 48]} />
          <shaderMaterial
            vertexShader={globeVertex}
            fragmentShader={surfaceFragment}
            uniforms={surfaceUniforms}
            toneMapped={false}
          />
        </mesh>
        <mesh geometry={turkeyGeometry} renderOrder={10}>
          <meshBasicMaterial
            color={brand.red}
            side={DoubleSide}
            depthTest={false}
            depthWrite={false}
            transparent
            opacity={1}
            toneMapped={false}
          />
        </mesh>
      </group>
      <mesh scale={1.045}>
        <sphereGeometry args={[2, mobile ? 32 : 56, mobile ? 24 : 40]} />
        <shaderMaterial
          vertexShader={globeVertex}
          fragmentShader={atmosphereFragment}
          uniforms={atmosphereUniforms}
          transparent
          side={BackSide}
          blending={AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <group ref={rings}>
        <LightOrbit
          time={time}
          mobile={mobile}
          radius={2.65}
          rotation={[1.05, 0.25, -0.45]}
          duration={32}
          phase={0.12}
          glow={glow}
        />
        <LightOrbit
          time={time}
          mobile={mobile}
          radius={2.56}
          rotation={[1.18, -0.4, 0.8]}
          duration={44}
          phase={0.65}
          glow={glow}
        />
        {!mobile && (
          <LightOrbit
            time={time}
            mobile={mobile}
            radius={2.47}
            rotation={[0.48, 0.7, 0.18]}
            duration={56}
            phase={0.35}
            glow={glow}
          />
        )}
      </group>
    </>
  );
}
export default function WorldGlobe({ label, pauseLabel, playLabel }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false),
    [visible, setVisible] = useState(false),
    [tab, setTab] = useState(true),
    [reduced, setReduced] = useState(true),
    [paused, setPaused] = useState(false),
    [mobile, setMobile] = useState(false);
  useEffect(() => {
    const query = matchMedia('(prefers-reduced-motion: reduce)'),
      narrow = matchMedia('(max-width: 760px)');
    const update = () => {
      setReduced(query.matches);
      setMobile(narrow.matches);
    };
    update();
    query.addEventListener('change', update);
    narrow.addEventListener('change', update);
    const test = document.createElement('canvas');
    try {
      const context = test.getContext('webgl2') || test.getContext('webgl');
      setReady(Boolean(context));
      context?.getExtension('WEBGL_lose_context')?.loseContext();
    } catch {
      setReady(false);
    }
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry?.isIntersecting ?? false),
      { threshold: 0.08 },
    );
    if (host.current) observer.observe(host.current);
    const visibility = () => setTab(!document.hidden);
    document.addEventListener('visibilitychange', visibility);
    visibility();
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', visibility);
      query.removeEventListener('change', update);
      narrow.removeEventListener('change', update);
    };
  }, []);
  const fallback = (
    <img
      className="globe-fallback"
      src="/data/globe-fallback.svg"
      width="600"
      height="600"
      alt={label}
      loading="lazy"
      decoding="async"
    />
  );
  const active = visible && tab && !reduced && !paused;
  return (
    <div
      className="world-canvas"
      ref={host}
      role="group"
      aria-label={label}
      data-animation={active ? 'running' : 'paused'}
    >
      {ready ? (
        <Boundary fallback={fallback}>
          <Suspense fallback={fallback}>
            <Canvas
              aria-hidden="true"
              dpr={mobile ? 1 : [1, 1.5]}
              camera={{ position: [0, 0, 7.5], fov: 42 }}
              frameloop={active ? 'always' : 'demand'}
              gl={{ antialias: !mobile, alpha: true, powerPreference: 'low-power' }}
              onCreated={({ gl }) => {
                gl.domElement.addEventListener(
                  'webglcontextlost',
                  (e) => {
                    e.preventDefault();
                    setReady(false);
                  },
                  { once: true },
                );
              }}
            >
              <Earth animate={active} mobile={mobile} />
            </Canvas>
          </Suspense>
        </Boundary>
      ) : (
        fallback
      )}
      {ready && !reduced && (
        <button
          className="globe-pause icon-button"
          aria-label={paused ? playLabel : pauseLabel}
          aria-pressed={paused}
          onClick={() => setPaused(!paused)}
        >
          {paused ? '▷' : 'Ⅱ'}
        </button>
      )}
    </div>
  );
}
