"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";

export interface OrdinanceItem {
  id: string; // e.g. "Ordinance No. 2024-017"
  title: string;
  href?: string;
}

export interface OrdinanceArchiveCanvasProps {
  className?: string;
  interactive?: boolean;
  /** Real ordinances to label the pages with. Falls back to sample labels. */
  ordinances?: OrdinanceItem[];
  /** Fires when a page is clicked / tapped. */
  onSelect?: (item: OrdinanceItem, index: number) => void;
}

// ---------------------------------------------------------------------------
// Layout constants
// ---------------------------------------------------------------------------
const VARIANTS = 4; // number of distinct page textures
const DEFAULT_PAGES = 48;
const MAX_PAGES = 60;
const PAGE_W = 0.8;
const PAGE_H = 1.13;
const RADIUS = 2.1;
const STEP = 0.5; // radians between consecutive pages (~12.5 pages per turn)
const TOWER_HEIGHT = 5.0;
const CAMERA_Y = 2.4;

// ---------------------------------------------------------------------------
// Procedural textures (no image assets needed)
// ---------------------------------------------------------------------------
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A stylised legal page: gold header rule, title, paragraphs, seal, signature. */
function makePageTexture(variant: number, anisotropy: number) {
  const LW = 256; // logical size
  const LH = 362;
  const k = 1.5; // render scale
  const canvas = document.createElement("canvas");
  canvas.width = LW * k;
  canvas.height = LH * k;
  const g = canvas.getContext("2d")!;
  g.scale(k, k);
  const rand = mulberry32(variant * 977 + 13);

  // Paper
  g.fillStyle = "#f7f3e8";
  g.fillRect(0, 0, LW, LH);

  // Outer border (keeps the page readable on light backgrounds)
  g.strokeStyle = "rgba(5,150,105,0.6)";
  g.lineWidth = 3;
  g.strokeRect(1.5, 1.5, LW - 3, LH - 3);

  // Gold top rule
  g.fillStyle = "#d97706";
  g.fillRect(0, 0, LW, 10);

  // Heading
  g.textAlign = "center";
  g.fillStyle = "#1f2937";
  g.font = "bold 16px Georgia, 'Times New Roman', serif";
  g.fillText("ORDINANCE", LW / 2, 42);
  g.fillStyle = "#6b7280";
  g.font = "9px Georgia, 'Times New Roman', serif";
  g.fillText("Sangguniang Panlungsod ng Cabanatuan", LW / 2, 57);

  // Divider
  g.fillStyle = "rgba(217,119,6,0.7)";
  g.fillRect(LW / 2 - 28, 68, 56, 1.5);

  // Body: paragraphs of "text" bars
  let y = 86;
  while (y < LH - 96) {
    const lines = 3 + Math.floor(rand() * 4);
    for (let i = 0; i < lines && y < LH - 96; i++) {
      const last = i === lines - 1;
      const w = (LW - 48) * (last ? 0.3 + rand() * 0.4 : 0.93 + rand() * 0.07);
      g.fillStyle = "rgba(31,41,55,0.5)";
      g.fillRect(24, y, w, 3);
      y += 11;
    }
    y += 9;
  }

  // Seal
  const sx = 52;
  const sy = LH - 50;
  g.strokeStyle = "#d97706";
  g.lineWidth = 2;
  g.beginPath();
  g.arc(sx, sy, 19, 0, Math.PI * 2);
  g.stroke();
  g.lineWidth = 1;
  g.beginPath();
  g.arc(sx, sy, 13, 0, Math.PI * 2);
  g.stroke();
  g.fillStyle = "rgba(217,119,6,0.35)";
  g.beginPath();
  g.arc(sx, sy, 6, 0, Math.PI * 2);
  g.fill();

  // Signature line
  g.strokeStyle = "rgba(31,41,55,0.55)";
  g.lineWidth = 1;
  g.beginPath();
  g.moveTo(130, LH - 44);
  g.lineTo(LW - 26, LH - 44);
  g.stroke();
  g.strokeStyle = "rgba(5,150,105,0.8)";
  g.lineWidth = 1.5;
  g.beginPath();
  g.moveTo(142, LH - 50);
  g.bezierCurveTo(150, LH - 66, 158, LH - 40, 168, LH - 54);
  g.bezierCurveTo(176, LH - 64, 184, LH - 42, 196, LH - 52);
  g.stroke();

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = anisotropy;
  return tex;
}

function makeGlowTexture() {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const g = canvas.getContext("2d")!;
  const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.35, "rgba(255,255,255,0.35)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(canvas);
}

function placeholderItem(i: number): OrdinanceItem {
  const year = 2025 - Math.floor(i / 12);
  const num = String(((i * 37) % 90) + 10).padStart(3, "0");
  return { id: `Ordinance No. ${year}-${num}`, title: "Sample entry" };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function OrdinanceArchiveCanvas({
  className = "",
  interactive = true,
  ordinances,
  onSelect,
}: OrdinanceArchiveCanvasProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const tipIdRef = useRef<HTMLDivElement>(null);
  const tipTitleRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  // Latest props/theme without re-building the scene
  const darkRef = useRef(false);
  darkRef.current = resolvedTheme === "dark";
  const ordinancesRef = useRef(ordinances);
  ordinancesRef.current = ordinances;
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;
  const applyThemeRef = useRef<((dark: boolean) => void) | null>(null);

  const pageCount = Math.max(
    6,
    Math.min(ordinances?.length ?? DEFAULT_PAGES, MAX_PAGES)
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  // Theme changes only recolour; they don't rebuild the scene
  useEffect(() => {
    applyThemeRef.current?.(resolvedTheme === "dark");
  }, [resolvedTheme]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !mounted) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let vw = container.clientWidth || 400;
    let vh = container.clientHeight || 400;

    // ---- Renderer / camera -------------------------------------------------
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, vw / vh, 0.1, 100);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.setSize(vw, vh, false);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";
    container.appendChild(renderer.domElement);

    const fitCamera = () => {
      const aspect = vw / vh;
      camera.aspect = aspect;
      const halfTan = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
      // Keep ~3.2 units either side of the axis in view on narrow containers
      const z = Math.max(11, 3.2 / (halfTan * aspect));
      camera.position.z = z;
      camera.updateProjectionMatrix();
    };

    // ---- Tower of pages ----------------------------------------------------
    const helix = new THREE.Group();
    scene.add(helix);

    const pitch = Math.min(0.14, TOWER_HEIGHT / (pageCount - 1));
    const halfTower = ((pageCount - 1) / 2) * pitch;

    const pageGeom = new THREE.PlaneGeometry(PAGE_W, PAGE_H);
    const maxAniso = Math.min(4, renderer.capabilities.getMaxAnisotropy());
    const pageTextures = Array.from({ length: VARIANTS }, (_, v) =>
      makePageTexture(v, maxAniso)
    );
    const pageMats = pageTextures.map(
      (map) =>
        new THREE.MeshBasicMaterial({
          map,
          side: THREE.DoubleSide,
          toneMapped: false,
        })
    );
    const meshes = pageMats.map((mat, v) => {
      const count = Math.ceil((pageCount - v) / VARIANTS);
      const mesh = new THREE.InstancedMesh(pageGeom, mat, count);
      mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      mesh.setColorAt(0, new THREE.Color(1, 1, 1)); // allocates instanceColor
      mesh.frustumCulled = false;
      helix.add(mesh);
      return mesh;
    });

    // ---- Light inside the tower (shows through the gaps) -------------------
    const glowTex = makeGlowTexture();
    const coreMat = new THREE.SpriteMaterial({
      map: glowTex,
      transparent: true,
      depthWrite: false,
    });
    const core = new THREE.Sprite(coreMat);
    core.scale.set(3, 3, 1);
    scene.add(core);

    const beamMat = new THREE.SpriteMaterial({
      map: glowTex,
      transparent: true,
      depthWrite: false,
    });
    const beam = new THREE.Sprite(beamMat);
    beam.scale.set(1.1, halfTower * 2 + 3, 1);
    scene.add(beam);

    // ---- Scanner ring that "indexes" the pages as it travels ---------------
    const scanGeom = new THREE.TorusGeometry(RADIUS + 0.5, 0.012, 6, 96);
    const scanMat = new THREE.MeshBasicMaterial({
      transparent: true,
      toneMapped: false,
    });
    const scanRing = new THREE.Mesh(scanGeom, scanMat);
    scanRing.rotation.x = Math.PI / 2;
    helix.add(scanRing);
    scanRing.visible = !reduced;

    // ---- Drifting dust -----------------------------------------------------
    const dustCount = 140;
    const dustSpan = halfTower * 2 + 2;
    const dustPos = new Float32Array(dustCount * 3);
    const dustSpeed = new Float32Array(dustCount);
    const dustAngle = new Float32Array(dustCount);
    const dustRad = new Float32Array(dustCount);
    for (let i = 0; i < dustCount; i++) {
      dustAngle[i] = Math.random() * Math.PI * 2;
      dustRad[i] = 1.2 + Math.sqrt(Math.random()) * 3.2;
      dustPos[i * 3] = Math.cos(dustAngle[i]) * dustRad[i];
      dustPos[i * 3 + 1] = (Math.random() - 0.5) * dustSpan;
      dustPos[i * 3 + 2] = Math.sin(dustAngle[i]) * dustRad[i];
      dustSpeed[i] = 0.05 + Math.random() * 0.15;
    }
    const dustGeom = new THREE.BufferGeometry();
    dustGeom.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
    const dustMat = new THREE.PointsMaterial({
      size: 0.04,
      transparent: true,
      depthWrite: false,
    });
    const dust = new THREE.Points(dustGeom, dustMat);
    dust.frustumCulled = false;
    scene.add(dust);

    // ---- Theme -------------------------------------------------------------
    const baseTint = new THREE.Color();
    const hoverCol = new THREE.Color(0xfcd34d);
    const scanCol = new THREE.Color();
    let fade = 0.5;

    const applyTheme = (dark: boolean) => {
      const emerald = dark ? 0x10b981 : 0x059669;
      const gold = dark ? 0xf59e0b : 0xd97706;
      const blending = dark ? THREE.AdditiveBlending : THREE.NormalBlending;

      baseTint.set(dark ? 0xbfd8cd : 0xffffff);
      scanCol.set(dark ? 0x6ee7b7 : 0x34d399);
      fade = dark ? 0.55 : 0.18;

      coreMat.color.set(emerald);
      coreMat.opacity = dark ? 0.55 : 0.2;
      coreMat.blending = blending;
      coreMat.needsUpdate = true;

      beamMat.color.set(emerald);
      beamMat.opacity = dark ? 0.35 : 0.14;
      beamMat.blending = blending;
      beamMat.needsUpdate = true;

      scanMat.color.set(gold);
      scanMat.opacity = dark ? 0.9 : 0.8;

      dustMat.color.set(gold);
      dustMat.opacity = dark ? 0.7 : 0.5;
      dustMat.blending = blending;
      dustMat.needsUpdate = true;
    };
    applyThemeRef.current = applyTheme;
    applyTheme(darkRef.current);

    // ---- Per-page layout ---------------------------------------------------
    const dummy = new THREE.Object3D();
    dummy.rotation.order = "YXZ";
    const tmpColor = new THREE.Color();
    const hover = new Float32Array(pageCount);
    let hovered = -1;

    const layout = (t: number, dt: number, scanY: number) => {
      const ease = 1 - Math.exp(-dt * 10);
      for (let i = 0; i < pageCount; i++) {
        hover[i] += ((i === hovered ? 1 : 0) - hover[i]) * ease;
        const hv = hover[i];
        const a = i * STEP;
        const r = RADIUS + Math.sin(i * 0.9) * 0.08 + hv * 0.35;
        const bob = reduced ? 0 : Math.sin(t * 0.8 + i * 0.7) * 0.025;
        const y = (i - (pageCount - 1) / 2) * pitch + bob;

        dummy.position.set(Math.cos(a) * r, y, Math.sin(a) * r);
        dummy.rotation.set(Math.sin(i * 1.3) * 0.05, Math.PI / 2 - a, 0);
        const s = 1 + hv * 0.14;
        dummy.scale.set(s, s, s);
        dummy.updateMatrix();

        const mesh = meshes[i % VARIANTS];
        const k = Math.floor(i / VARIANTS);
        mesh.setMatrixAt(k, dummy.matrix);

        // Fade the top and bottom of the tower, glow near the scanner ring
        const tt = (i / (pageCount - 1)) * 2 - 1;
        const f = 1 - fade * Math.pow(Math.abs(tt), 1.5);
        const scanGlow = reduced ? 0 : Math.max(0, 1 - Math.abs(y - scanY) / 0.45);
        tmpColor.copy(baseTint).multiplyScalar(f);
        if (scanGlow > 0) tmpColor.lerp(scanCol, scanGlow * 0.6);
        if (hv > 0.001) tmpColor.lerp(hoverCol, hv * 0.7);
        mesh.setColorAt(k, tmpColor);
      }
      for (const m of meshes) {
        m.instanceMatrix.needsUpdate = true;
        if (m.instanceColor) m.instanceColor.needsUpdate = true;
      }
    };

    // ---- Hover / drag / click ---------------------------------------------
    const raycaster = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    const tmpV = new THREE.Vector3();
    let inside = false;
    let dragging = false;
    let moved = 0;
    let lastX = 0;
    let lastY = 0;
    let lastT = 0;
    let rotY = 0;
    let vel = 0;
    let tilt = 0;
    let tiltTarget = 0;
    let camOffX = 0;
    let camOffY = 0;
    const autoSpin = reduced ? 0 : 0.18;

    const labelFor = (i: number) => ordinancesRef.current?.[i] ?? placeholderItem(i);

    const pick = (): number => {
      raycaster.setFromCamera(ndc, camera);
      const hit = raycaster.intersectObjects(meshes, false)[0];
      if (!hit || hit.instanceId === undefined) return -1;
      const m = meshes.indexOf(hit.object as any);
      const idx = hit.instanceId * VARIANTS + m;
      return idx < pageCount ? idx : -1;
    };

    const setHovered = (next: number) => {
      if (next === hovered) return;
      hovered = next;
      container.style.cursor = next >= 0 ? "pointer" : "";
      const tip = tooltipRef.current;
      if (!tip) return;
      if (next < 0) {
        tip.style.display = "none";
        return;
      }
      const item = labelFor(next);
      if (tipIdRef.current) tipIdRef.current.textContent = item.id;
      if (tipTitleRef.current) tipTitleRef.current.textContent = item.title;
      tip.style.display = "block";
    };

    const updateNdc = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      ndc.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      ndc.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    };

    const onPointerDown = (e: PointerEvent) => {
      dragging = true;
      inside = true;
      moved = 0;
      lastX = e.clientX;
      lastY = e.clientY;
      lastT = e.timeStamp;
      updateNdc(e);
      container.setPointerCapture?.(e.pointerId);
    };

    const onPointerMove = (e: PointerEvent) => {
      inside = true;
      updateNdc(e);
      if (!dragging) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      moved += Math.abs(dx) + Math.abs(dy);
      rotY += dx * 0.008;
      tiltTarget = THREE.MathUtils.clamp(tiltTarget + dy * 0.004, -0.35, 0.35);
      const dtMs = Math.max(e.timeStamp - lastT, 1);
      const v = THREE.MathUtils.clamp((dx * 0.008) / (dtMs / 1000), -8, 8);
      vel = THREE.MathUtils.lerp(vel, v, 0.4);
      lastX = e.clientX;
      lastY = e.clientY;
      lastT = e.timeStamp;
    };

    const onPointerUp = (e: PointerEvent) => {
      const wasClick = dragging && moved < 6;
      dragging = false;
      try {
        container.releasePointerCapture?.(e.pointerId);
      } catch {
        /* ignore */
      }
      if (wasClick) {
        updateNdc(e);
        const idx = pick();
        if (idx >= 0) {
          const item = labelFor(idx);
          if (onSelectRef.current) {
            onSelectRef.current(item, idx);
          } else if (item.href) {
            router.push(item.href);
          } else if (item.id && !item.id.includes("Sample") && item.title !== "Sample entry") {
            router.push(`/ordinances/${item.id}`);
          }
        }
      }
    };

    const onPointerCancel = () => {
      dragging = false;
    };

    const onPointerLeave = () => {
      inside = false;
      setHovered(-1);
    };

    if (interactive) {
      container.addEventListener("pointerdown", onPointerDown);
      container.addEventListener("pointermove", onPointerMove);
      container.addEventListener("pointerup", onPointerUp);
      container.addEventListener("pointercancel", onPointerCancel);
      container.addEventListener("pointerleave", onPointerLeave);
    }

    // ---- Resize / visibility ----------------------------------------------
    const resizeObserver = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect;
      if (!rect || rect.width <= 0 || rect.height <= 0) return;
      vw = rect.width;
      vh = rect.height;
      renderer.setSize(vw, vh, false);
      fitCamera();
    });
    resizeObserver.observe(container);
    fitCamera();

    let visible = true;
    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        for (const e of entries) visible = e.isIntersecting;
      },
      { threshold: 0.05 }
    );
    intersectionObserver.observe(container);

    // ---- Loop --------------------------------------------------------------
    let raf = 0;
    let last = performance.now();
    let t = 0;

    const animate = () => {
      raf = requestAnimationFrame(animate);
      const now = performance.now();
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (!visible) return;
      t += dt;

      // Spin with inertia that settles back to the idle speed
      if (!dragging) {
        vel += (autoSpin - vel) * (1 - Math.exp(-dt * 1.2));
        rotY += vel * dt;
        tiltTarget *= Math.exp(-dt * 0.8);
      }
      tilt += (tiltTarget - tilt) * (1 - Math.exp(-dt * 6));
      helix.rotation.y = rotY;
      helix.rotation.x = tilt;

      // Gentle camera parallax toward the pointer
      const wantX = inside && !dragging ? ndc.x * 0.5 : 0;
      const wantY = inside && !dragging ? ndc.y * 0.3 : 0;
      const pe = 1 - Math.exp(-dt * 3);
      camOffX += (wantX - camOffX) * pe;
      camOffY += (wantY - camOffY) * pe;
      camera.position.x = camOffX;
      camera.position.y = CAMERA_Y + camOffY;
      camera.lookAt(0, -0.3, 0);

      // Scanner ring sweeps up and down the tower
      const scanY = Math.sin(t * 0.45) * halfTower;
      scanRing.position.y = scanY;

      // Hover
      if (interactive && inside && !dragging) setHovered(pick());
      else if (dragging) setHovered(-1);

      layout(t, dt, scanY);

      // Tooltip follows the hovered page
      const tip = tooltipRef.current;
      if (tip && hovered >= 0) {
        const a = hovered * STEP;
        const r = RADIUS + 0.35;
        const y = (hovered - (pageCount - 1) / 2) * pitch + PAGE_H * 0.62;
        tmpV.set(Math.cos(a) * r, y, Math.sin(a) * r);
        helix.localToWorld(tmpV);
        tmpV.project(camera);
        const sx = (tmpV.x * 0.5 + 0.5) * vw;
        const sy = (-tmpV.y * 0.5 + 0.5) * vh;
        tip.style.transform = `translate(${sx}px, ${sy}px) translate(-50%, -100%)`;
      }

      // Dust
      if (!reduced) {
        const half = dustSpan / 2;
        for (let i = 0; i < dustCount; i++) {
          let py = dustPos[i * 3 + 1] + dustSpeed[i] * dt;
          if (py > half) py = -half;
          dustPos[i * 3 + 1] = py;
          const a = dustAngle[i] + t * 0.03;
          dustPos[i * 3] = Math.cos(a) * dustRad[i];
          dustPos[i * 3 + 2] = Math.sin(a) * dustRad[i];
        }
        dustGeom.attributes.position.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };
    animate();

    // ---- Cleanup -----------------------------------------------------------
    return () => {
      cancelAnimationFrame(raf);
      applyThemeRef.current = null;
      container.style.cursor = "";
      if (interactive) {
        container.removeEventListener("pointerdown", onPointerDown);
        container.removeEventListener("pointermove", onPointerMove);
        container.removeEventListener("pointerup", onPointerUp);
        container.removeEventListener("pointercancel", onPointerCancel);
        container.removeEventListener("pointerleave", onPointerLeave);
      }
      resizeObserver.disconnect();
      intersectionObserver.disconnect();

      meshes.forEach((m) => m.dispose());
      pageGeom.dispose();
      pageMats.forEach((m) => m.dispose());
      pageTextures.forEach((tx) => tx.dispose());
      glowTex.dispose();
      coreMat.dispose();
      beamMat.dispose();
      scanGeom.dispose();
      scanMat.dispose();
      dustGeom.dispose();
      dustMat.dispose();

      renderer.dispose();
      renderer.forceContextLoss();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [mounted, interactive, pageCount, router]);

  return (
    <div
      className={`relative h-full min-h-[380px] w-full select-none ${className}`}
      role="img"
      aria-label="Interactive 3D tower of floating ordinance documents for Cabanatuan City"
    >
      {/* WebGL canvas. pan-y keeps vertical page scrolling working on touch. */}
      <div
        ref={containerRef}
        className={`h-full w-full outline-none ${
          interactive ? "cursor-grab active:cursor-grabbing" : ""
        }`}
        style={{ touchAction: "pan-y" }}
      />

      {/* Hover label that tracks the page under the pointer */}
      <div
        ref={tooltipRef}
        aria-hidden="true"
        style={{ display: "none" }}
        className="pointer-events-none absolute left-0 top-0 z-20 max-w-[220px] rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-card)]/90 px-3 py-2 shadow-sm backdrop-blur-md"
      >
        <div
          ref={tipIdRef}
          className="font-mono text-[11px] font-semibold text-emerald-600 dark:text-emerald-400"
        />
        <div ref={tipTitleRef} className="mt-0.5 text-xs text-[var(--text-ink)]" />
      </div>

      {/* Status pill */}
      <div className="pointer-events-none absolute bottom-4 left-4 z-10 flex items-center gap-2 rounded-full border border-[var(--border-hairline)] bg-[var(--bg-card)]/80 px-3 py-1.5 text-[11px] text-[var(--text-body)] shadow-sm backdrop-blur-md">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
        <span className="font-semibold text-[var(--text-ink)]">
          {ordinances ? `${ordinances.length} ordinances indexed` : "Ordinance archive"}
        </span>
      </div>

      {interactive && (
        <div className="pointer-events-none absolute right-4 top-4 z-10 rounded-full border border-[var(--border-hairline)] bg-[var(--bg-canvas)]/70 px-2.5 py-1 text-[10px] font-medium text-[var(--text-mute)] backdrop-blur-sm">
          I-drag para paikutin
        </div>
      )}
    </div>
  );
}

export const CivicMonolithCanvas = OrdinanceArchiveCanvas;
export default OrdinanceArchiveCanvas;
