"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useTheme } from "next-themes";

interface CivicMonolithCanvasProps {
  className?: string;
  interactive?: boolean;
}

export function CivicMonolithCanvas({
  className = "",
  interactive = true,
}: CivicMonolithCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [activeNodeCount] = useState(89);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !mounted) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 400;

    // SCENE SETUP
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 7.2);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // Theme palette
    const isDark = resolvedTheme === "dark";
    const emeraldColor = isDark ? 0x10b981 : 0x059669;
    const goldColor = isDark ? 0xf59e0b : 0xd97706;
    const ambientColor = isDark ? 0x052e16 : 0xdcfce7;
    const coreColor = isDark ? 0x064e3b : 0x047857;

    // LIGHTING
    const ambientLight = new THREE.AmbientLight(ambientColor, isDark ? 1.4 : 1.8);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(goldColor, isDark ? 2.5 : 2.0);
    mainLight.position.set(5, 7, 5);
    scene.add(mainLight);

    const emeraldLight = new THREE.PointLight(emeraldColor, isDark ? 4.0 : 3.0, 10);
    emeraldLight.position.set(0, 0, 0);
    scene.add(emeraldLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, isDark ? 1.0 : 0.8);
    rimLight.position.set(-5, -5, -3);
    scene.add(rimLight);

    // ROOT OBJECT FOR ROTATION & PARALLAX
    const worldGroup = new THREE.Group();
    scene.add(worldGroup);

    // 1. CENTRAL CIVIC MONOLITH (Codex Prism)
    // Hexagonal civic monolith representing Cabanatuan Legislative Assembly
    const monolithGeom = new THREE.CylinderGeometry(0.9, 1.15, 2.2, 6, 2, false);
    const monolithMat = new THREE.MeshPhysicalMaterial({
      color: coreColor,
      metalness: 0.85,
      roughness: 0.25,
      transmission: isDark ? 0.45 : 0.2,
      thickness: 1.2,
      transparent: true,
      opacity: isDark ? 0.75 : 0.85,
      wireframe: false,
    });
    const monolithMesh = new THREE.Mesh(monolithGeom, monolithMat);
    worldGroup.add(monolithMesh);

    // Monolith Wireframe Bevel Edges
    const edgesGeom = new THREE.EdgesGeometry(monolithGeom);
    const edgesMat = new THREE.LineBasicMaterial({
      color: goldColor,
      linewidth: 2,
      transparent: true,
      opacity: isDark ? 0.9 : 0.7,
    });
    const edgesMesh = new THREE.LineSegments(edgesGeom, edgesMat);
    monolithMesh.add(edgesMesh);

    // Inner glowing civic beacon crystal
    const beaconGeom = new THREE.OctahedronGeometry(0.55, 0);
    const beaconMat = new THREE.MeshBasicMaterial({
      color: emeraldColor,
      wireframe: true,
    });
    const beaconMesh = new THREE.Mesh(beaconGeom, beaconMat);
    monolithMesh.add(beaconMesh);

    // 2. ORBITAL RINGS (3 tilted legislative coordinate rings)
    const ringGroup = new THREE.Group();
    worldGroup.add(ringGroup);

    const rings: THREE.LineLoop[] = [];
    const ringConfigs = [
      { radius: 2.2, tiltX: 0.4, tiltZ: 0.2, color: emeraldColor, opacity: 0.35 },
      { radius: 2.8, tiltX: -0.5, tiltZ: -0.3, color: goldColor, opacity: 0.25 },
      { radius: 3.3, tiltX: 0.8, tiltZ: -0.1, color: emeraldColor, opacity: 0.2 },
    ];

    ringConfigs.forEach((cfg) => {
      const ringGeom = new THREE.BufferGeometry();
      const segments = 64;
      const positions = new Float32Array(segments * 3);
      for (let i = 0; i < segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        positions[i * 3] = Math.cos(theta) * cfg.radius;
        positions[i * 3 + 1] = 0;
        positions[i * 3 + 2] = Math.sin(theta) * cfg.radius;
      }
      ringGeom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      const ringMat = new THREE.LineBasicMaterial({
        color: cfg.color,
        transparent: true,
        opacity: cfg.opacity,
      });
      const ring = new THREE.LineLoop(ringGeom, ringMat);
      ring.rotation.x = cfg.tiltX;
      ring.rotation.z = cfg.tiltZ;
      ringGroup.add(ring);
      rings.push(ring);
    });

    // 3. THE 89 BARANGAYS CONSTELLATION NODES
    // Exactly 89 nodes representing Cabanatuan's 89 official barangays
    const nodeCount = 89;
    const nodeGeom = new THREE.SphereGeometry(0.045, 8, 8);
    const nodeMat = new THREE.MeshBasicMaterial({
      color: goldColor,
    });
    const instancedNodes = new THREE.InstancedMesh(nodeGeom, nodeMat, nodeCount);

    // Distribute 89 barangay nodes on the 3 orbital manifolds
    const dummy = new THREE.Object3D();
    const nodePositions: THREE.Vector3[] = [];

    for (let i = 0; i < nodeCount; i++) {
      const ringIndex = i % 3;
      const cfg = ringConfigs[ringIndex];
      const angle = (i / nodeCount) * Math.PI * 2 * 3 + (i * 0.17);
      const rad = cfg.radius + (Math.sin(i * 1.8) * 0.18);

      // Local coordinate on ring plane
      const localPos = new THREE.Vector3(
        Math.cos(angle) * rad,
        Math.sin(i * 3.7) * 0.25,
        Math.sin(angle) * rad
      );

      // Apply ring tilt
      const euler = new THREE.Euler(cfg.tiltX, 0, cfg.tiltZ);
      localPos.applyEuler(euler);

      nodePositions.push(localPos);

      dummy.position.copy(localPos);
      const scale = 0.8 + Math.random() * 0.6;
      dummy.scale.set(scale, scale, scale);
      dummy.updateMatrix();
      instancedNodes.setMatrixAt(i, dummy.matrix);
    }
    instancedNodes.instanceMatrix.needsUpdate = true;
    ringGroup.add(instancedNodes);

    // 4. INTERCONNECTING CIVIC BEAMS / ARCS
    // Beams linking select barangay nodes to the central monolith
    const lineIndices = [4, 12, 22, 33, 45, 57, 68, 79];
    const beamCoords: number[] = [];

    lineIndices.forEach((idx) => {
      const pos = nodePositions[idx % nodePositions.length];
      if (pos) {
        beamCoords.push(0, (idx % 2 === 0 ? 0.4 : -0.4), 0);
        beamCoords.push(pos.x, pos.y, pos.z);
      }
    });

    const beamGeom = new THREE.BufferGeometry();
    beamGeom.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(beamCoords, 3)
    );
    const beamMat = new THREE.LineBasicMaterial({
      color: emeraldColor,
      transparent: true,
      opacity: isDark ? 0.35 : 0.25,
    });
    const beamLines = new THREE.LineSegments(beamGeom, beamMat);
    ringGroup.add(beamLines);

    // 5. AMBIENT CIVIC DUST PARTICLES
    const dustCount = 120;
    const dustGeom = new THREE.BufferGeometry();
    const dustPositions = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      dustPositions[i * 3] = (Math.random() - 0.5) * 8;
      dustPositions[i * 3 + 1] = (Math.random() - 0.5) * 8;
      dustPositions[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    dustGeom.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));
    const dustMat = new THREE.PointsMaterial({
      color: isDark ? 0x34d399 : 0x059669,
      size: 0.035,
      transparent: true,
      opacity: isDark ? 0.5 : 0.35,
    });
    const dustPoints = new THREE.Points(dustGeom, dustMat);
    scene.add(dustPoints);

    // INTERACTION & POINTER HANDLING
    let isDragging = false;
    let prevPointerX = 0;
    let prevPointerY = 0;
    let targetRotY = 0;
    let targetRotX = 0;
    let currentRotY = 0;
    let currentRotX = 0;
    let parallaxX = 0;
    let parallaxY = 0;

    const onPointerDown = (e: PointerEvent) => {
      if (!interactive) return;
      isDragging = true;
      prevPointerX = e.clientX;
      prevPointerY = e.clientY;
      if (container.setPointerCapture) {
        container.setPointerCapture(e.pointerId);
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (isDragging && interactive) {
        const deltaX = e.clientX - prevPointerX;
        const deltaY = e.clientY - prevPointerY;
        targetRotY += deltaX * 0.008;
        targetRotX += deltaY * 0.008;
        // Limit pitch rotation
        targetRotX = Math.max(-0.6, Math.min(0.6, targetRotX));
        prevPointerX = e.clientX;
        prevPointerY = e.clientY;
      } else {
        // Parallax offset
        const rect = container.getBoundingClientRect();
        const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const normY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
        parallaxX = normX * 0.25;
        parallaxY = normY * 0.2;
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      isDragging = false;
      if (container.releasePointerCapture) {
        try {
          container.releasePointerCapture(e.pointerId);
        } catch {
          // ignore
        }
      }
    };

    container.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    // RESIZE OBSERVER
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const entry = entries[0];
      const newWidth = entry.contentRect.width;
      const newHeight = entry.contentRect.height;
      if (newWidth > 0 && newHeight > 0) {
        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(newWidth, newHeight);
      }
    });
    resizeObserver.observe(container);

    // INTERSECTION OBSERVER FOR GPU CONSERVATION
    let isVisible = true;
    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          isVisible = e.isIntersecting;
        });
      },
      { threshold: 0.05 }
    );
    intersectionObserver.observe(container);

    // ANIMATION LOOP
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (!isVisible) return;

      const elapsedTime = clock.getElapsedTime();

      // Gentle continuous rotation
      if (!prefersReducedMotion) {
        targetRotY += 0.0025;
        monolithMesh.rotation.y = elapsedTime * 0.35;
        beaconMesh.rotation.y = -elapsedTime * 0.8;
        beaconMesh.rotation.x = elapsedTime * 0.5;

        // Inner beacon pulse
        const pulse = 1.0 + Math.sin(elapsedTime * 3) * 0.12;
        beaconMesh.scale.set(pulse, pulse, pulse);
        emeraldLight.intensity = (isDark ? 3.5 : 2.5) + Math.sin(elapsedTime * 2.5) * 1.0;

        // Counter-orbit rings
        ringGroup.rotation.y = -elapsedTime * 0.15;
        dustPoints.rotation.y = elapsedTime * 0.03;
      }

      // Smooth dampening towards target rotation
      currentRotX += (targetRotX + parallaxY - currentRotX) * 0.05;
      currentRotY += (targetRotY + parallaxX - currentRotY) * 0.05;

      worldGroup.rotation.x = currentRotX;
      worldGroup.rotation.y = currentRotY;

      renderer.render(scene, camera);
    };

    animate();

    // CLEANUP
    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();

      // Dispose Geometries & Materials
      monolithGeom.dispose();
      monolithMat.dispose();
      edgesGeom.dispose();
      edgesMat.dispose();
      beaconGeom.dispose();
      beaconMat.dispose();
      rings.forEach((r) => {
        r.geometry.dispose();
        (r.material as THREE.Material).dispose();
      });
      nodeGeom.dispose();
      nodeMat.dispose();
      instancedNodes.dispose();
      beamGeom.dispose();
      beamMat.dispose();
      dustGeom.dispose();
      dustMat.dispose();

      renderer.dispose();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [mounted, resolvedTheme, interactive]);

  return (
    <div
      className={`relative w-full h-full min-h-[380px] select-none touch-none ${className}`}
      aria-label="Interactive 3D Cabanatuan Civic Monolith with 89 Barangay Constellation"
      role="region"
    >
      {/* 3D WebGL Canvas Container */}
      <div
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing outline-none"
      />

      {/* Floating Civic Status Pill */}
      <div className="pointer-events-none absolute bottom-4 left-4 z-10 flex items-center gap-2 rounded-full border border-[var(--border-hairline)] bg-[var(--bg-card)]/80 px-3 py-1.5 backdrop-blur-md text-[11px] font-mono text-[var(--text-body)] shadow-sm">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
        </span>
        <span className="font-semibold text-[var(--text-ink)]">
          {activeNodeCount} Barangays Active
        </span>
        <span className="text-[var(--text-mute)]">•</span>
        <span className="text-[var(--text-mute)]">Cabanatuan Civic Mesh</span>
      </div>

      {/* Interactive Helper Hint */}
      <div className="pointer-events-none absolute top-4 right-4 z-10 rounded-full border border-[var(--border-hairline)] bg-[var(--bg-canvas)]/70 px-2.5 py-1 text-[10px] font-medium text-[var(--text-mute)] backdrop-blur-sm">
        <span>I-drag upang ikutin 3D</span>
      </div>
    </div>
  );
}
