import { Component, Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import {
  AdditiveBlending,
  BackSide,
  BufferGeometry,
  Color,
  DataTexture,
  Float32BufferAttribute,
  Line,
  LineBasicMaterial,
  LinearFilter,
  RGBAFormat,
  type ShaderMaterial,
  Vector3,
  type Group,
  type Mesh,
} from 'three';

type Props = { label: string };
type Coordinate = [number, number];
const TEXTURE_URL = '/data/world-texture.webp?v=2';
const RADIUS = 2;
const CYAN = '#8ceaff';
const DESKTOP_GLOBE_X = 2.65;
const MOBILE_GLOBE_Y = -1.65;
const routes: [Coordinate, Coordinate][] = [
  [[29, 41], [-74, 40.7]],
  [[29, 41], [-0.1, 51.5]],
  [[29, 41], [2.35, 48.9]],
  [[29, 41], [55.3, 25.2]],
  [[29, 41], [77.2, 28.6]],
  [[29, 41], [103.8, 1.3]],
  [[29, 41], [139.7, 35.7]],
  [[29, 41], [18.4, -33.9]],
  [[29, 41], [-46.6, -23.5]],
  [[-74, 40.7], [-0.1, 51.5]],
  [[-74, 40.7], [-118.2, 34.1]],
  [[-0.1, 51.5], [103.8, 1.3]],
  [[2.35, 48.9], [139.7, 35.7]],
  [[55.3, 25.2], [151.2, -33.9]],
  [[77.2, 28.6], [139.7, 35.7]],
];

class Boundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

function random(seed: number) {
  const x = Math.sin(seed * 127.1) * 43758.5453;
  return x - Math.floor(x);
}

function glowTexture() {
  const size = 32;
  const data = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const distance = Math.hypot((x + 0.5 - size / 2) / (size / 2), (y + 0.5 - size / 2) / (size / 2));
      const index = (y * size + x) * 4;
      data[index] = data[index + 1] = data[index + 2] = 255;
      data[index + 3] = Math.round(255 * Math.pow(Math.max(0, 1 - distance), 1.3));
    }
  }
  const texture = new DataTexture(data, size, size, RGBAFormat);
  texture.minFilter = texture.magFilter = LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

function geoPoint([lon, lat]: Coordinate, radius = RADIUS) {
  const longitude = (lon * Math.PI) / 180;
  const latitude = (lat * Math.PI) / 180;
  return new Vector3(
    radius * Math.cos(latitude) * Math.cos(longitude),
    radius * Math.sin(latitude),
    -radius * Math.cos(latitude) * Math.sin(longitude),
  );
}

function arcPoint(start: Vector3, end: Vector3, progress: number) {
  const a = start.clone().normalize();
  const b = end.clone().normalize();
  const angle = Math.acos(Math.max(-1, Math.min(1, a.dot(b))));
  const denominator = Math.sin(angle) || 1;
  const direction = a.multiplyScalar(Math.sin((1 - progress) * angle) / denominator)
    .add(b.multiplyScalar(Math.sin(progress * angle) / denominator))
    .normalize();
  return direction.multiplyScalar(RADIUS + 0.025 + Math.sin(Math.PI * progress) * 0.3);
}

function Framing() {
  const { camera, size, invalidate } = useThree();
  useEffect(() => {
    const aspect = size.width / size.height;
    const height = aspect < 0.9 ? 9.3 : 5.7;
    camera.position.set(0, 0, height / (2 * Math.tan((42 * Math.PI) / 360)));
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
    invalidate();
  }, [camera, size.width, size.height, invalidate]);
  return null;
}

const starVertex = /* glsl */ `
  attribute float aSize;
  attribute float aBrightness;
  attribute float aPhase;
  attribute float aSpeed;
  attribute float aDrift;
  attribute vec3 aTint;
  uniform float uTime;
  uniform float uPixelRatio;
  varying vec3 vTint;
  varying float vAlpha;
  void main() {
    vec3 p = position;
    p.x += sin(uTime * aSpeed + aPhase) * aDrift;
    p.y += cos(uTime * aSpeed * 0.81 + aPhase * 1.37) * aDrift * 0.7;
    vec4 view = modelViewMatrix * vec4(p, 1.0);
    vec4 clip = projectionMatrix * view;
    vec2 screen = clip.xy / clip.w * 0.5 + 0.5;
    float edge = smoothstep(0.0, 0.14, screen.x) * smoothstep(0.0, 0.14, 1.0 - screen.x);
    edge *= smoothstep(0.0, 0.12, screen.y) * smoothstep(0.0, 0.12, 1.0 - screen.y);
    float twinkle = 0.76 + 0.24 * sin(uTime * (aSpeed * 2.6 + 0.12) + aPhase * 2.1);
    vAlpha = aBrightness * twinkle * edge;
    vTint = aTint;
    gl_PointSize = clamp(aSize * uPixelRatio * clamp(8.0 / -view.z, 0.65, 1.4), 1.0, 9.0);
    gl_Position = clip;
  }
`;
const starFragment = /* glsl */ `
  varying vec3 vTint;
  varying float vAlpha;
  void main() {
    float distance = length(gl_PointCoord - vec2(0.5)) * 2.0;
    float core = 1.0 - smoothstep(0.0, 0.4, distance);
    float halo = 1.0 - smoothstep(0.25, 1.0, distance);
    float alpha = vAlpha * (core + halo * 0.55);
    gl_FragColor = vec4(vTint, alpha);
    #include <colorspace_fragment>
  }
`;

function Starfield({ mobile, foreground = false }: { mobile: boolean; foreground?: boolean }) {
  const { size, gl } = useThree();
  const material = useRef<ShaderMaterial>(null);
  const aspect = size.width / Math.max(1, size.height);
  const geometry = useMemo(() => {
    const positions: number[] = [];
    const sizes: number[] = [];
    const brightness: number[] = [];
    const phases: number[] = [];
    const speeds: number[] = [];
    const drifts: number[] = [];
    const tints: number[] = [];
    const colors = ['#437da8', '#5da9d2', '#8bd5ee', '#b8efff'].map((value) => new Color(value));
    const total = foreground ? (mobile ? 320 : 900) : mobile ? 5100 : size.width >= 1600 ? 17000 : 13000;
    const globeX = mobile ? 0 : DESKTOP_GLOBE_X;
    const globeY = mobile ? MOBILE_GLOBE_Y : 0;
    const normal = (seed: number) => Math.sqrt(-2 * Math.log(Math.max(0.001, random(seed)))) * Math.cos(Math.PI * 2 * random(seed + 9.37));
    for (let i = 0; i < total; i++) {
      const mode = random(i * 5.37 + 2);
      let x: number;
      let y: number;
      let z: number;
      if (foreground) {
        const theta = random(i * 7.13 + 17) * Math.PI * 2;
        const radius = 1.95 + random(i * 4.71 + 6) * 1.9;
        x = globeX + Math.cos(theta) * radius;
        y = globeY + Math.sin(theta) * radius * 0.88;
        z = 1.4 + random(i * 3.11 + 8) * 1.4;
      } else if (mode < 0.35) {
        x = (random(i * 2.31 + 4) * 2 - 1) * (mobile ? 3.8 : aspect * 4.8);
        y = (random(i * 3.79 + 8) * 2 - 1) * (mobile ? 5.8 : 4.8);
        z = -5.4 + random(i * 4.67 + 9) * 2.3;
      } else {
        const cluster = mode < 0.72 ? 1.7 : 3.2;
        x = globeX + normal(i * 1.91 + 31) * (mobile ? cluster * 0.72 : cluster);
        y = globeY + normal(i * 2.69 + 47) * cluster * 0.8;
        z = -4.4 + random(i * 6.29 + 11) * 4.4;
      }
      positions.push(x, y, z);
      const intensity = random(i * 8.33 + 13);
      const bright = intensity > 0.985;
      const medium = intensity > 0.7;
      sizes.push(bright ? 3.4 + random(i + 12) * 2.3 : medium ? 2.1 + random(i + 7) * 1.4 : 1.5 + random(i + 5) * 1.1);
      brightness.push((bright ? 0.82 + random(i + 3) * 0.18 : medium ? 0.56 + random(i + 2) * 0.24 : 0.29 + random(i + 1) * 0.21) * (foreground ? 0.52 : 1));
      phases.push(random(i * 9.13 + 19) * Math.PI * 2);
      speeds.push(0.08 + random(i * 3.17 + 23) * 0.32);
      drifts.push(random(i * 4.83 + 29) < 0.28 ? 0.003 : 0.025 + random(i * 5.47 + 31) * 0.14);
      const tint = colors[Math.min(3, Math.floor(random(i * 6.71 + 37) * 4))]!;
      tints.push(tint.r, tint.g, tint.b);
    }
    const result = new BufferGeometry();
    result.setAttribute('position', new Float32BufferAttribute(positions, 3));
    result.setAttribute('aSize', new Float32BufferAttribute(sizes, 1));
    result.setAttribute('aBrightness', new Float32BufferAttribute(brightness, 1));
    result.setAttribute('aPhase', new Float32BufferAttribute(phases, 1));
    result.setAttribute('aSpeed', new Float32BufferAttribute(speeds, 1));
    result.setAttribute('aDrift', new Float32BufferAttribute(drifts, 1));
    result.setAttribute('aTint', new Float32BufferAttribute(tints, 3));
    return result;
  }, [aspect, foreground, mobile, size.width]);
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uPixelRatio: { value: gl.getPixelRatio() } }), [gl, mobile]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  useFrame(({ clock }) => {
    if (material.current) material.current.uniforms.uTime!.value = clock.elapsedTime;
  });
  return (
    <points geometry={geometry} renderOrder={foreground ? 3 : 0}>
      <shaderMaterial ref={material} vertexShader={starVertex} fragmentShader={starFragment} uniforms={uniforms} transparent blending={AdditiveBlending} depthWrite={false} toneMapped={false} />
    </points>
  );
}

function CoastDots({ mobile, glow }: { mobile: boolean; glow: DataTexture }) {
  const texture = useTexture(TEXTURE_URL);
  const geometry = useMemo(() => {
    const source = document.createElement('canvas');
    source.width = 720;
    source.height = 360;
    const context = source.getContext('2d', { willReadFrequently: true });
    if (!context) return new BufferGeometry();
    context.drawImage(texture.image as CanvasImageSource, 0, 0, source.width, source.height);
    const pixels = context.getImageData(0, 0, source.width, source.height).data;
    const positions: number[] = [];
    const colors: number[] = [];
    const tint = new Color(CYAN);
    const step = mobile ? 2.5 : 1.65;
    let index = 0;
    for (let latitude = -86; latitude < 87; latitude += step) {
      for (let longitude = -180; longitude < 180; longitude += step) {
        const x = Math.floor(((longitude + 180) / 360) * source.width);
        const y = Math.floor(((90 - latitude) / 180) * source.height);
        if (pixels[(y * source.width + x) * 4]! < 145) continue;
        const jitter = (random(index * 3.91 + 1) - 0.5) * step * 0.22;
        const point = geoPoint([longitude + jitter, latitude], RADIUS + 0.014);
        positions.push(point.x, point.y, point.z);
        const strength = 0.68 + random(index * 5.13 + 3) * 0.32;
        colors.push(tint.r * strength, tint.g * strength, tint.b * strength);
        index++;
      }
    }
    const result = new BufferGeometry();
    result.setAttribute('position', new Float32BufferAttribute(positions, 3));
    result.setAttribute('color', new Float32BufferAttribute(colors, 3));
    return result;
  }, [texture, mobile]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return (
    <points geometry={geometry}>
      <pointsMaterial map={glow} size={mobile ? 2.5 : 3} sizeAttenuation={false} vertexColors transparent depthWrite={false} alphaTest={0.04} toneMapped={false} />
    </points>
  );
}

function FlightPath({ start, end, index, animate }: { start: Coordinate; end: Coordinate; index: number; animate: boolean }) {
  const marker = useRef<Mesh>(null);
  const a = useMemo(() => geoPoint(start), [start]);
  const b = useMemo(() => geoPoint(end), [end]);
  const geometry = useMemo(() => {
    const positions: number[] = [];
    for (let i = 0; i <= 64; i++) {
      const point = arcPoint(a, b, i / 64);
      positions.push(point.x, point.y, point.z);
    }
    const result = new BufferGeometry();
    result.setAttribute('position', new Float32BufferAttribute(positions, 3));
    return result;
  }, [a, b]);
  const path = useMemo(() => new Line(geometry, new LineBasicMaterial({
    color: CYAN,
    transparent: true,
    opacity: index % 3 === 0 ? 0.4 : 0.23,
    depthWrite: false,
  })), [geometry, index]);
  useEffect(() => () => {
    geometry.dispose();
    path.material.dispose();
  }, [geometry, path]);
  useFrame(({ clock }) => {
    if (!marker.current || !animate) return;
    marker.current.position.copy(arcPoint(a, b, (clock.elapsedTime * 0.055 + index * 0.17) % 1));
  });
  return (
    <>
      <primitive object={path} />
      <mesh ref={marker} position={arcPoint(a, b, (index * 0.17) % 1)}>
        <sphereGeometry args={[0.018, 6, 6]} />
        <meshBasicMaterial color="#cbf7ff" toneMapped={false} />
      </mesh>
    </>
  );
}

function Earth({ animate, mobile }: { animate: boolean; mobile: boolean }) {
  const globe = useRef<Group>(null);
  const glow = useMemo(glowTexture, []);
  useEffect(() => () => glow.dispose(), [glow]);
  useFrame((_, delta) => {
    if (animate && globe.current) globe.current.rotation.y += Math.min(delta, 0.08) * 0.045;
  });
  return (
    <>
      <Framing />
      <Starfield mobile={mobile} />
      <group ref={globe} position={[mobile ? 0 : DESKTOP_GLOBE_X, mobile ? MOBILE_GLOBE_Y : 0, 0]} rotation={[0.13, -2.18, 0]}>
        <mesh>
          <sphereGeometry args={[RADIUS, mobile ? 48 : 72, mobile ? 32 : 48]} />
          <meshBasicMaterial color="#020910" />
        </mesh>
        <CoastDots mobile={mobile} glow={glow} />
        {routes.slice(0, mobile ? 9 : routes.length).map(([start, end], index) => (
          <FlightPath key={index} start={start} end={end} index={index} animate={animate} />
        ))}
        <mesh scale={1.03}>
          <sphereGeometry args={[RADIUS, 64, 48]} />
          <shaderMaterial
            vertexShader={`varying vec3 vNormal; varying vec3 vView; void main(){ vec4 p=modelViewMatrix*vec4(position,1.0); vNormal=normalize(normalMatrix*normal); vView=normalize(-p.xyz); gl_Position=projectionMatrix*p; }`}
            fragmentShader={`varying vec3 vNormal; varying vec3 vView; void main(){ float rim=pow(1.0-abs(dot(normalize(vNormal),normalize(vView))),3.0); gl_FragColor=vec4(0.35,0.83,0.97,rim*0.56); }`}
            transparent
            side={BackSide}
            blending={AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      </group>
      <Starfield mobile={mobile} foreground />
    </>
  );
}

export default function BetawiseGlobe({ label }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(false);
  const [tabVisible, setTabVisible] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    const narrow = matchMedia('(max-width: 760px)');
    const update = () => {
      setReducedMotion(motion.matches);
      setMobile(narrow.matches);
    };
    update();
    motion.addEventListener('change', update);
    narrow.addEventListener('change', update);
    const test = document.createElement('canvas');
    try {
      const context = test.getContext('webgl2') || test.getContext('webgl');
      setReady(Boolean(context));
      context?.getExtension('WEBGL_lose_context')?.loseContext();
    } catch {
      setReady(false);
    }
    const inView = new Set<Element>();
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) inView.add(entry.target);
        else inView.delete(entry.target);
      }
      setVisible(inView.size > 0);
    }, { threshold: 0.02 });
    if (host.current) observer.observe(host.current);
    const about = document.querySelector('#about');
    if (about) observer.observe(about);
    const updateVisibility = () => setTabVisible(!document.hidden);
    document.addEventListener('visibilitychange', updateVisibility);
    updateVisibility();
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', updateVisibility);
      motion.removeEventListener('change', update);
      narrow.removeEventListener('change', update);
    };
  }, []);
  const fallback = (
    <picture className="globe-fallback-picture">
      <source media="(max-width: 760px)" srcSet="/data/betawise-poster-mobile.webp" />
      <source media="(min-width: 1600px)" srcSet="/data/betawise-poster-wide.webp" />
      <img
        className="globe-fallback"
        src="/data/betawise-poster.webp"
        width="1440"
        height="620"
        alt={label}
        loading="eager"
        decoding="async"
      />
    </picture>
  );
  const active = visible && tabVisible && !reducedMotion;
  return (
    <div className="world-canvas world-canvas--betawise" ref={host} role="group" aria-label={label} data-animation={active ? 'running' : 'paused'}>
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
                gl.domElement.addEventListener('webglcontextlost', (event) => {
                  event.preventDefault();
                  setReady(false);
                }, { once: true });
              }}
            >
              <Earth animate={active} mobile={mobile} />
            </Canvas>
          </Suspense>
        </Boundary>
      ) : fallback}
    </div>
  );
}
