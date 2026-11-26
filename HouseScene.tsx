// @ts-nocheck
// HouseScene: interactive 3D moments for The Invisible Dead Zones case study.
// Loads three.js only on wide screens, when in view, and never for reduced motion. Otherwise shows the poster image.
import * as React from "react"
import { addPropertyControls, ControlType, RenderTarget } from "framer"

const THREE_URL = "https://esm.sh/three@0.170.0"
let threePromise = null
const loadThree = () => (threePromise ||= import(/* @vite-ignore */ THREE_URL))

const C = { bg: 15922422, ink: 1579035, accent: 28646, signal: 15486759, coverage: 39020 };
const INK_CSS = "#18181B", SIGNAL_CSS = "#C2410C", ACCENT_CSS = "#0059C2", MUTED_CSS = "#68686D";
const PX = 28.93, PY = 30.15, FH = 11;
const P = (x, y) => [(x - 239) / PX - 15, (y - 214) / PY - 20];
const PLANS = {
  g: [[381, 270, 1105, 270], [381, 270, 381, 313], [381, 383, 381, 850], [381, 618, 668, 618], [733, 270, 733, 398], [1025, 270, 1025, 460], [1105, 270, 1105, 522], [1065, 522, 1105, 522], [733, 528, 1065, 528], [733, 612, 733, 850], [833, 618, 1060, 618], [381, 850, 1065, 850], [1065, 528, 1065, 1390], [432, 1062, 432, 1390], [432, 1390, 1070, 1390]],
  f2: [[381, 270, 1105, 270], [381, 270, 381, 435], [381, 435, 490, 435], [485, 270, 485, 318], [485, 405, 485, 435], [733, 270, 733, 398], [1025, 270, 1025, 460], [1105, 270, 1105, 522], [1065, 522, 1105, 522], [381, 525, 381, 918], [381, 918, 432, 918], [733, 528, 1065, 528], [733, 528, 733, 805], [808, 800, 1065, 800], [840, 800, 840, 850], [432, 918, 740, 918], [830, 918, 1065, 918], [835, 918, 835, 1030], [890, 1038, 1065, 1038], [1065, 528, 1065, 1390], [733, 1e3, 733, 1390], [523, 1250, 733, 1250], [432, 918, 432, 1390], [432, 1390, 1070, 1390]],
  f3: [[378, 918, 740, 918], [733, 800, 1070, 800], [733, 800, 733, 918], [1065, 800, 1065, 1390], [830, 918, 1065, 918], [830, 918, 830, 940], [830, 1038, 1065, 1038], [432, 968, 432, 1390], [733, 1033, 733, 1390], [523, 1250, 733, 1250], [432, 1390, 1070, 1390]]
};
const ROUTER = [715, 660];
function buildScene(canvas, kind, bg, T) {
  const renderer = new T.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(window.devicePixelRatio || 1);
  renderer.outputColorSpace = T.SRGBColorSpace;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.PCFSoftShadowMap;
  const scene = new T.Scene();
  scene.background = new T.Color(bg);
  const camera = new T.PerspectiveCamera(30, 1.6, 1, 800);
  scene.add(new T.HemisphereLight(16777215, 14277088, 2.3));
  const sun = new T.DirectionalLight(16777215, 2.4);
  sun.position.set(-45, 95, 55);
  sun.castShadow = true;
  sun.shadow.mapSize.set(3072, 3072);
  const sc = sun.shadow.camera;
  sc.left = -60;
  sc.right = 60;
  sc.top = 60;
  sc.bottom = -60;
  sc.near = 10;
  sc.far = 260;
  sun.shadow.bias = -6e-4;
  scene.add(sun);
  const ground = new T.Mesh(new T.PlaneGeometry(600, 600), new T.ShadowMaterial({ opacity: kind === "arch" ? 0.05 : 0.09 }));
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.82;
  ground.receiveShadow = true;
  scene.add(ground);
  const addBox = (g, mats, x1, z1, x2, z2, h, t) => {
    const dx = x2 - x1, dz = z2 - z1, len = Math.hypot(dx, dz);
    const geo = new T.BoxGeometry(len + t, h, t);
    const m = new T.Mesh(geo, mats.wall);
    m.position.set((x1 + x2) / 2, h / 2, (z1 + z2) / 2);
    m.rotation.y = -Math.atan2(dz, dx);
    m.castShadow = true;
    m.receiveShadow = true;
    g.add(m);
    const e = new T.LineSegments(new T.EdgesGeometry(geo), mats.edge);
    e.position.copy(m.position);
    e.rotation.copy(m.rotation);
    g.add(e);
  };
  const floors = [];
  const plans = [PLANS.g, PLANS.f2, PLANS.f2, PLANS.f3];
  for (let i = 0; i < 4; i++) {
    const g = new T.Group();
    g.position.y = i * FH;
    const mats = {
      wall: new T.MeshStandardMaterial({ color: 16777215, roughness: 0.92, metalness: 0 }),
      slab: new T.MeshStandardMaterial({ color: 15527665, roughness: 1, metalness: 0 }),
      stair: new T.MeshStandardMaterial({ color: 14869480, roughness: 1, metalness: 0 }),
      edge: new T.LineBasicMaterial({ color: 12106176 })
    };
    const a = P(239, 265), b = P(1107, 1400);
    const slabGeo = new T.BoxGeometry(b[0] - a[0], 0.8, b[1] - a[1]);
    const slab = new T.Mesh(slabGeo, mats.slab);
    slab.position.set((a[0] + b[0]) / 2, -0.4, (a[1] + b[1]) / 2);
    slab.receiveShadow = true;
    slab.castShadow = true;
    g.add(slab);
    const se = new T.LineSegments(new T.EdgesGeometry(slabGeo), mats.edge);
    se.position.copy(slab.position);
    g.add(se);
    plans[i].forEach((w) => {
      const p1 = P(w[0], w[1]), p2 = P(w[2], w[3]);
      addBox(g, mats, p1[0], p1[1], p2[0], p2[1], 9, 0.5);
    });
    const r1 = P(239, 300), r2 = P(239, 1060);
    addBox(g, mats, r1[0], r1[1], r2[0], r2[1], 3.2, 0.3);
    for (let k = 0; k < 10; k++) {
      const yA = 1340 - (k + 1) * 27.8, yB = 1062 + k * 27.8;
      const runs = [[P(245, yA), P(333, yA + 27.8), (k + 1) * FH / 20], [P(338, yB), P(425, yB + 27.8), FH / 2 + (k + 1) * FH / 20]];
      runs.forEach(([s0, s1, h]) => {
        const st = new T.Mesh(new T.BoxGeometry(s1[0] - s0[0], 0.5, s1[1] - s0[1]), mats.stair);
        st.position.set((s0[0] + s1[0]) / 2, h - 0.25, (s0[1] + s1[1]) / 2);
        st.castShadow = true;
        st.receiveShadow = true;
        g.add(st);
      });
    }
    scene.add(g);
    floors.push({ g, mats, opacity: 1 });
  }
  const setFloor = (f, o) => {
    if (Math.abs(f.opacity - o) < 2e-3) return;
    f.opacity = o;
    Object.values(f.mats).forEach((m) => {
      m.transparent = o < 0.995;
      m.opacity = o;
      m.depthWrite = o > 0.6;
      m.needsUpdate = true;
    });
    f.g.visible = o > 0.02;
  };
  const makeLabel = (text, color = INK_CSS, size2 = 1.7) => {
    const c = document.createElement("canvas");
    const ctx = c.getContext("2d");
    const fs = 96;
    const font = `600 ${fs}px Jakarta, ui-sans-serif, system-ui, sans-serif`;
    ctx.font = font;
    const w = Math.ceil(ctx.measureText(text).width) + 84, h = fs + 60;
    c.width = w;
    c.height = h;
    ctx.font = font;
    const r = h / 2;
    ctx.fillStyle = "rgba(255,255,255,0.96)";
    ctx.beginPath();
    ctx.moveTo(r, 0);
    ctx.lineTo(w - r, 0);
    ctx.arc(w - r, r, r, -Math.PI / 2, Math.PI / 2);
    ctx.lineTo(r, h);
    ctx.arc(r, r, r, Math.PI / 2, Math.PI * 1.5);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = color;
    ctx.textBaseline = "middle";
    ctx.fillText(text, 42, h / 2 + 4);
    const tex = new T.CanvasTexture(c);
    tex.colorSpace = T.SRGBColorSpace;
    tex.anisotropy = 8;
    const sp = new T.Sprite(new T.SpriteMaterial({ map: tex, transparent: true, depthTest: false, depthWrite: false }));
    sp.scale.set(size2 * w / h, size2, 1);
    sp.renderOrder = 20;
    return sp;
  };
  const at = (obj, px, py, y = 0) => {
    const p = P(px, py);
    obj.position.set(p[0], y, p[1]);
    return obj;
  };
  const segX = (ax, ay, bx, by, w) => {
    const o = (px, py, qx, qy, rx, ry) => (qx - px) * (ry - py) - (qy - py) * (rx - px);
    const d1 = o(ax, ay, bx, by, w[0], w[1]), d2 = o(ax, ay, bx, by, w[2], w[3]);
    const d3 = o(w[0], w[1], w[2], w[3], ax, ay), d4 = o(w[0], w[1], w[2], w[3], bx, by);
    return d1 * d2 < 0 && d3 * d4 < 0;
  };
  const STOPS = [[0, [236, 79, 39, 0.72]], [0.22, [245, 160, 110, 0.55]], [0.38, [236, 238, 242, 0.3]], [0.55, [90, 190, 150, 0.45]], [1, [0, 152, 108, 0.62]]];
  const ramp = (s) => {
    s = Math.max(0, Math.min(1, s));
    for (let i = 1; i < STOPS.length; i++) if (s <= STOPS[i][0]) {
      const a = STOPS[i - 1], b = STOPS[i], t = (s - a[0]) / (b[0] - a[0]);
      return a[1].map((v, k) => v + (b[1][k] - v) * t);
    }
    return STOPS[STOPS.length - 1][1];
  };
  const heatPlane = (walls, inside, dz, slabLoss) => {
    const step = 2, W = Math.round(868 / step), H = Math.round(1135 / step);
    const c = document.createElement("canvas");
    c.width = W;
    c.height = H;
    const ctx = c.getContext("2d");
    const img = ctx.createImageData(W, H);
    for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
      const px = 239 + (i + 0.5) * step, py = 265 + (j + 0.5) * step;
      if (!inside(px, py)) continue;
      const dx = (px - ROUTER[0]) / PX, dy = (py - ROUTER[1]) / PY;
      const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
      let n = 0;
      for (const w of walls) if (segX(ROUTER[0], ROUTER[1], px, py, w)) n++;
      const col = ramp(1 - d / 48 - n * 0.17 - slabLoss);
      const idx = (j * W + i) * 4;
      img.data[idx] = col[0];
      img.data[idx + 1] = col[1];
      img.data[idx + 2] = col[2];
      img.data[idx + 3] = Math.round(col[3] * 255);
    }
    ctx.putImageData(img, 0, 0);
    const tex = new T.CanvasTexture(c);
    tex.colorSpace = T.SRGBColorSpace;
    tex.minFilter = T.LinearFilter;
    tex.magFilter = T.LinearFilter;
    const a = P(239, 265), b = P(1107, 1400);
    const m = new T.Mesh(new T.PlaneGeometry(b[0] - a[0], b[1] - a[1]), new T.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0, depthWrite: false }));
    m.rotation.x = -Math.PI / 2;
    m.position.set((a[0] + b[0]) / 2, 0.06, (a[1] + b[1]) / 2);
    m.renderOrder = 5;
    return m;
  };
  const inside2 = (x, y) => x >= 381 && x <= 1065 && y >= 270 && y <= 1390 && !(x < 432 && y > 918) || x > 1065 && x <= 1105 && y >= 270 && y <= 522 || x >= 239 && x < 381 && y >= 265 && y <= 1060 || x >= 239 && x < 432 && y > 1060 && y <= 1395;
  const inside3 = (x, y) => x >= 432 && x <= 1065 && y >= 918 && y <= 1390 || x >= 733 && x <= 1065 && y >= 800 && y < 918 || x >= 239 && x < 432 && y >= 1060 && y <= 1395;
  const glowTex = (() => {
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const ctx = c.getContext("2d");
    const gr = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, "rgba(0,111,230,0.9)");
    gr.addColorStop(0.35, "rgba(0,111,230,0.35)");
    gr.addColorStop(1, "rgba(0,111,230,0)");
    ctx.fillStyle = gr;
    ctx.fillRect(0, 0, 128, 128);
    return new T.CanvasTexture(c);
  })();
  const f2 = floors[2].g, f3 = floors[3].g;
  let routerGlow = null;
  const rings = [];
  const addRouter = () => {
    const grp = new T.Group();
    const body = new T.Mesh(new T.BoxGeometry(1.1, 0.35, 0.8), new T.MeshStandardMaterial({ color: 16777215, roughness: 0.6 }));
    body.position.y = 3.6;
    body.castShadow = true;
    grp.add(body);
    routerGlow = new T.Sprite(new T.SpriteMaterial({ map: glowTex, transparent: true, depthWrite: false, opacity: 0 }));
    routerGlow.scale.set(6, 6, 1);
    routerGlow.position.y = 3.8;
    grp.add(routerGlow);
    at(grp, ROUTER[0], ROUTER[1], 0);
    f2.add(grp);
    for (let i = 0; i < 3; i++) {
      const m = new T.Mesh(new T.RingGeometry(0.94, 1, 96), new T.MeshBasicMaterial({ color: C.accent, transparent: true, opacity: 0, side: T.DoubleSide, depthWrite: false }));
      m.rotation.x = -Math.PI / 2;
      at(m, ROUTER[0], ROUTER[1], 0.25);
      m.renderOrder = 6;
      f2.add(m);
      rings.push(m);
    }
  };
  let tint = null;
  if (kind === "hero") {
    addRouter();
    const a = P(239, 265), b = P(1107, 1400);
    tint = new T.Mesh(new T.PlaneGeometry(b[0] - a[0], b[1] - a[1]), new T.MeshBasicMaterial({ color: C.coverage, transparent: true, opacity: 0, depthWrite: false }));
    tint.rotation.x = -Math.PI / 2;
    tint.position.set((a[0] + b[0]) / 2, 0.05, (a[1] + b[1]) / 2);
    f2.add(tint);
  }
  let heat2 = null, heat3 = null;
  const labels2 = [], labels3 = [];
  let r2Mat = null, personMat = null;
  const people = [];
  const DAY = [[540, 620], [610, 700], [520, 770]];
  const NIGHT = [[900, 640], [905, 1235], [585, 1110]];
  if (kind === "explore") {
    addRouter();
    heat2 = heatPlane(PLANS.f2, inside2, 0, 0);
    f2.add(heat2);
    heat3 = heatPlane(PLANS.f3, inside3, FH, 0.3);
    f3.add(heat3);
    [["Kitchen", 880, 400], ["Pooja", 433, 352], ["Hall", 545, 560], ["R1", 900, 664], ["R2", 900, 1214, SIGNAL_CSS], ["R3", 582, 1154], ["WC", 950, 925], ["Stairs", 335, 1200]].forEach(([t, x, y, c]) => {
      const sp = at(makeLabel(t, c), x, y, 1.4);
      f2.add(sp);
      labels2.push(sp);
    });
    [["Third floor \xB7 rooms", 760, 1170, SIGNAL_CSS], ["Open terrace", 700, 520]].forEach(([t, x, y, c]) => {
      const sp = at(makeLabel(t, c), x, y, 1.4);
      f3.add(sp);
      labels3.push(sp);
    });
    r2Mat = new T.MeshBasicMaterial({ color: C.signal, transparent: true, opacity: 0, depthWrite: false });
    [[733, 1038, 1065, 1038], [1065, 1038, 1065, 1390], [1065, 1390, 733, 1390], [733, 1390, 733, 1038]].forEach((s) => {
      const p1 = P(s[0], s[1]), p2 = P(s[2], s[3]);
      const len = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]);
      const m = new T.Mesh(new T.BoxGeometry(len + 0.35, 0.12, 0.35), r2Mat);
      m.position.set((p1[0] + p2[0]) / 2, 0.12, (p1[1] + p2[1]) / 2);
      m.rotation.y = -Math.atan2(p2[1] - p1[1], p2[0] - p1[0]);
      m.renderOrder = 7;
      f2.add(m);
    });
    personMat = new T.MeshStandardMaterial({ color: C.ink, roughness: 0.5, transparent: true, opacity: 0 });
    DAY.forEach(() => {
      const m = new T.Mesh(new T.CapsuleGeometry(0.6, 1.5, 6, 16), personMat);
      m.castShadow = true;
      f2.add(m);
      people.push(m);
    });
  }
  let arch = null;
  if (kind === "arch") {
    const LIFT = 9;
    floors[3].g.position.y = 3 * FH + LIFT;
    const syro = new T.Mesh(new T.BoxGeometry(1.2, 0.4, 0.9), new T.MeshStandardMaterial({ color: 16777215, roughness: 0.5 }));
    at(syro, 715, 640, 3.6);
    syro.castShadow = true;
    f2.add(syro);
    const deco = new T.Mesh(new T.CylinderGeometry(0.5, 0.5, 1.2, 32), new T.MeshStandardMaterial({ color: 16777215, roughness: 0.4 }));
    at(deco, 715, 700, 4);
    deco.castShadow = true;
    f2.add(deco);
    const sat = new T.Mesh(new T.CylinderGeometry(0.5, 0.5, 1.2, 32), new T.MeshStandardMaterial({ color: 16777215, roughness: 0.4, transparent: true, opacity: 0 }));
    at(sat, 620, 1130, 0.6);
    f3.add(sat);
    const dome = (parent, px, py, r, color, wire = false) => {
      const m = new T.Mesh(new T.SphereGeometry(r, 96, 48, 0, Math.PI * 2, 0, Math.PI / 2), new T.MeshBasicMaterial({ color, transparent: true, opacity: 0, depthWrite: false, side: T.DoubleSide, wireframe: wire }));
      at(m, px, py, 0.1);
      m.renderOrder = 8;
      parent.add(m);
      const ring = new T.Mesh(new T.RingGeometry(r - 0.18, r, 192), new T.MeshBasicMaterial({ color, transparent: true, opacity: 0, depthWrite: false, side: T.DoubleSide }));
      ring.rotation.x = -Math.PI / 2;
      at(ring, px, py, 0.15);
      ring.renderOrder = 8;
      parent.add(ring);
      return { dome: m, ring };
    };
    const lab = {
      syroT: at(makeLabel("Syrotech \xB7 Wi-Fi #1", SIGNAL_CSS, 2.3), 715, 600, 10.2),
      decoT: at(makeLabel("Deco \xB7 Wi-Fi #2", ACCENT_CSS, 2.3), 715, 760, 5.4),
      syroP: at(makeLabel("Syrotech \xB7 routing only", MUTED_CSS, 2.3), 715, 600, 10.2),
      decoP: at(makeLabel("Deco \xB7 access point", ACCENT_CSS, 2.3), 715, 760, 5.4),
      sat: at(makeLabel("Satellite \xB7 placed after a backhaul test", ACCENT_CSS, 2.3), 620, 1130, 4.2),
      opt: at(makeLabel("Optional third node", MUTED_CSS, 2.1), 905, 1225, 3.2)
    };
    f2.add(lab.syroT, lab.decoT, lab.syroP, lab.decoP, lab.opt);
    f3.add(lab.sat);
    const pd = P(715, 700), ps = P(620, 1130);
    const lg = new T.BufferGeometry().setFromPoints([new T.Vector3(pd[0], 2 * FH + 4, pd[1]), new T.Vector3(pd[0], 2 * FH + 4, pd[1] + 2), new T.Vector3(ps[0], 3 * FH + LIFT + 0.6, ps[1])]);
    const back = new T.Line(lg, new T.LineDashedMaterial({ color: C.accent, dashSize: 0.8, gapSize: 0.6, transparent: true, opacity: 0 }));
    back.computeLineDistances();
    scene.add(back);
    arch = { dSyro: dome(f2, 715, 640, 15, C.signal), dDeco: dome(f2, 715, 700, 15, C.accent), dSat: dome(f3, 620, 1130, 12, C.accent), dOpt: dome(f2, 905, 1225, 7.5, C.accent), sat, back, lab };
  }
  const targets = (st, t, narrow, angle) => {
    const o = { cx: 0, cy: 0, cz: 0, lx: 0, ly: 0, lz: 0, shift: 0, low: 1, f2o: 1, f3o: 1, lift: 0, rings: 0, glow: 0, tint: 0, heat2: 0, heat3: 0, lab2: 0, lab3: 0, ppl: 0, night: 0, r2: 0, prop: 0 };
    const orbit = (R, H, ly) => {
      const a = angle;
      o.cx = R * Math.sin(a);
      o.cz = R * Math.cos(a);
      o.cy = H;
      o.lx = 0;
      o.ly = ly;
      o.lz = 0;
    };
    if (kind === "hero") {
      if (st.step <= 0) orbit(180, 88, 47);
      else if (st.step === 1) {
        orbit(130, 70, 24);
        o.low = 0.1;
        o.tint = 1;
      } else {
        o.cx = 30;
        o.cy = 64;
        o.cz = 50;
        o.ly = 22;
        o.lz = 1;
        o.low = 0.08;
        o.f3o = 0.1;
        o.lift = 16;
        o.rings = 1;
        o.glow = 1;
        o.tint = 0.4;
      }
    } else if (kind === "explore") {
      const e = st.step;
      Object.assign(o, { low: 0, f3o: 0, cx: 0, cy: 92, cz: 46, lx: 0, ly: 22, lz: 2, lab2: 1, glow: 1 });
      if (e >= 1) {
        o.heat2 = 1;
        o.r2 = 1;
        o.rings = 0.6;
      }
      if (e === 2) {
        o.ppl = 1;
        o.night = 0;
        o.heat2 = 0.75;
      }
      if (e === 3) {
        o.ppl = 1;
        o.night = 1;
        o.heat2 = 0.75;
      }
      if (e >= 4) Object.assign(o, { f3o: 1, heat3: 1, lab3: 1, lab2: 0, cy: 103, ly: 33, cz: 48, heat2: 0.5, r2: 0, rings: 0, glow: 0 });
    } else {
      Object.assign(o, { cx: 50, cy: 62, cz: 60, lx: 0, ly: 26, lz: 0, low: 0, prop: st.arch === "proposed" ? 1 : 0 });
    }
    return o;
  };
  const apply = (c, t) => {
    setFloor(floors[0], c.low);
    setFloor(floors[1], c.low);
    setFloor(floors[2], c.f2o);
    setFloor(floors[3], c.f3o);
    if (kind !== "arch") floors[3].g.position.y = 3 * FH + c.lift;
    if (routerGlow) routerGlow.material.opacity = c.glow;
    if (tint) tint.material.opacity = c.tint * 0.08;
    if (heat2) {
      heat2.material.opacity = c.heat2;
      heat2.visible = c.heat2 > 0.01;
    }
    if (heat3) {
      heat3.material.opacity = c.heat3;
      heat3.visible = c.heat3 > 0.01;
    }
    labels2.forEach((s) => {
      s.material.opacity = c.lab2;
      s.visible = c.lab2 > 0.01;
    });
    labels3.forEach((s) => {
      s.material.opacity = c.lab3;
      s.visible = c.lab3 > 0.01;
    });
    if (r2Mat) r2Mat.opacity = c.r2;
    if (personMat) {
      personMat.opacity = c.ppl;
      people.forEach((m, i) => {
        const d = DAY[i], n = NIGHT[i];
        const p = P(d[0] + (n[0] - d[0]) * c.night, d[1] + (n[1] - d[1]) * c.night);
        m.position.set(p[0], 1.4, p[1]);
        m.visible = c.ppl > 0.01;
      });
    }
    rings.forEach((m, i) => {
      const ph = (t * 0.32 + i / 3) % 1, s = 1 + ph * 17;
      m.scale.set(s, s, s);
      m.material.opacity = c.rings * (1 - ph) * 0.75;
      m.visible = c.rings > 0.01;
    });
    if (arch) {
      const today = 1 - c.prop, pr = c.prop;
      const setD = (d, o, fill = 0.13, edge = 0.8) => {
        d.dome.material.opacity = o * fill;
        d.ring.material.opacity = o * edge;
        d.dome.visible = d.ring.visible = o > 0.01;
      };
      setD(arch.dSyro, today);
      setD(arch.dDeco, 1);
      setD(arch.dSat, pr);
      setD(arch.dOpt, pr, 0.06, 0.4);
      arch.sat.material.opacity = pr;
      arch.sat.visible = pr > 0.01;
      arch.back.material.opacity = pr;
      arch.back.visible = pr > 0.01;
      const L = arch.lab;
      L.syroT.material.opacity = today;
      L.decoT.material.opacity = today;
      L.syroP.material.opacity = pr;
      L.decoP.material.opacity = pr;
      L.sat.material.opacity = pr;
      L.opt.material.opacity = pr;
    }
  };
  const FRAMING = { hero: { zoom: 0.6, angle: 0.75, ly: 18 }, explore: { zoom: 1, angle: 0 }, arch: { zoom: 1.22, angle: 0.9, ly: 30 } };
  let cur = null, time = 0, lastW = 0, lastH = 0;
  const size = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (w !== lastW || h !== lastH) {
      lastW = w;
      lastH = h;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
  };
  return {
    /** dt in seconds. drift: radians of slow orbit sway; tilt: -1..1 pointer parallax. */
    frame(st, dt, opts = {}) {
      size();
      time += dt;
      const fr = FRAMING[kind];
      const sway = (opts.drift ?? 0) * Math.sin(time * 0.25) + (opts.tilt ?? 0) * 0.08 + (opts.spin ?? 0);
      const tgt = targets(st, time, false, fr.angle + sway);
      const close = kind === "hero" && st.step >= 2;
      if (fr.ly != null && !close) tgt.ly = fr.ly;
      tgt.zoom = close ? 1.05 : fr.zoom;
      if (kind === "hero" && !close) {
        tgt.lx = opts.lx ?? 0;
        tgt.lz = opts.lz ?? 0;
      }
      if (!cur || opts.instant) cur = { ...tgt };
      else {
        const k = Math.min(1, dt * 3.2);
        for (const key in tgt) cur[key] += (tgt[key] - cur[key]) * k;
      }
      const f = cur.zoom;
      const rot = kind === "hero" ? 0 : sway, dx = (cur.cx - cur.lx) * f, dz = (cur.cz - cur.lz) * f;
      camera.position.set(cur.lx + dx * Math.cos(rot) - dz * Math.sin(rot), cur.ly + (cur.cy - cur.ly) * f, cur.lz + dx * Math.sin(rot) + dz * Math.cos(rot));
      camera.lookAt(cur.lx, cur.ly, cur.lz);
      apply(cur, time);
      renderer.render(scene, camera);
    },
    dispose() {
      renderer.dispose();
      scene.traverse((o) => {
        o.geometry?.dispose?.();
        const m = o.material;
        (Array.isArray(m) ? m : m ? [m] : []).forEach((x) => {
          x.map?.dispose?.();
          x.dispose?.();
        });
      });
    }
  };
}
export {
  buildScene
};


const STATES = {
    hero: [{ step: 0 }],
    explore: [{ step: 1 }, { step: 4 }],
    arch: [{ arch: "today" }, { arch: "proposed" }],
}

/**
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight auto
 * @framerIntrinsicWidth 720
 * @framerIntrinsicHeight 450
 */
export default function HouseScene(props) {
    const { kind = "explore", poster1, poster2, label1, label2, groupLabel, drag, radius = "18px", ratio = 1.6, style } = props
    const posters = [poster1?.src, poster2?.src]
    const labels = [label1, label2]
    const modes = STATES[kind] || STATES.explore
    const [mode, setMode] = React.useState(0)
    const [live, setLive] = React.useState(false)
    const wrap = React.useRef(null), canvas = React.useRef(null)
    const st = React.useRef({ step: 0, arch: "today", reduced: false, ...modes[0] })
    const ctl = React.useRef({ spin: 0, tilt: 0, dragX: null })
    const isCanvas = RenderTarget.current() === RenderTarget.canvas

    React.useEffect(() => { Object.assign(st.current, modes[mode] || modes[0]) }, [mode, kind])

    React.useEffect(() => {
        if (isCanvas || typeof window === "undefined") return
        if (matchMedia("(prefers-reduced-motion: reduce)").matches || !matchMedia("(min-width: 760px)").matches) return
        let scene = null, raf = 0, last = 0, visible = false, dead = false
        const drift = kind === "hero" ? 0.35 : 0.12
        const loop = (t) => {
            raf = requestAnimationFrame(loop)
            const dt = last ? Math.min(0.05, (t - last) / 1000) : 0.016; last = t
            scene.frame(st.current, dt, { drift, tilt: ctl.current.tilt, spin: ctl.current.spin })
        }
        const start = () => { if (!raf && scene && visible) { last = 0; raf = requestAnimationFrame(loop) } }
        const stop = () => { cancelAnimationFrame(raf); raf = 0 }
        const io = new IntersectionObserver((es) => es.forEach((e) => {
            visible = e.isIntersecting
            if (visible && !scene) {
                loadThree().then((T) => {
                    if (dead || !canvas.current) return
                    try { scene = buildScene(canvas.current, kind, 0xf3f4f6, T) } catch (err) { return }
                    scene.frame(st.current, 0.016, { instant: true, drift })
                    requestAnimationFrame(() => setLive(true)); start()
                }).catch(() => {})
            } else if (visible) start(); else stop()
        }), { rootMargin: "200px 0px" })
        io.observe(wrap.current)
        return () => { dead = true; stop(); io.disconnect(); scene && scene.dispose() }
    }, [kind, isCanvas])

    const onMove = (e) => {
        const c = ctl.current
        if (c.dragX !== null) { c.spin -= (e.clientX - c.dragX) * 0.006; c.dragX = e.clientX; return }
        const r = wrap.current.getBoundingClientRect(); c.tilt = ((e.clientX - r.left) / r.width - 0.5) * 2
    }
    const hasToggle = modes.length > 1 && labels[0] && labels[1]
    const pill = { position: "absolute", background: "rgba(255,255,255,.86)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", borderRadius: 99 }
    return (
        <div ref={wrap} onPointerMove={onMove} onPointerLeave={() => { ctl.current.tilt = 0 }}
            style={{ width: "100%", aspectRatio: String(ratio || 1.6), ...style, position: "relative", overflow: "hidden", borderRadius: radius, background: "#F3F4F6" }}>
            {posters[mode] || posters[0] ? (
                <img src={posters[mode] || posters[0]} alt={props.alt || "3D model of the house"} loading="lazy"
                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", opacity: live ? 0 : 1, transition: "opacity .5s ease" }} />
            ) : null}
            <canvas ref={canvas} aria-hidden="true"
                onPointerDown={drag ? (e) => { ctl.current.dragX = e.clientX; e.currentTarget.setPointerCapture(e.pointerId) } : undefined}
                onPointerUp={() => { ctl.current.dragX = null }} onPointerCancel={() => { ctl.current.dragX = null }}
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block", opacity: live ? 1 : 0, transition: "opacity .8s ease", cursor: drag ? "grab" : "default", touchAction: "pan-y" }} />
            <span style={{ ...pill, left: 16, top: 14, padding: "6px 10px", font: "500 11px/1 'JetBrains Mono', ui-monospace, monospace", letterSpacing: ".08em", textTransform: "uppercase", color: "#4A4F5C", opacity: live ? 1 : 0, transition: "opacity .6s ease", pointerEvents: "none" }}>
                {drag ? "3D · drag to turn" : "3D model"}
            </span>
            {hasToggle ? (
                <div role="group" aria-label={groupLabel || "View"} style={{ ...pill, right: 14, top: 12, display: "flex", gap: 2, padding: 3, border: "1px solid rgba(12,14,19,.09)" }}>
                    {labels.map((l, j) => (
                        <button key={j} type="button" aria-pressed={mode === j} onClick={() => setMode(j)}
                            style={{ font: "500 13px/1 'Plus Jakarta Sans', system-ui, sans-serif", padding: "8px 14px", borderRadius: 99, border: 0, cursor: "pointer", background: mode === j ? "#0C0E13" : "transparent", color: mode === j ? "#fff" : "#4A4F5C", transition: "background .3s, color .3s" }}>
                            {l}
                        </button>
                    ))}
                </div>
            ) : null}
        </div>
    )
}

addPropertyControls(HouseScene, {
    kind: { type: ControlType.Enum, title: "Scene", options: ["hero", "explore", "arch"], optionTitles: ["House", "Signal map", "Setup"], defaultValue: "explore" },
    poster1: { type: ControlType.ResponsiveImage, title: "Poster 1" },
    poster2: { type: ControlType.ResponsiveImage, title: "Poster 2", hidden: (p) => p.kind === "hero" },
    label1: { type: ControlType.String, title: "Label 1", defaultValue: "Second floor", hidden: (p) => p.kind === "hero" },
    label2: { type: ControlType.String, title: "Label 2", defaultValue: "Third floor", hidden: (p) => p.kind === "hero" },
    groupLabel: { type: ControlType.String, title: "Toggle name", defaultValue: "View", hidden: (p) => p.kind === "hero" },
    alt: { type: ControlType.String, title: "Alt text", defaultValue: "3D model of the house" },
    drag: { type: ControlType.Boolean, title: "Drag to turn", defaultValue: false },
    ratio: { type: ControlType.Number, title: "Ratio", defaultValue: 1.6, min: 0.5, max: 3, step: 0.01 },
    radius: { type: ControlType.String, title: "Radius", defaultValue: "18px" },
})
