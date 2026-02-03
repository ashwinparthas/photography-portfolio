"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import earthTexture from "@/app/earth.png";

const AUTO_ROTATION_SECONDS = 28.8;
const AXIAL_TILT = THREE.MathUtils.degToRad(23.5);
const DOT_RADIUS = 0.022;

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const mix = (a: number, b: number, t: number) => a + (b - a) * t;

const smoothstep = (edge0: number, edge1: number, x: number) => {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
};

const createProceduralEarthTexture = () => {
  const width = 1024;
  const height = 512;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.Texture();

  const imageData = ctx.createImageData(width, height);
  const data = imageData.data;

  for (let y = 0; y < height; y += 1) {
    const v = y / (height - 1);
    const lat = (v - 0.5) * Math.PI;
    const latCos = Math.cos(lat);
    for (let x = 0; x < width; x += 1) {
      const u = x / (width - 1);
      const lon = u * Math.PI * 2;

      const base =
        Math.sin(lon * 2.2) +
        Math.cos(lat * 3.1) +
        Math.sin(lon * 5.1 + lat * 2.2) +
        Math.cos(lon * 9.1 - lat * 4.3);
      const ridge = Math.abs(Math.sin(lon * 1.7 + lat * 1.3));
      const continent = base * 0.22 + ridge * 0.28 + latCos * 0.24;

      const landMask = smoothstep(0.08, 0.24, continent);
      const coast = smoothstep(-0.08, 0.12, continent);
      const dryness = (Math.sin(lon * 1.3 + lat * 0.7) + 1) * 0.5;
      const mountain = smoothstep(0.28, 0.5, continent);

      const oceanDeep = [8, 27, 55];
      const oceanShallow = [24, 77, 122];
      const landGreen = [35, 92, 60];
      const landBrown = [120, 100, 65];
      const landLight = [168, 156, 120];
      const ice = [232, 241, 246];

      let r = mix(oceanDeep[0], oceanShallow[0], coast);
      let g = mix(oceanDeep[1], oceanShallow[1], coast);
      let b = mix(oceanDeep[2], oceanShallow[2], coast);

      if (landMask > 0) {
        const landBaseR = mix(landGreen[0], landBrown[0], dryness);
        const landBaseG = mix(landGreen[1], landBrown[1], dryness);
        const landBaseB = mix(landGreen[2], landBrown[2], dryness);
        r = mix(r, landBaseR, landMask);
        g = mix(g, landBaseG, landMask);
        b = mix(b, landBaseB, landMask);

        r = mix(r, landLight[0], mountain);
        g = mix(g, landLight[1], mountain);
        b = mix(b, landLight[2], mountain);
      }

      const iceMask = smoothstep(1.05, 1.25, Math.abs(lat));
      r = mix(r, ice[0], iceMask);
      g = mix(g, ice[1], iceMask);
      b = mix(b, ice[2], iceMask);

      const idx = (y * width + x) * 4;
      data[idx] = r;
      data[idx + 1] = g;
      data[idx + 2] = b;
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
};

const createGridLines = (radius: number) => {
  const positions: number[] = [];
  const latLines = 7;
  const lonLines = 12;
  const segments = 80;

  for (let i = 1; i < latLines; i += 1) {
    const lat = (i / latLines) * Math.PI - Math.PI / 2;
    for (let j = 0; j <= segments; j += 1) {
      const lon = (j / segments) * Math.PI * 2;
      const x = Math.cos(lat) * Math.cos(lon) * radius;
      const y = Math.sin(lat) * radius;
      const z = Math.cos(lat) * Math.sin(lon) * radius;
      positions.push(x, y, z);
    }
  }

  for (let i = 0; i < lonLines; i += 1) {
    const lon = (i / lonLines) * Math.PI * 2;
    for (let j = 0; j <= segments; j += 1) {
      const lat = (j / segments) * Math.PI - Math.PI / 2;
      const x = Math.cos(lat) * Math.cos(lon) * radius;
      const y = Math.sin(lat) * radius;
      const z = Math.cos(lat) * Math.sin(lon) * radius;
      positions.push(x, y, z);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3)
  );
  const material = new THREE.LineBasicMaterial({
    color: 0xa9b9d6,
    transparent: true,
    opacity: 0.12
  });
  return new THREE.LineSegments(geometry, material);
};

const createStars = () => {
  const count = 520;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i += 1) {
    const radius = 6 + Math.random() * 6;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const idx = i * 3;
    positions[idx] = radius * Math.sin(phi) * Math.cos(theta);
    positions[idx + 1] = radius * Math.cos(phi);
    positions[idx + 2] = radius * Math.sin(phi) * Math.sin(theta);
  }
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.035,
    transparent: true,
    opacity: 0.45,
    depthWrite: false
  });
  return new THREE.Points(geometry, material);
};

type GlobeProps = {
  className?: string;
  pointsCount?: number;
  onHover?: (info: { index: number; x: number; y: number } | null) => void;
  onSelect?: (index: number) => void;
};

const createFibonacciPoints = (count: number) => {
  const points: THREE.Vector3[] = [];
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i += 1) {
    const y = 1 - (i / (count - 1)) * 2;
    const radius = Math.sqrt(1 - y * y);
    const theta = goldenAngle * i;
    points.push(
      new THREE.Vector3(
        Math.cos(theta) * radius,
        y,
        Math.sin(theta) * radius
      )
    );
  }
  return points;
};

export default function Globe({
  className,
  pointsCount = 48,
  onHover,
  onSelect
}: GlobeProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const onHoverRef = useRef(onHover);
  const onSelectRef = useRef(onSelect);
  const points = useMemo(
    () => createFibonacciPoints(Math.max(8, pointsCount)),
    [pointsCount]
  );

  useEffect(() => {
    onHoverRef.current = onHover;
  }, [onHover]);

  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.setSize(container.clientWidth, container.clientHeight, false);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      50,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0.25, 3.2);
    camera.lookAt(0, 0, 0);

    const root = new THREE.Group();
    scene.add(root);

    const tiltGroup = new THREE.Group();
    tiltGroup.rotation.z = AXIAL_TILT;
    root.add(tiltGroup);

    const globeGroup = new THREE.Group();
    tiltGroup.add(globeGroup);

    const geometry = new THREE.SphereGeometry(1, 96, 96);
    const loader = new THREE.TextureLoader();
    const earthSrc =
      typeof earthTexture === "string" ? earthTexture : earthTexture.src;
    const proceduralMap = createProceduralEarthTexture();
    proceduralMap.colorSpace = THREE.SRGBColorSpace;
    proceduralMap.anisotropy = Math.min(
      8,
      renderer.capabilities.getMaxAnisotropy()
    );
    let proceduralDisposed = false;
    let loadedTexture: THREE.Texture | null = null;

    const earthMaterial = new THREE.MeshPhongMaterial({
      map: proceduralMap,
      shininess: 12,
      specular: new THREE.Color(0x111111)
    });
    const earthMesh = new THREE.Mesh(geometry, earthMaterial);
    globeGroup.add(earthMesh);

    loader.load(earthSrc, (texture) => {
      const img = texture.image as HTMLImageElement | undefined;
      const ratio = img ? img.width / img.height : 0;
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = Math.min(
        8,
        renderer.capabilities.getMaxAnisotropy()
      );
      loadedTexture = texture;
      if (ratio && Math.abs(ratio - 2) < 0.08) {
        earthMaterial.map = texture;
        earthMaterial.needsUpdate = true;
        proceduralMap.dispose();
        proceduralDisposed = true;
      } else {
        texture.dispose();
        loadedTexture = null;
      }
    });

    const atmosphereMaterial = new THREE.MeshBasicMaterial({
      color: 0x9fdcff,
      transparent: true,
      opacity: 0.18,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide
    });
    const atmosphereMesh = new THREE.Mesh(
      new THREE.SphereGeometry(1.05, 96, 96),
      atmosphereMaterial
    );
    globeGroup.add(atmosphereMesh);

    const grid = createGridLines(1.003);
    globeGroup.add(grid);

    const dotGeometry = new THREE.CylinderGeometry(
      DOT_RADIUS * 1.15,
      DOT_RADIUS * 1.15,
      DOT_RADIUS * 0.6,
      6
    );
    const dotMaterial = new THREE.MeshStandardMaterial({
      color: 0xff5252,
      roughness: 0.25,
      metalness: 0.1,
      emissive: new THREE.Color(0x2b0000),
      emissiveIntensity: 0.45,
      side: THREE.DoubleSide
    });
    const dots = new THREE.InstancedMesh(
      dotGeometry,
      dotMaterial,
      points.length
    );
    const dummy = new THREE.Object3D();
    points.forEach((point, index) => {
      const normal = point.clone().normalize();
      dummy.position.copy(normal.multiplyScalar(1.02));
      dummy.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        normal
      );
      dummy.scale.setScalar(1);
      dummy.updateMatrix();
      dots.setMatrixAt(index, dummy.matrix);
    });
    dots.instanceMatrix.needsUpdate = true;
    globeGroup.add(dots);

    const stars = createStars();
    scene.add(stars);

    const ambientLight = new THREE.AmbientLight(0x6f7f95, 0.35);
    scene.add(ambientLight);
    const sunLight = new THREE.DirectionalLight(0xffffff, 1.1);
    sunLight.position.set(-3, 2, 4);
    scene.add(sunLight);

    const state = {
      dragging: false,
      lastX: 0,
      lastY: 0,
      velocityX: 0,
      velocityY: 0,
      lastMove: performance.now(),
      autoResumeAt: 0,
      zoom: camera.position.z,
      moved: false
    };

    let frameId = 0;
    let lastTime = performance.now();
    const autoSpeed = (Math.PI * 2) / AUTO_ROTATION_SECONDS;
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let pointerActive = false;
    let hoveredIndex: number | null = null;
    let lastHoverX = 0;
    let lastHoverY = 0;
    let lastHoverTime = 0;
    let hoverActive = false;

    const updateRotation = (deltaX: number, deltaY: number) => {
      const rotateSpeed = 0.005;
      globeGroup.rotation.y += deltaX * rotateSpeed;
      globeGroup.rotation.x += deltaY * rotateSpeed;
      globeGroup.rotation.x = THREE.MathUtils.clamp(
        globeGroup.rotation.x,
        -Math.PI / 3,
        Math.PI / 3
      );
    };

    const updatePointer = (event: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      pointerActive = true;
    };

    const onPointerDown = (event: PointerEvent) => {
      state.dragging = true;
      state.moved = false;
      state.lastX = event.clientX;
      state.lastY = event.clientY;
      state.velocityX = 0;
      state.velocityY = 0;
      state.lastMove = performance.now();
      state.autoResumeAt = performance.now() + 900;
      updatePointer(event);
      renderer.domElement.setPointerCapture(event.pointerId);
    };

    const onPointerMove = (event: PointerEvent) => {
      updatePointer(event);
      if (!state.dragging) return;
      const deltaX = event.clientX - state.lastX;
      const deltaY = event.clientY - state.lastY;
      state.lastX = event.clientX;
      state.lastY = event.clientY;
      if (Math.abs(deltaX) > 1 || Math.abs(deltaY) > 1) {
        state.moved = true;
      }
      updateRotation(deltaX, deltaY);

      const now = performance.now();
      const dt = Math.max(16, now - state.lastMove) / 1000;
      state.velocityY = (deltaX * 0.005) / dt;
      state.velocityX = (deltaY * 0.005) / dt;
      state.lastMove = now;
    };

    const onPointerUp = () => {
      state.dragging = false;
      state.autoResumeAt = performance.now() + 900;
    };

    const onPointerLeave = () => {
      pointerActive = false;
      hoverActive = false;
      if (hoveredIndex !== null) {
        hoveredIndex = null;
        onHoverRef.current?.(null);
      }
      onPointerUp();
    };

    const onPointerEnter = () => {
      hoverActive = true;
    };

    const onClick = () => {
      if (state.moved) return;
      if (hoveredIndex !== null) {
        onSelectRef.current?.(hoveredIndex);
      }
    };

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      state.zoom = THREE.MathUtils.clamp(
        state.zoom + event.deltaY * 0.001,
        2.6,
        4.2
      );
      camera.position.z = state.zoom;
    };

    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    renderer.domElement.addEventListener("pointermove", onPointerMove);
    renderer.domElement.addEventListener("pointerup", onPointerUp);
    renderer.domElement.addEventListener("pointerleave", onPointerLeave);
    renderer.domElement.addEventListener("pointerenter", onPointerEnter);
    renderer.domElement.addEventListener("click", onClick);
    renderer.domElement.addEventListener("wheel", onWheel, { passive: false });

    let resizeFrame = 0;
    let lastWidth = 0;
    let lastHeight = 0;
    let lastDpr = 0;

    const applyResize = () => {
      if (!container) return;
      const width = Math.round(container.clientWidth);
      const height = Math.round(container.clientHeight);
      if (width < 50 || height < 50) return;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      if (width === lastWidth && height === lastHeight && dpr === lastDpr) {
        return;
      }
      lastWidth = width;
      lastHeight = height;
      lastDpr = dpr;
      renderer.setPixelRatio(dpr);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    const scheduleResize = () => {
      if (resizeFrame) return;
      resizeFrame = window.setTimeout(() => {
        resizeFrame = 0;
        applyResize();
      }, 30);
    };

    applyResize();
    const resizeObserver = new ResizeObserver(scheduleResize);
    resizeObserver.observe(container);

    const animate = (time: number) => {
      const dt = Math.min(0.05, (time - lastTime) / 1000);
      lastTime = time;

      if (!state.dragging) {
        globeGroup.rotation.y += state.velocityY * dt;
        globeGroup.rotation.x += state.velocityX * dt;
        globeGroup.rotation.x = THREE.MathUtils.clamp(
          globeGroup.rotation.x,
          -Math.PI / 3,
          Math.PI / 3
        );

        const damping = Math.pow(0.92, dt * 60);
        state.velocityX *= damping;
        state.velocityY *= damping;

        if (!hoverActive) {
          const autoBlend = Math.min(
            1,
            Math.max(0, (time - state.autoResumeAt) / 1000)
          );
          globeGroup.rotation.y += autoSpeed * dt * autoBlend;
        } else {
          state.velocityX *= 0.8;
          state.velocityY *= 0.8;
        }

      }

      if (pointerActive) {
        raycaster.setFromCamera(pointer, camera);
        const hits = raycaster.intersectObject(dots);
        if (hits.length > 0) {
          const hit = hits[0];
          const instanceId = hit.instanceId ?? null;
          if (instanceId !== null) {
            const projected = hit.point.clone().project(camera);
            const width = container.clientWidth;
            const height = container.clientHeight;
            const x = (projected.x * 0.5 + 0.5) * width;
            const y = (-projected.y * 0.5 + 0.5) * height;
            const moved =
              Math.hypot(x - lastHoverX, y - lastHoverY) > 1.4;
            const timeElapsed = time - lastHoverTime > 48;
            if (hoveredIndex !== instanceId || moved || timeElapsed) {
              hoveredIndex = instanceId;
              lastHoverX = x;
              lastHoverY = y;
              lastHoverTime = time;
              onHoverRef.current?.({ index: instanceId, x, y });
            }
          }
        } else if (hoveredIndex !== null) {
          hoveredIndex = null;
          onHoverRef.current?.(null);
        }
      }

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);

    return () => {
      resizeObserver.disconnect();
      if (resizeFrame) {
        clearTimeout(resizeFrame);
      }
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      renderer.domElement.removeEventListener("pointermove", onPointerMove);
      renderer.domElement.removeEventListener("pointerup", onPointerUp);
      renderer.domElement.removeEventListener("pointerleave", onPointerLeave);
      renderer.domElement.removeEventListener("pointerenter", onPointerEnter);
      renderer.domElement.removeEventListener("click", onClick);
      renderer.domElement.removeEventListener("wheel", onWheel);
      cancelAnimationFrame(frameId);
      renderer.dispose();
      geometry.dispose();
      if (loadedTexture) {
        loadedTexture.dispose();
      }
      if (!proceduralDisposed) {
        proceduralMap.dispose();
      }
      earthMaterial.dispose();
      atmosphereMaterial.dispose();
      grid.geometry.dispose();
      if (Array.isArray(grid.material)) {
        grid.material.forEach((material) => material.dispose());
      } else {
        grid.material.dispose();
      }
      dotGeometry.dispose();
      dotMaterial.dispose();
      stars.geometry.dispose();
      if (Array.isArray(stars.material)) {
        stars.material.forEach((material) => material.dispose());
      } else {
        stars.material.dispose();
      }
      container.removeChild(renderer.domElement);
    };
  }, [points]);

  return <div ref={containerRef} className={className} />;
}
