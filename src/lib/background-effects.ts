type Mode = 'crt' | 'laser' | 'arc' | 'particles' | 'knowledge';

interface Effect {
  element: HTMLElement;
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  mode: Mode;
  width: number;
  height: number;
  visible: boolean;
  pointer: { x: number; y: number };
  seed: number;
}

const effects = [...document.querySelectorAll<HTMLElement>('[data-background-effect]')]
  .map((element, index): Effect | null => {
    const canvas = element.querySelector('canvas');
    const context = canvas?.getContext('2d', { alpha: true });
    if (!canvas || !context) return null;
    return {
      element,
      canvas,
      context,
      mode: element.dataset.backgroundEffect as Mode,
      width: 0,
      height: 0,
      visible: false,
      pointer: { x: 0.78, y: 0.5 },
      seed: index * 31 + 11,
    };
  })
  .filter((effect): effect is Effect => effect !== null);

const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
const TWO_PI = Math.PI * 2;
const red = '208, 0, 36';

function hash(value: number) {
  const n = Math.sin(value * 127.1) * 43758.5453;
  return n - Math.floor(n);
}

function resize(effect: Effect) {
  const { width, height } = effect.element.getBoundingClientRect();
  if (!width || !height) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  effect.width = width;
  effect.height = height;
  effect.canvas.width = Math.round(width * dpr);
  effect.canvas.height = Math.round(height * dpr);
  effect.context.setTransform(dpr, 0, 0, dpr, 0, 0);
  draw(effect, performance.now() / 1000);
}

function line(
  context: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string | CanvasGradient,
  width = 1,
) {
  context.beginPath();
  context.moveTo(x1, y1);
  context.lineTo(x2, y2);
  context.strokeStyle = color;
  context.lineWidth = width;
  context.stroke();
}

function drawCrt(effect: Effect, time: number) {
  const { context: ctx, width: w, height: h } = effect;
  const pad = Math.max(20, Math.min(w * 0.055, 65));
  const small = w < 650;
  const fontSize = small ? 11 : 14;
  const row = small ? 23 : 27;
  const top = small ? 53 : 61;
  const sequences = [
    '> ALGEBRA / SYSTEM INTELLIGENCE',
    '01  DATA STREAM     [ CONNECTED ]',
    '02  INFRASTRUCTURE  [ ACTIVE ]',
    '03  ENERGY NETWORK  [ OPTIMIZED ]',
    '04  FUTURE SYSTEMS  [ READY ]',
    '> PROCESSING SIGNALS',
  ];
  ctx.fillStyle = '#080c0d';
  ctx.fillRect(0, 0, w, h);
  const glow = ctx.createRadialGradient(w * 0.7, h * 0.4, 0, w * 0.7, h * 0.4, w * 0.7);
  glow.addColorStop(0, 'rgba(92, 11, 24, .24)');
  glow.addColorStop(1, 'transparent');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);
  ctx.font = `500 ${fontSize}px ui-monospace, SFMono-Regular, Consolas, monospace`;
  ctx.textBaseline = 'middle';
  const cycle = (time * 16) % (sequences.join('').length + 58);
  let position = 0;
  sequences.forEach((text, index) => {
    const shown = Math.max(0, Math.min(text.length, Math.floor(cycle - position)));
    position += text.length + 7;
    if (shown <= 0 || top + index * row > h - 20) return;
    ctx.shadowColor = index === 0 || index === 5 ? 'rgba(208,0,36,.6)' : 'rgba(221,246,236,.25)';
    ctx.shadowBlur = 8;
    ctx.fillStyle = index === 0 || index === 5 ? '#e44961' : '#c5d6d2';
    ctx.fillText(text.slice(0, shown), pad, top + index * row);
    ctx.shadowBlur = 0;
    if (shown < text.length && Math.floor(time * 2) % 2 === 0) {
      const cursor = ctx.measureText(text.slice(0, shown)).width;
      ctx.fillStyle = '#e44961';
      ctx.fillRect(pad + cursor + 3, top + index * row - 8, 7, 15);
    }
  });
  ctx.fillStyle = 'rgba(220,239,231,.18)';
  ctx.font = '10px ui-monospace, SFMono-Regular, Consolas, monospace';
  ctx.fillText('LIVE / 001', w - pad - 70, 26);
  for (let y = 0; y < h; y += 4) {
    line(ctx, 0, y, w, y, 'rgba(0,0,0,.15)');
  }
  const scanY = (time * 26) % (h + 55) - 55;
  const scan = ctx.createLinearGradient(0, scanY, 0, scanY + 55);
  scan.addColorStop(0, 'transparent');
  scan.addColorStop(0.55, 'rgba(220,245,236,.045)');
  scan.addColorStop(1, 'transparent');
  ctx.fillStyle = scan;
  ctx.fillRect(0, scanY, w, 55);
}

function drawLaser(effect: Effect, time: number) {
  const { context: ctx, width: w, height: h, pointer } = effect;
  ctx.clearRect(0, 0, w, h);
  const focusX = w * pointer.x;
  const focusY = h * pointer.y;
  const originX = w * 0.82;
  const originY = h * 0.43;
  const halo = ctx.createRadialGradient(originX, originY, 0, originX, originY, w * 0.44);
  halo.addColorStop(0, 'rgba(208,0,36,.25)');
  halo.addColorStop(1, 'transparent');
  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, w, h);
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  for (let i = 0; i < 9; i++) {
    const phase = i * 1.73 + time * (i % 2 ? 0.23 : -0.2);
    const y = h * (0.08 + i * 0.115) + Math.sin(phase) * 10;
    const x = w * (0.43 + i * 0.055);
    const endpointX = focusX + Math.cos(phase) * w * 0.2;
    const endpointY = focusY + Math.sin(phase * 1.3) * h * 0.55;
    const gradient = ctx.createLinearGradient(x, y, endpointX, endpointY);
    gradient.addColorStop(0, 'rgba(208,0,36,0)');
    gradient.addColorStop(0.48, `rgba(${red},${0.13 + 0.08 * Math.sin(time + i)})`);
    gradient.addColorStop(0.95, 'rgba(255,56,76,.55)');
    gradient.addColorStop(1, 'rgba(255,180,180,.04)');
    line(ctx, x, y, endpointX, endpointY, gradient, i % 3 === 0 ? 1.6 : 0.75);
    if (i % 3 === 0) {
      ctx.beginPath();
      ctx.arc(endpointX, endpointY, 2.2, 0, TWO_PI);
      ctx.fillStyle = 'rgba(255,97,107,.7)';
      ctx.fill();
    }
  }
  ctx.restore();
}

function bezierPoint(t: number, p0: number, p1: number, p2: number, p3: number) {
  const u = 1 - t;
  return u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3;
}

function drawArc(effect: Effect, time: number) {
  const { context: ctx, width: w, height: h } = effect;
  ctx.clearRect(0, 0, w, h);
  const paths = [
    [w * 0.55, h * 0.91, w * 0.74, h * 0.12, w * 0.88, h * 0.85, w * 1.05, h * 0.2],
    [w * 0.48, h * 0.78, w * 0.66, h * 0.35, w * 0.87, h * 0.2, w * 1.03, h * 0.7],
    [w * 0.66, h * 1.04, w * 0.73, h * 0.44, w * 0.88, h * 0.4, w * 1.05, h * 0.08],
  ];
  paths.forEach((p, index) => {
    ctx.beginPath();
    ctx.moveTo(p[0]!, p[1]!);
    ctx.bezierCurveTo(p[2]!, p[3]!, p[4]!, p[5]!, p[6]!, p[7]!);
    ctx.strokeStyle = `rgba(${red},${index === 0 ? 0.3 : 0.16})`;
    ctx.lineWidth = index === 0 ? 1.25 : 0.8;
    ctx.stroke();
    for (let n = 0; n < 7; n++) {
      const t = (n / 7 + time * (index % 2 ? 0.038 : 0.028)) % 1;
      const x = bezierPoint(t, p[0]!, p[2]!, p[4]!, p[6]!);
      const y = bezierPoint(t, p[1]!, p[3]!, p[5]!, p[7]!);
      const radius = n % 3 === 0 ? 2.5 : 1.4;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, TWO_PI);
      ctx.fillStyle = n % 3 === 0 ? '#e72445' : 'rgba(236,92,110,.65)';
      ctx.shadowColor = '#d00024';
      ctx.shadowBlur = 9;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  });
  for (let i = 0; i < 30; i++) {
    const x = w * (0.58 + hash(i * 3.7) * 0.42);
    const y = h * hash(i * 5.9 + 3);
    const alpha = 0.06 + 0.11 * (0.5 + 0.5 * Math.sin(time * 0.7 + i));
    ctx.fillStyle = `rgba(${red},${alpha})`;
    ctx.fillRect(x, y, 1, 1);
  }
}

function drawParticles(effect: Effect, time: number) {
  const { context: ctx, width: w, height: h, seed } = effect;
  ctx.clearRect(0, 0, w, h);
  const count = Math.max(22, Math.min(46, Math.floor(w * h / 4300)));
  const points = Array.from({ length: count }, (_, i) => {
    const x = (hash(i * 1.871 + seed) * w + Math.sin(time * 0.24 + i) * 10 + w) % w;
    const y = (hash(i * 2.711 + seed) * h + Math.cos(time * 0.19 + i * 0.6) * 8 + h) % h;
    return { x, y };
  });
  points.forEach((point, i) => {
    for (let j = i + 1; j < count; j++) {
      const other = points[j]!;
      const distance = Math.hypot(point.x - other.x, point.y - other.y);
      if (distance < 87) {
        line(ctx, point.x, point.y, other.x, other.y, `rgba(214,227,231,${(1 - distance / 87) * 0.28})`, 0.7);
      }
    }
    ctx.beginPath();
    ctx.arc(point.x, point.y, i % 7 === 0 ? 2 : 1.15, 0, TWO_PI);
    ctx.fillStyle = i % 7 === 0 ? 'rgba(232,43,72,.82)' : 'rgba(225,238,242,.65)';
    ctx.fill();
  });
}

function drawKnowledge(effect: Effect, time: number) {
  const { context: ctx, width: w, height: h, seed } = effect;
  ctx.clearRect(0, 0, w, h);
  const count = Math.min(105, Math.max(48, Math.floor((w * h) / 8900)));
  const points = Array.from({ length: count }, (_, i) => {
    const baseX = hash(i * 1.871 + seed) * w;
    const baseY = hash(i * 2.711 + seed) * h;
    return {
      x: (baseX + Math.sin(time * 0.18 + i * 0.9) * 18 + w) % w,
      y: (baseY + Math.cos(time * 0.16 + i * 0.7) * 13 + h) % h,
    };
  });
  points.forEach((point, i) => {
    for (let j = i + 1; j < count; j++) {
      const other = points[j]!;
      const distance = Math.hypot(point.x - other.x, point.y - other.y);
      if (distance < 140) {
        const alpha = (1 - distance / 140) * (i % 9 === 0 ? 0.33 : 0.2);
        line(ctx, point.x, point.y, other.x, other.y, `rgba(178,196,215,${alpha})`, 0.8);
      }
    }
    const pulse = 0.7 + Math.sin(time * 0.8 + i) * 0.25;
    ctx.beginPath();
    ctx.arc(point.x, point.y, i % 11 === 0 ? 2.5 : 1.25, 0, TWO_PI);
    ctx.fillStyle = i % 11 === 0 ? `rgba(223,31,64,${pulse})` : `rgba(222,234,247,${0.32 * pulse})`;
    ctx.fill();
  });
}

function draw(effect: Effect, time: number) {
  if (!effect.width || !effect.height) return;
  if (effect.mode === 'crt') drawCrt(effect, time);
  if (effect.mode === 'laser') drawLaser(effect, time);
  if (effect.mode === 'arc') drawArc(effect, time);
  if (effect.mode === 'particles') drawParticles(effect, time);
  if (effect.mode === 'knowledge') drawKnowledge(effect, time);
}

if (effects.length) {
  const resizeObserver = new ResizeObserver((entries) => {
    entries.forEach((entry) => {
      const effect = effects.find((item) => item.element === entry.target);
      if (effect) resize(effect);
    });
  });
  const visibilityObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const effect = effects.find((item) => item.element === entry.target);
        if (effect) {
          effect.visible = entry.isIntersecting;
          if (entry.isIntersecting) draw(effect, performance.now() / 1000);
        }
      });
    },
    { rootMargin: '100px' },
  );
  effects.forEach((effect) => {
    resizeObserver.observe(effect.element);
    visibilityObserver.observe(effect.element);
    if (effect.mode === 'laser') {
      effect.element.parentElement?.addEventListener('pointermove', (event) => {
        const bounds = effect.element.getBoundingClientRect();
        effect.pointer.x = Math.max(0, Math.min(1, (event.clientX - bounds.left) / bounds.width));
        effect.pointer.y = Math.max(0, Math.min(1, (event.clientY - bounds.top) / bounds.height));
      });
    }
  });
  let previousFrame = 0;
  function frame(now: number) {
    if (now - previousFrame > 33 && !document.hidden && !motionQuery.matches) {
      previousFrame = now;
      effects.forEach((effect) => {
        if (effect.visible) draw(effect, now / 1000);
      });
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
