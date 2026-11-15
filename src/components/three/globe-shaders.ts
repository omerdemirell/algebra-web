// Original, small shaders: no bloom render pass or screen-sized blur buffers.
export const globeVertex = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vUv = uv;
    vec4 positionView = modelViewMatrix * vec4(position, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vView = -positionView.xyz;
    gl_Position = projectionMatrix * positionView;
  }
`;

export const surfaceFragment = /* glsl */ `
  uniform sampler2D uMap;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vec3 normal = normalize(vNormal);
    vec3 view = normalize(vView);
    vec3 light = normalize(vec3(-0.7, 0.9, 1.4));
    float map = texture2D(uMap, vUv).r;
    float land = smoothstep(0.08, 0.85, map);
    float day = max(dot(normal, light), 0.0);
    float edge = pow(1.0 - max(dot(normal, view), 0.0), 3.0);

    vec3 ocean = vec3(0.009, 0.014, 0.023);
    vec3 continent = vec3(0.05, 0.065, 0.085);
    vec3 color = mix(ocean, continent, land) * (0.35 + day * 0.95);

    // Fine geographic point matrix, attached to the rotating surface.
    vec2 cell = fract(vUv * vec2(360.0, 180.0)) - 0.5;
    float dotDistance = length(cell);
    float aa = max(fwidth(dotDistance), 0.025);
    float point = 1.0 - smoothstep(0.20 - aa, 0.20 + aa, dotDistance);
    color += point * land * vec3(0.18, 0.21, 0.26) * (0.3 + day * 0.7);

    vec2 gridUv = vUv * vec2(24.0, 12.0);
    vec2 gridDistance = abs(fract(gridUv - 0.5) - 0.5) / max(fwidth(gridUv), vec2(0.0001));
    float grid = 1.0 - clamp(min(gridDistance.x, gridDistance.y), 0.0, 1.0);
    color += grid * vec3(0.016, 0.021, 0.029) * (0.35 + day * 0.65);

    float shine = pow(max(dot(normal, normalize(light + view)), 0.0), 48.0);
    color += shine * (1.0 - land) * vec3(0.065, 0.075, 0.09);
    color += edge * vec3(0.055, 0.07, 0.095) * (0.2 + day * 0.8);
    gl_FragColor = vec4(color, 1.0);
    #include <colorspace_fragment>
  }
`;

export const atmosphereFragment = /* glsl */ `
  uniform vec3 uRed;
  uniform vec3 uCool;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    vec3 normal = normalize(vNormal);
    float rim = pow(1.0 - abs(dot(normal, normalize(vView))), 3.4);
    float warm = 1.0 - smoothstep(-0.8, 0.3, normal.x - normal.y * 0.35);
    vec3 color = mix(uCool, uRed, warm);
    gl_FragColor = vec4(color, rim * 0.38);
    #include <colorspace_fragment>
  }
`;

export const beamFragment = /* glsl */ `
  uniform float uTime;
  uniform float uDuration;
  uniform float uPhase;
  uniform float uGlow;
  uniform vec3 uColor;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vView;
  void main() {
    float distanceBehindHead = fract(uTime / uDuration + uPhase - vUv.x);
    float trail = 1.0 - smoothstep(0.0, 0.23, distanceBehindHead);
    float opacity = mix(0.055 + pow(trail, 1.8) * 0.9, pow(trail, 1.35) * 0.18, uGlow);
    float softness = pow(abs(dot(normalize(vNormal), normalize(vView))), 1.6);
    opacity *= mix(1.0, softness, uGlow);
    vec3 color = uColor * (1.0 + trail * 1.8);
    gl_FragColor = vec4(color, opacity);
    #include <colorspace_fragment>
  }
`;
