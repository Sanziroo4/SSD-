import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const ORANGE = 0xff5a24;
const clamp = THREE.MathUtils.clamp;

function roundedBox(width, height, depth, radius = 0.07, hole = false) {
  const x = -width / 2;
  const y = -depth / 2;
  const s = new THREE.Shape();
  s.moveTo(x + radius, y);
  s.lineTo(x + width - radius, y);
  s.quadraticCurveTo(x + width, y, x + width, y + radius);
  s.lineTo(x + width, y + depth - radius);
  s.quadraticCurveTo(x + width, y + depth, x + width - radius, y + depth);
  s.lineTo(x + radius, y + depth);
  s.quadraticCurveTo(x, y + depth, x, y + depth - radius);
  s.lineTo(x, y + radius);
  s.quadraticCurveTo(x, y, x + radius, y);
  if (hole) {
    const opening = new THREE.Path();
    opening.absarc(width / 2 - 0.25, 0, 0.13, 0, Math.PI * 2, true);
    s.holes.push(opening);
  }
  const g = new THREE.ExtrudeGeometry(s, {
    depth: height, bevelEnabled: true, bevelSize: 0.022,
    bevelThickness: 0.015, bevelSegments: 2, steps: 1, curveSegments: 8,
  });
  g.rotateX(-Math.PI / 2);
  g.translate(0, -height / 2, 0);
  g.computeVertexNormals();
  return g;
}

function makeTexture(width, height, draw) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  draw(canvas.getContext('2d'), width, height);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

function labelTexture() {
  return makeTexture(2048, 640, (c, w, h) => {
    const gradient = c.createLinearGradient(0, 0, w, h);
    gradient.addColorStop(0, '#303235');
    gradient.addColorStop(0.45, '#1b1d1f');
    gradient.addColorStop(1, '#111315');
    c.fillStyle = gradient;
    c.fillRect(0, 0, w, h);
    c.strokeStyle = '#ffffff07';
    c.lineWidth = 1;
    for (let i = 0; i < h; i += 3) { c.beginPath(); c.moveTo(0, i); c.lineTo(w, i); c.stroke(); }
    c.fillStyle = '#ff5a24';
    c.fillRect(1510, 0, w - 1510, h);
    c.fillStyle = '#fafaf6';
    c.font = '700 60px Arial, sans-serif';
    c.fillText('SSD.LAB', 96, 116);
    c.fillStyle = '#ff5a24';
    c.fillRect(98, 144, 68, 8);
    c.fillStyle = '#f4f4f0';
    c.font = '700 255px Arial, sans-serif';
    c.fillText('N01', 79, 388);
    c.fillStyle = '#aeb0b0';
    c.font = '27px Arial, sans-serif';
    c.fillText('THE NEXT STATE OF MEMORY.', 99, 448);
    c.strokeStyle = '#ffffff2a';
    c.beginPath(); c.moveTo(99, 486); c.lineTo(1390, 486); c.stroke();
    c.fillStyle = '#f4f4f0';
    c.font = '700 66px Arial, sans-serif';
    c.fillText('1 TB', 96, 580);
    c.fillStyle = '#b8bab9';
    c.font = '27px Arial, sans-serif';
    c.fillText('NVMe™  /  PCIe 4.0', 437, 550);
    c.font = '21px Arial, sans-serif';
    c.fillText('M.2 2280  •  SOLID STATE DRIVE', 438, 584);
    c.fillStyle = '#1a211e';
    c.font = '700 31px Arial, sans-serif';
    c.fillText('M.2 / 2280', 1570, 96);
    c.font = '700 280px Arial, sans-serif';
    c.fillText('4', 1585, 397);
    c.font = '700 47px Arial, sans-serif';
    c.fillText('GEN', 1785, 381);
    c.font = '700 28px Arial, sans-serif';
    c.fillText('BUILT TO GO', 1570, 547);
    c.fillText('BEYOND.', 1570, 585);
    c.strokeStyle = '#151b1825';
    c.lineWidth = 2;
    for (let i = 0; i < 7; i++) {
      c.beginPath(); c.moveTo(1515 + i * 25, 640); c.lineTo(1700 + i * 25, 425); c.stroke();
    }
  });
}

function boardTexture() {
  return makeTexture(2048, 640, (c, w, h) => {
    c.fillStyle = '#162b27'; c.fillRect(0, 0, w, h);
    c.lineWidth = 2;
    for (let i = 0; i < 40; i++) {
      const x = 90 + ((i * 167) % 1710);
      const y = 25 + ((i * 79) % 590);
      c.strokeStyle = i % 3 === 0 ? '#b1a67165' : '#5b85754c';
      c.beginPath(); c.moveTo(x, y); c.lineTo(x + 35, y);
      c.lineTo(x + 67, y + 32); c.lineTo(Math.min(x + 250, 1980), y + 32); c.stroke();
      c.fillStyle = '#bca573'; c.beginPath(); c.arc(x, y, 3, 0, Math.PI * 2); c.fill();
    }
    c.fillStyle = '#cad3c8'; c.font = '700 27px Arial, sans-serif';
    c.fillText('SSD.LAB  /  N01', 160, 588);
    c.font = '18px monospace'; c.fillText('NVMe M.2 2280  •  PCB REV.04', 1190, 588);
    c.fillText('+ 3.3V', 180, 62);
    c.strokeStyle = '#afb49c88'; c.strokeRect(156, 529, 300, 73);
  });
}

function chipTexture(title, subtitle, serial) {
  return makeTexture(512, 320, (c, w, h) => {
    c.fillStyle = '#24282b'; c.fillRect(0, 0, w, h);
    c.fillStyle = '#c9cecb'; c.font = '700 42px Arial, sans-serif';
    c.fillText(title, 32, 72);
    c.fillStyle = '#9ea5a1'; c.font = '24px monospace';
    c.fillText(subtitle, 32, 130);
    c.font = '19px monospace'; c.fillText(serial, 32, 211);
    c.fillStyle = '#ff5a24'; c.fillRect(33, 259, 38, 6);
    c.fillStyle = '#929a95'; c.font = '18px monospace'; c.fillText('SSD.LAB / 01', 94, 273);
    c.fillStyle = '#8c928d'; c.beginPath(); c.arc(w - 34, 31, 5, 0, Math.PI * 2); c.fill();
  });
}

export default function SSDScene({ exploded = false, activePart = null, onPartSelect, interactive = true, className = '' }) {
  const hostRef = useRef(null);
  const stateRef = useRef({ exploded, activePart, onPartSelect, interactive });
  const [unavailable, setUnavailable] = useState(false);
  stateRef.current = { exploded, activePart, onPartSelect, interactive };

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch {
      setUnavailable(true);
      return undefined;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.32;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.setAttribute('aria-label', 'SSD.LAB N01 — интерактивті үш өлшемді SSD моделі');
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.touchAction = 'pan-y';
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 80);
    const cameraDirection = new THREE.Vector3(4.2, 8.6, 11.7).normalize();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    const env = pmrem.fromScene(room, 0.035);
    scene.environment = env.texture;
    scene.environmentIntensity = 0.82;
    room.dispose();
    pmrem.dispose();

    scene.add(new THREE.HemisphereLight(0xffffff, 0xa7b0a3, 2.0));
    const key = new THREE.DirectionalLight(0xffffff, 3.7);
    key.position.set(-3, 9, 6);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.left = -7; key.shadow.camera.right = 7;
    key.shadow.camera.top = 7; key.shadow.camera.bottom = -7;
    key.shadow.camera.near = 0.5; key.shadow.camera.far = 30;
    key.shadow.normalBias = 0.035; key.shadow.bias = -0.0002;
    key.shadow.radius = 5;
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xf8e6d1, 2.5);
    rim.position.set(3, 5, -6); scene.add(rim);
    const fill = new THREE.DirectionalLight(0xd7e1ed, 1.5);
    fill.position.set(-7, 3, -1); scene.add(fill);

    const root = new THREE.Group(); scene.add(root);
    const parts = [];
    const pickable = [];
    const materials = new Set();
    const geometries = new Set();
    const textures = new Set();
    const guides = [];
    const dark = new THREE.MeshStandardMaterial({ color: 0x202426, roughness: 0.49, metalness: 0.38 });
    const silver = new THREE.MeshStandardMaterial({ color: 0xb9c0c2, roughness: 0.29, metalness: 0.92 });
    const graphite = new THREE.MeshStandardMaterial({ color: 0x363a3b, roughness: 0.32, metalness: 0.83 });
    const gold = new THREE.MeshStandardMaterial({ color: 0xd6af53, roughness: 0.3, metalness: 0.82 });
    const circuit = new THREE.MeshStandardMaterial({ color: 0x19332c, roughness: 0.7, metalness: 0.25 });
    const ceramic = new THREE.MeshStandardMaterial({ color: 0xa38d65, roughness: 0.68, metalness: 0.22 });
    const orange = new THREE.MeshStandardMaterial({ color: ORANGE, roughness: 0.4, metalness: 0.15 });
    [dark, silver, graphite, gold, circuit, ceramic, orange].forEach(m => materials.add(m));

    function mesh(geometry, material, parent, position = [0, 0, 0], pick = true) {
      geometries.add(geometry); materials.add(material);
      const m = new THREE.Mesh(geometry, material);
      m.position.set(...position); m.castShadow = true; m.receiveShadow = true;
      parent.add(m);
      if (pick) pickable.push(m);
      return m;
    }
    function box(w, h, d, mat, parent, position, radius = 0.04) {
      return mesh(roundedBox(w, h, d, radius), mat, parent, position);
    }
    function instances(geometry, material, parent, positions) {
      geometries.add(geometry); materials.add(material);
      const batch = new THREE.InstancedMesh(geometry, material, positions.length);
      const matrix = new THREE.Matrix4();
      positions.forEach((position, index) => {
        matrix.makeTranslation(...position);
        batch.setMatrixAt(index, matrix);
      });
      batch.instanceMatrix.needsUpdate = true;
      batch.castShadow = true; batch.receiveShadow = true;
      parent.add(batch); pickable.push(batch);
      return batch;
    }
    function topTexture(texture, w, d, parent, y, printedLabel = false) {
      textures.add(texture);
      const material = printedLabel
        ? new THREE.MeshBasicMaterial({ map: texture, toneMapped: false })
        : new THREE.MeshStandardMaterial({ map: texture, roughness: 0.52, metalness: 0.22 });
      const label = mesh(new THREE.PlaneGeometry(w, d), material, parent, [0, y, 0]);
      label.rotation.x = -Math.PI / 2;
      return label;
    }
    function part(id, base, target) {
      const group = new THREE.Group(); group.userData.partId = id;
      group.position.set(...base); root.add(group);
      parts.push({ id, group, base: new THREE.Vector3(...base), target: new THREE.Vector3(...target), highlight: 0 });
      return group;
    }
    function screw(parent, x, y, z, radius = 0.075) {
      mesh(new THREE.CylinderGeometry(radius, radius, 0.043, 16), graphite, parent, [x, y, z]);
      mesh(new THREE.BoxGeometry(radius * 1.22, 0.008, 0.017), dark, parent, [x, y + 0.024, z]);
      mesh(new THREE.BoxGeometry(0.017, 0.008, radius * 1.22), dark, parent, [x, y + 0.025, z]);
    }

    const pcb = part('pcb', [0, 0, 0], [0, -0.52, 0]);
    box(8.35, 0.115, 2.3, circuit, pcb, [0, 0, 0], 0.13);
    // The plated mounting hole at the far end of the M.2 board.
    const mounting = mesh(new THREE.TorusGeometry(0.175, 0.047, 8, 24), gold, pcb, [3.92, 0.073, 0]);
    mounting.rotation.x = Math.PI / 2;
    mesh(new THREE.CylinderGeometry(0.127, 0.127, 0.014, 24), dark, pcb, [3.92, 0.082, 0]);
    const boardLabel = topTexture(boardTexture(), 8.18, 2.19, pcb, 0.075);
    boardLabel.position.x = -0.035;
    // Tiny resistors, capacitors and vias make the exposed board feel manufactured.
    const resistorPositions = [];
    const capacitorPositions = [];
    const contactPositions = [];
    for (let i = 0; i < 28; i++) {
      const x = -3.5 + (i % 14) * 0.47;
      const z = i < 14 ? -0.99 : 0.99;
      (i % 4 === 0 ? capacitorPositions : resistorPositions).push([x, 0.113, z]);
      contactPositions.push([x - 0.052, 0.114, z], [x + 0.052, 0.114, z]);
    }
    instances(new THREE.BoxGeometry(0.12, 0.055, 0.065), dark, pcb, resistorPositions);
    instances(new THREE.BoxGeometry(0.12, 0.055, 0.065), ceramic, pcb, capacitorPositions);
    instances(new THREE.BoxGeometry(0.026, 0.06, 0.071), silver, pcb, contactPositions);
    const viasGeo = new THREE.CylinderGeometry(0.026, 0.026, 0.008, 8);
    const viaPositions = [];
    for (let i = 0; i < 40; i++) {
      const x = -3.6 + (i % 20) * 0.37;
      viaPositions.push([x, 0.081, i < 20 ? -1.065 : 1.065]);
    }
    instances(viasGeo, gold, pcb, viaPositions);

    const connector = part('connector', [-4.25, 0, 0], [-4.62, -0.23, 0.1]);
    mesh(new THREE.BoxGeometry(0.56, 0.105, 1.94), circuit, connector);
    const connectorPositions = [];
    for (let i = 0; i < 18; i++) {
      if (i === 3) continue;
      const z = -0.88 + i * 0.103;
      connectorPositions.push([-0.01, 0.065, z], [-0.01, -0.065, z]);
    }
    instances(new THREE.BoxGeometry(0.57, 0.019, 0.071), gold, connector, connectorPositions);

    const controller = part('controller', [-2.39, 0.13, -0.32], [-2.45, 1.12, -0.7]);
    box(1.17, 0.16, 1.15, dark, controller, [0, 0, 0], 0.035);
    topTexture(chipTexture('SSD.LAB', 'CONTROLLER', 'N01 • 8 CHANNEL'), 1.09, 1.07, controller, 0.103);
    for (let i = 0; i < 9; i++) {
      const x = -0.49 + i * 0.12;
      mesh(new THREE.BoxGeometry(0.065, 0.035, 0.14), silver, controller, [x, -0.055, 0.58]);
      mesh(new THREE.BoxGeometry(0.065, 0.035, 0.14), silver, controller, [x, -0.055, -0.58]);
    }

    const dram = part('dram', [-2.44, 0.12, 0.67], [-2.8, 0.62, 1.35]);
    box(1.16, 0.13, 0.53, dark, dram, [0, 0, 0], 0.025);
    topTexture(chipTexture('DRAM', 'CACHE MEMORY', 'LPDDR4 • 1 GB'), 1.1, 0.49, dram, 0.087);
    for (let i = 0; i < 10; i++) {
      const x = -0.5 + i * 0.11;
      mesh(new THREE.BoxGeometry(0.04, 0.035, 0.09), silver, dram, [x, -0.035, 0.28]);
    }

    const nandLocations = [
      [[-0.56, 0.135, -0.56], [-0.6, 0.9, -0.22]],
      [[1.33, 0.135, -0.56], [1.35, 1.15, -0.5]],
      [[-0.56, 0.135, 0.54], [-0.45, 0.48, 1.8]],
      [[1.33, 0.135, 0.54], [1.68, 0.65, 1.6]],
    ];
    const nandMap = chipTexture('SSD.LAB', '3D NAND', 'TLC • 256 GB');
    nandLocations.forEach(([base, target]) => {
      const nand = part('nand', base, target);
      box(1.61, 0.15, 0.87, dark, nand, [0, 0, 0], 0.032);
      topTexture(nandMap, 1.52, 0.79, nand, 0.099);
      for (let i = 0; i < 7; i++) {
        mesh(new THREE.BoxGeometry(0.08, 0.02, 0.045), graphite, nand, [-0.59 + i * 0.195, -0.076, 0.43]);
      }
    });

    const heatsink = part('heatsink', [0.14, 0, 0], [0.25, 2.78, -0.4]);
    box(7.24, 0.14, 2.27, silver, heatsink, [0, 0.29, 0], 0.11);
    box(7.12, 0.18, 2.17, graphite, heatsink, [0, 0.405, 0], 0.09);
    box(7.09, 0.048, 2.16, dark, heatsink, [0, 0.505, 0], 0.085);
    topTexture(labelTexture(), 6.97, 2.07, heatsink, 0.553, true);
    // Polished rails, cooling slots and recessed fasteners.
    const coolingSlots = [];
    for (const z of [-1.12, 1.12]) {
      mesh(new THREE.BoxGeometry(6.99, 0.025, 0.035), silver, heatsink, [0, 0.36, z]);
      for (let i = 0; i < 24; i++) {
        coolingSlots.push([-3.35 + i * 0.29, 0.285, z * 1.008]);
      }
    }
    instances(new THREE.BoxGeometry(0.15, 0.065, 0.025), dark, heatsink, coolingSlots);
    for (const x of [-3.37, 3.37]) for (const z of [-0.9, 0.9]) screw(heatsink, x, 0.55, z, 0.061);
    mesh(new THREE.BoxGeometry(0.055, 0.17, 1.97), orange, heatsink, [3.58, 0.39, 0]);

    // Fine assembly guides appear only while the device is taken apart.
    for (const p of parts) {
      if (p.id === 'pcb' || p.id === 'connector') continue;
      const geo = new THREE.BufferGeometry().setFromPoints([p.base, p.target]);
      const mat = new THREE.LineDashedMaterial({ color: 0x8d948b, transparent: true, opacity: 0, dashSize: 0.055, gapSize: 0.07, depthWrite: false });
      const line = new THREE.Line(geo, mat); line.computeLineDistances();
      line.visible = false; root.add(line); guides.push({ line, p });
      geometries.add(geo); materials.add(mat);
    }

    const shadowMap = makeTexture(256, 256, (c) => {
      const g = c.createRadialGradient(128, 128, 20, 128, 128, 124);
      g.addColorStop(0, '#24281d38'); g.addColorStop(0.45, '#24281d19'); g.addColorStop(1, '#24281d00');
      c.fillStyle = g; c.fillRect(0, 0, 256, 256);
    });
    textures.add(shadowMap);
    const shadowMat = new THREE.MeshBasicMaterial({ map: shadowMap, transparent: true, depthWrite: false, opacity: 0.75 });
    const softShadow = mesh(new THREE.PlaneGeometry(11.5, 5.5), shadowMat, scene, [0.4, -0.91, 0.1], false);
    softShadow.rotation.x = -Math.PI / 2; softShadow.castShadow = false; softShadow.receiveShadow = false;
    const floorMaterial = new THREE.ShadowMaterial({ opacity: 0.075 });
    const floor = mesh(new THREE.PlaneGeometry(30, 20), floorMaterial, scene, [0, -0.9, 0], false);
    floor.rotation.x = -Math.PI / 2; floor.castShadow = false;

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2(20, 20);
    const pointerTilt = new THREE.Vector2();
    const dragRotation = new THREE.Vector2();
    const dragStart = new THREE.Vector2();
    let dragging = false;
    let dragTravel = 0;
    let hovered = null;
    let pendingHover = null;
    let hoverTimer = null;
    let width = 0;
    let height = 0;
    let frame = 0;
    let visible = true;
    let disposed = false;
    let explodeProgress = stateRef.current.exploded ? 1 : 0;
    let cameraDistance = 14;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const started = performance.now();
    let lastTime = started;
    let lastReducedState = '';
    const canvas = renderer.domElement;

    function resize() {
      const rect = host.getBoundingClientRect();
      const nextWidth = Math.max(Math.round(rect.width), 1);
      const nextHeight = Math.max(Math.round(rect.height), 1);
      // setSize clears the WebGL buffer, even when its dimensions do not change.
      // Ignore fractional layout notifications and redraw real resizes immediately.
      if (nextWidth === width && nextHeight === height) return;
      width = nextWidth; height = nextHeight;
      camera.aspect = width / height; camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
      renderer.render(scene, camera);
    }
    camera.position.copy(cameraDirection).multiplyScalar(cameraDistance);
    camera.lookAt(0, 0, 0);
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host); resize();
    const visibilityObserver = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }, { rootMargin: '180px' });
    visibilityObserver.observe(host);

    function updatePointer(event) {
      const rect = canvas.getBoundingClientRect();
      pointer.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1);
      pointerTilt.set(pointer.x, pointer.y);
    }
    function getHit() {
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(pickable, false)[0];
      if (!hit) return null;
      let object = hit.object;
      while (object && !object.userData.partId) object = object.parent;
      return object?.userData.partId || null;
    }
    function selectHovered(next) {
      if (hovered === next) return;
      hovered = next;
      canvas.style.cursor = next ? 'grab' : 'default';
      stateRef.current.onPartSelect?.(next);
    }
    function cancelPendingHover() {
      window.clearTimeout(hoverTimer);
      hoverTimer = null;
      pendingHover = null;
    }
    function queueHovered(next) {
      if (next === hovered) {
        cancelPendingHover();
        return;
      }
      if (hoverTimer !== null && pendingHover === next) return;
      cancelPendingHover();
      pendingHover = next;
      // Crossing a pin, label edge or small gap should not flash another card.
      hoverTimer = window.setTimeout(() => {
        hoverTimer = null;
        pendingHover = null;
        if (!dragging) selectHovered(next);
      }, next ? 65 : 110);
    }
    function onMove(event) {
      updatePointer(event);
      if (!stateRef.current.interactive) return;
      if (dragging) {
        const dx = event.clientX - dragStart.x;
        const dy = event.clientY - dragStart.y;
        dragTravel += Math.abs(dx) + Math.abs(dy);
        dragRotation.x = clamp(dragRotation.x + dx * 0.004, -0.6, 0.6);
        dragRotation.y = clamp(dragRotation.y + dy * 0.002, -0.23, 0.23);
        dragStart.set(event.clientX, event.clientY);
      } else queueHovered(getHit());
    }
    function onDown(event) {
      if (!stateRef.current.interactive || event.button !== 0) return;
      updatePointer(event);
      if (!getHit()) return;
      cancelPendingHover();
      dragging = true; dragTravel = 0;
      dragStart.set(event.clientX, event.clientY);
      canvas.style.cursor = 'grabbing';
      canvas.setPointerCapture?.(event.pointerId);
    }
    function onUp(event) {
      if (!dragging) return;
      dragging = false;
      updatePointer(event);
      canvas.style.cursor = hovered ? 'grab' : 'default';
      if (dragTravel < 6) {
        const hit = getHit();
        hovered = hit;
        canvas.style.cursor = hit ? 'grab' : 'default';
        stateRef.current.onPartSelect?.(hit);
      }
      if (canvas.hasPointerCapture?.(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
    }
    function onCancel(event) {
      cancelPendingHover();
      dragging = false;
      pointerTilt.set(0, 0);
      canvas.style.cursor = hovered ? 'grab' : 'default';
      if (canvas.hasPointerCapture?.(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
    }
    function onLeave() {
      pointerTilt.set(0, 0);
      cancelPendingHover();
      if (!dragging && stateRef.current.interactive) selectHovered(null);
    }
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onCancel);
    canvas.addEventListener('pointerleave', onLeave);

    function animate(now) {
      if (disposed) return;
      frame = requestAnimationFrame(animate);
      const delta = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      if (!visible || document.hidden) return;
      if (reducedMotion) {
        const nextState = [stateRef.current.exploded, stateRef.current.activePart, hovered, width, height, dragRotation.x, dragRotation.y, pointerTilt.x, pointerTilt.y].join('|');
        if (nextState === lastReducedState) return;
        lastReducedState = nextState;
      }
      const t = (now - started) / 1000;
      const blend = reducedMotion ? 1 : 1 - Math.exp(-delta * 5.5);
      explodeProgress = THREE.MathUtils.lerp(explodeProgress, stateRef.current.exploded ? 1 : 0, reducedMotion ? 1 : blend);
      const entrance = reducedMotion ? 1 : 1 - Math.exp(-t * 3.3);
      const idle = reducedMotion ? 0 : Math.sin(t * 0.75) * 0.055;
      root.position.y = idle + (1 - entrance) * 0.48;
      root.scale.setScalar(0.94 + entrance * 0.06);
      root.rotation.y = THREE.MathUtils.lerp(root.rotation.y, -0.04 + dragRotation.x + pointerTilt.x * 0.035, blend);
      root.rotation.x = THREE.MathUtils.lerp(root.rotation.x, 0.015 + dragRotation.y + pointerTilt.y * 0.018, blend);
      root.rotation.z = reducedMotion ? -0.015 : -0.015 + Math.sin(t * 0.45) * 0.012;
      const focused = stateRef.current.activePart || hovered;
      parts.forEach((p, index) => {
        p.highlight = THREE.MathUtils.lerp(p.highlight, focused === p.id ? 0.075 : 0, reducedMotion ? 1 : 1 - Math.exp(-delta * 10));
        p.group.position.lerpVectors(p.base, p.target, explodeProgress);
        if (!reducedMotion && explodeProgress > 0.01) p.group.position.y += Math.sin(t * 0.8 + index * 0.9) * 0.035 * explodeProgress;
        p.group.rotation.y = p.id === 'heatsink' ? -0.035 * explodeProgress : Math.sin(index * 2) * 0.035 * explodeProgress;
        p.group.traverse(object => {
          if (!object.isMesh || !object.material.emissive) return;
          // A restrained orange reflection identifies the inspected component.
          object.material.emissive.setHex(ORANGE);
          object.material.emissiveIntensity = p.highlight;
        });
      });
      // Shared materials must not carry selection from one component to another.
      // Label materials are unique, so their orange reflection remains local.
      [dark, silver, graphite, gold, circuit, ceramic, orange].forEach(m => { m.emissiveIntensity = 0; });
      guides.forEach(({ line, p }) => {
        line.visible = explodeProgress > 0.08;
        line.material.opacity = explodeProgress * 0.22;
        const positions = line.geometry.attributes.position;
        positions.setXYZ(0, p.base.x, p.base.y - explodeProgress * 0.52, p.base.z);
        positions.setXYZ(1, p.group.position.x, p.group.position.y, p.group.position.z);
        positions.needsUpdate = true; line.computeLineDistances();
      });
      const tan = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
      const sceneHeight = 4.35 + explodeProgress * 2.85;
      const neededDistance = Math.max(8.8 / (2 * tan * camera.aspect), sceneHeight / (2 * tan)) * 1.04;
      cameraDistance = THREE.MathUtils.lerp(cameraDistance, neededDistance, reducedMotion ? 1 : blend);
      const targetY = explodeProgress * 0.8;
      camera.position.copy(cameraDirection).multiplyScalar(cameraDistance);
      camera.position.y += targetY;
      camera.lookAt(0, targetY, 0);
      softShadow.material.opacity = 0.74 - explodeProgress * 0.27;
      renderer.render(scene, camera);
    }
    frame = requestAnimationFrame(animate);

    return () => {
      disposed = true; cancelAnimationFrame(frame);
      cancelPendingHover();
      resizeObserver.disconnect(); visibilityObserver.disconnect();
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onCancel);
      canvas.removeEventListener('pointerleave', onLeave);
      geometries.forEach(g => g.dispose());
      materials.forEach(m => m.dispose());
      textures.forEach(t => t.dispose());
      env.dispose();
      key.shadow.map?.dispose();
      renderer.dispose();
      if (canvas.parentNode === host) host.removeChild(canvas);
    };
  }, []);

  return (
    <div ref={hostRef} className={`ssd-scene ${className}`} style={{ width: '100%', height: '100%', position: 'relative' }}>
      {unavailable && (
        <div className="ssd-webgl-fallback" role="img" aria-label="SSD.LAB N01 NVMe SSD">
          <span>SSD.LAB</span><strong>N01</strong><small>NVMe · GEN 4 · 1 TB</small>
        </div>
      )}
    </div>
  );
}
