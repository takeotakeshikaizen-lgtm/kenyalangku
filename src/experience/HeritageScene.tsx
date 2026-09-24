"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";

export type SceneControls = {
  paused: boolean;
  rotation: number;
  reset: number;
};
export default function HeritageScene({
  controls,
  onReady,
  onError,
}: {
  controls: SceneControls;
  onReady: () => void;
  onError: () => void;
}) {
  const host = useRef<HTMLDivElement>(null);
  const settings = useRef(controls);
  useEffect(() => {
    settings.current = controls;
  }, [controls]);

  useEffect(() => {
    const container = host.current;
    if (!container) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "low-power",
      });
    } catch {
      onError();
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    container.appendChild(renderer.domElement);
    renderer.domElement.setAttribute("aria-hidden", "true");
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2("#12251e", 0.018);
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 150);
    const world = new THREE.Group();
    scene.add(world);
    const mats = {
      wood: new THREE.MeshStandardMaterial({
        color: "#5c3823",
        roughness: 0.88,
      }),
      dark: new THREE.MeshStandardMaterial({
        color: "#2b211a",
        roughness: 0.9,
      }),
      gold: new THREE.MeshStandardMaterial({
        color: "#c69c51",
        roughness: 0.43,
        metalness: 0.3,
      }),
      roof: new THREE.MeshStandardMaterial({
        color: "#284c40",
        roughness: 0.82,
      }),
      tile: new THREE.MeshStandardMaterial({
        color: "#476154",
        roughness: 0.88,
      }),
      stone: new THREE.MeshStandardMaterial({ color: "#65705c", roughness: 1 }),
      ground: new THREE.MeshStandardMaterial({
        color: "#243c30",
        roughness: 1,
      }),
      leaf: new THREE.MeshStandardMaterial({
        color: "#315343",
        side: THREE.DoubleSide,
        roughness: 1,
      }),
      window: new THREE.MeshStandardMaterial({
        color: "#eeb65c",
        emissive: "#e99b37",
        emissiveIntensity: 0.8,
        roughness: 0.5,
      }),
    };
    const boxGeometry = new THREE.BoxGeometry();
    const box = (
      parent: THREE.Object3D,
      x: number,
      y: number,
      z: number,
      w: number,
      h: number,
      d: number,
      mat = mats.wood,
      rz = 0,
    ) => {
      const mesh = new THREE.Mesh(boxGeometry, mat);
      mesh.position.set(x, y, z);
      mesh.scale.set(w, h, d);
      mesh.rotation.z = rz;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      parent.add(mesh);
      return mesh;
    };
    const beam = (
      parent: THREE.Object3D,
      a: THREE.Vector3,
      b: THREE.Vector3,
      width: number,
      mat = mats.gold,
    ) => {
      const mesh = new THREE.Mesh(boxGeometry, mat);
      mesh.position.copy(a).add(b).multiplyScalar(0.5);
      mesh.scale.set(width, a.distanceTo(b), width);
      mesh.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        b.clone().sub(a).normalize(),
      );
      mesh.castShadow = true;
      parent.add(mesh);
      return mesh;
    };
    const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
    function roof(
      parent: THREE.Group,
      width: number,
      depth: number,
      base: number,
      height: number,
    ) {
      const half = width / 2,
        slope = Math.hypot(half, height),
        angle = Math.atan2(height, half);
      for (const side of [-1, 1]) {
        box(
          parent,
          (side * half) / 2,
          base + height / 2,
          0,
          slope,
          0.13,
          depth,
          mats.roof,
          -side * angle,
        );
        for (let z = -depth / 2; z <= depth / 2; z += 0.19)
          box(
            parent,
            (side * half) / 2,
            base + height / 2 + 0.08,
            z,
            slope,
            0.035,
            0.032,
            mats.tile,
            -side * angle,
          );
        box(
          parent,
          side * half,
          base - 0.015,
          0,
          0.13,
          0.16,
          depth + 0.15,
          mats.gold,
        );
        for (const z of [-depth / 2, depth / 2]) {
          beam(
            parent,
            v(0, base + height + 0.08, z),
            v(side * half, base + 0.08, z),
            0.095,
          );
          for (let i = 1; i < 17; i++)
            box(
              parent,
              (side * half * i) / 17,
              base + height * (1 - i / 17) - 0.12,
              z,
              0.09,
              0.22,
              0.065,
              mats.gold,
              Math.PI / 4,
            );
        }
      }
      box(
        parent,
        0,
        base + height + 0.1,
        0,
        0.13,
        0.17,
        depth + 0.2,
        mats.gold,
      );
      const gable = new THREE.Shape();
      gable.moveTo(-half + 0.3, base + 0.08);
      gable.lineTo(0, base + height - 0.12);
      gable.lineTo(half - 0.3, base + 0.08);
      gable.closePath();
      const front = new THREE.Mesh(new THREE.ShapeGeometry(gable), mats.wood);
      front.position.z = depth / 2 - 0.12;
      parent.add(front);
      const back = front.clone();
      back.position.z = -depth / 2 + 0.12;
      back.rotation.y = Math.PI;
      parent.add(back);
      for (let i = -5; i <= 5; i++) {
        const x = (i * half) / 7,
          h = height * (1 - Math.abs(x) / half) * 0.7;
        box(
          parent,
          x,
          base + h / 2 + 0.15,
          depth / 2 - 0.08,
          0.035,
          h,
          0.025,
          mats.gold,
        );
      }
      for (const z of [-depth / 2 - 0.05, depth / 2 + 0.05]) {
        beam(
          parent,
          v(0, base + height, z),
          v(0, base + height + 0.52, z + Math.sign(z) * 0.3),
          0.09,
        );
        box(
          parent,
          0,
          base + height + 0.5,
          z + Math.sign(z) * 0.3,
          0.16,
          0.26,
          0.08,
          mats.gold,
          Math.PI / 4,
        );
      }
    }
    function house(x: number, z: number, scale: number) {
      const group = new THREE.Group();
      group.position.set(x, 0, z);
      group.scale.setScalar(scale);
      world.add(group);
      box(group, 0, 0.96, 0, 5, 0.3, 4.2, mats.dark);
      box(group, 0, 1.13, 0, 5.15, 0.1, 4.3, mats.gold);
      for (const x of [-2.15, -0.75, 0.75, 2.15])
        for (const z of [-1.7, 1.7]) {
          box(group, x, 1.55, z, 0.15, 3.1, 0.15);
          box(group, x, 0.15, z, 0.29, 0.3, 0.29, mats.stone);
          box(group, x, 2.91, z, 0.25, 0.13, 0.25, mats.gold);
        }
      box(group, 0, 2.08, -1.45, 4.3, 1.85, 0.12);
      for (const x of [-2.14, 2.14]) box(group, x, 2.06, -0.38, 0.12, 1.8, 2.2);
      for (let x = -2; x <= 2; x += 0.16)
        box(group, x, 2.08, -1.36, 0.017, 1.8, 0.02, mats.dark);
      for (const x of [-1.45, 0, 1.45]) {
        box(group, x, 2, -1.27, 0.65, 1.3, 0.1, mats.dark);
        box(group, x, 2, -1.2, 0.51, 1.13, 0.04, mats.window);
        box(group, x, 2, -1.15, 0.04, 1.15, 0.05);
        box(group, x, 2, -1.15, 0.55, 0.045, 0.05);
      }
      for (const side of [-1, 1]) {
        box(group, side * 1.48, 1.78, 1.82, 1.3, 0.09, 0.08, mats.gold);
        box(group, side * 1.48, 1.33, 1.82, 1.3, 0.07, 0.08, mats.gold);
        for (let i = 0; i < 8; i++)
          box(group, side * (0.88 + i * 0.17), 1.55, 1.82, 0.065, 0.42, 0.06);
      }
      for (let i = 0; i < 7; i++)
        box(
          group,
          0,
          0.075 + i * 0.15,
          3.8 - i * 0.27,
          1.6,
          0.15 + i * 0.15,
          0.36,
          mats.stone,
        );
      for (const x of [-0.9, 0.9])
        beam(group, v(x, 0.7, 3.9), v(x, 1.75, 2.1), 0.085);
      roof(group, 5.8, 4.8, 3.08, 1.88);
    }
    house(0.65, -0.3, 1);
    house(-3.15, -0.68, 0.68);
    box(world, -1.35, 1.04, 0, 1.8, 0.2, 2.9, mats.dark);
    const ground = new THREE.Mesh(
      new THREE.CylinderGeometry(7.5, 7, 0.6, 72),
      mats.ground,
    );
    ground.position.y = -0.4;
    ground.receiveShadow = true;
    world.add(ground);
    const rim = new THREE.Mesh(
      new THREE.TorusGeometry(7.25, 0.025, 6, 100),
      mats.gold,
    );
    rim.rotation.x = Math.PI / 2;
    rim.position.y = -0.1;
    world.add(rim);
    for (let i = 0; i < 9; i++)
      box(world, 0.6, -0.04, 3.8 + i * 0.35, 1.4, 0.06, 0.27, mats.stone);
    const leafShape = new THREE.Shape();
    leafShape.moveTo(0, 0);
    leafShape.quadraticCurveTo(0.4, 0.65, 0, 1.5);
    leafShape.quadraticCurveTo(-0.28, 0.65, 0, 0);
    const leafGeometry = new THREE.ShapeGeometry(leafShape);
    function palm(x: number, z: number, height: number, lean: number) {
      const group = new THREE.Group();
      group.position.set(x, -0.1, z);
      group.rotation.z = lean;
      world.add(group);
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.065, 0.15, height, 8),
        mats.wood,
      );
      trunk.position.y = height / 2;
      trunk.castShadow = true;
      group.add(trunk);
      for (let j = 0; j < 9; j++) {
        const frond = new THREE.Group();
        frond.position.y = height;
        frond.rotation.y = (j * Math.PI * 2) / 9;
        frond.rotation.z = 0.45;
        group.add(frond);
        const curve = new THREE.QuadraticBezierCurve3(
          v(0, 0, 0),
          v(0.1, 0.8, 1.05),
          v(0, -0.4, 2.35),
        );
        frond.add(
          new THREE.Mesh(
            new THREE.TubeGeometry(curve, 12, 0.022, 3, false),
            mats.leaf,
          ),
        );
        for (let k = 1; k < 9; k++)
          for (const side of [-1, 1]) {
            const leaf = new THREE.Mesh(leafGeometry, mats.leaf);
            leaf.position.copy(curve.getPoint(k / 10));
            leaf.rotation.set(-1.1, side * 0.5, side * -1.1);
            leaf.scale.set(0.45, 0.6 * (1 - k / 13), 0.8);
            frond.add(leaf);
          }
      }
    }
    palm(4.8, -2.5, 6.8, -0.09);
    palm(-4.7, -2.8, 5.3, 0.12);
    palm(5.1, 2.5, 4.7, -0.18);
    const rockGeometry = new THREE.IcosahedronGeometry(1, 0);
    for (let i = 0; i < 27; i++) {
      const angle = i * 2.399,
        radius = 5.4 + Math.sin(i * 7) * 0.9;
      const rock = new THREE.Mesh(
        rockGeometry,
        i % 3 ? mats.ground : mats.stone,
      );
      rock.position.set(
        Math.cos(angle) * radius,
        0.06,
        Math.sin(angle) * radius,
      );
      rock.scale.set(0.3 + (i % 4) * 0.13, 0.2 + (i % 3) * 0.12, 0.45);
      world.add(rock);
    }
    for (const x of [-1.2, 2.5]) {
      box(world, x, 0.9, 4.2, 0.09, 1.8, 0.09, mats.dark);
      box(world, x, 1.6, 4.2, 0.24, 0.36, 0.24, mats.window);
      box(world, x, 1.81, 4.2, 0.34, 0.07, 0.34, mats.gold);
      const light = new THREE.PointLight("#ffb349", 6, 4);
      light.position.set(x, 1.7, 4.2);
      world.add(light);
    }
    // The pavilion is static geometry. Batch its repeated carvings and leaves
    // by material so mobile GPUs draw a handful of meshes instead of hundreds.
    world.updateMatrixWorld(true);
    const batches = new Map<THREE.Material, THREE.BufferGeometry[]>();
    const originals = new Set<THREE.BufferGeometry>();
    const lights: THREE.Object3D[] = [];
    world.traverse((object) => {
      if (object instanceof THREE.PointLight) lights.push(object);
      if (!(object instanceof THREE.Mesh) || Array.isArray(object.material))
        return;
      originals.add(object.geometry);
      const copy = object.geometry.index
        ? object.geometry.toNonIndexed()
        : object.geometry.clone();
      copy.applyMatrix4(object.matrixWorld);
      const group = batches.get(object.material) ?? [];
      group.push(copy);
      batches.set(object.material, group);
    });
    world.clear();
    batches.forEach((geometries, material) => {
      const merged = mergeGeometries(geometries);
      if (merged) {
        const mesh = new THREE.Mesh(merged, material);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        world.add(mesh);
      }
      geometries.forEach((geometry) => geometry.dispose());
    });
    lights.forEach((light) => world.add(light));
    originals.forEach((geometry) => geometry.dispose());
    scene.add(new THREE.HemisphereLight("#f5e3b5", "#142d21", 2.4));
    const sun = new THREE.DirectionalLight("#ffd38b", 4.3);
    sun.position.set(-3, 9, 6);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.left = -9;
    sun.shadow.camera.right = 9;
    sun.shadow.camera.top = 10;
    sun.shadow.camera.bottom = -8;
    sun.shadow.normalBias = 0.06;
    scene.add(sun);
    const rimLight = new THREE.DirectionalLight("#cbe0c9", 2.3);
    rimLight.position.set(4, 5, -6);
    scene.add(rimLight);
    const particlePositions = new Float32Array(75 * 3);
    for (let i = 0; i < 75; i++) {
      particlePositions[i * 3] = Math.sin(i * 6.7) * 8;
      particlePositions[i * 3 + 1] = (i % 13) * 0.5;
      particlePositions[i * 3 + 2] = Math.cos(i * 3.8) * 7;
    }
    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(particlePositions, 3),
    );
    const particles = new THREE.Points(
      particleGeometry,
      new THREE.PointsMaterial({
        color: "#f7cd7d",
        size: 0.033,
        transparent: true,
        opacity: 0.6,
      }),
    );
    scene.add(particles);
    let pointerX = 0,
      pointerY = 0,
      dragging = false,
      lastX = 0,
      dragRotation = 0,
      time = 0,
      raf = 0,
      visible = true,
      previous = 0,
      lastReset = settings.current.reset,
      dirty = true;
    let lastControls: SceneControls | null = null;
    const resize = () => {
      const { width, height } = container.getBoundingClientRect();
      camera.aspect = width / Math.max(height, 1);
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      dirty = true;
    };
    const observer = new ResizeObserver(resize);
    observer.observe(container);
    resize();
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      dirty = true;
    });
    intersection.observe(container);
    const move = (event: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      pointerX = (event.clientX - rect.left) / rect.width - 0.5;
      pointerY = (event.clientY - rect.top) / rect.height - 0.5;
      if (dragging) {
        dragRotation += (event.clientX - lastX) * 0.006;
        lastX = event.clientX;
        dirty = true;
      }
    };
    const down = (event: PointerEvent) => {
      dragging = true;
      lastX = event.clientX;
      container.setPointerCapture(event.pointerId);
    };
    const up = () => {
      dragging = false;
    };
    const leave = () => {
      pointerX = 0;
      pointerY = 0;
    };
    const contextLost = (event: Event) => {
      event.preventDefault();
      onError();
    };
    container.addEventListener("pointermove", move);
    container.addEventListener("pointerdown", down);
    container.addEventListener("pointerup", up);
    container.addEventListener("pointercancel", up);
    container.addEventListener("pointerleave", leave);
    renderer.domElement.addEventListener("webglcontextlost", contextLost);
    function render(stamp: number) {
      raf = requestAnimationFrame(render);
      const delta = Math.min((stamp - previous) / 1000, 0.05);
      previous = stamp;
      if (!visible || document.hidden) return;
      const config = settings.current;
      if (config.paused && !dirty && lastControls === config) return;
      lastControls = config;
      dirty = false;
      if (lastReset !== config.reset) {
        dragRotation = 0;
        pointerX = 0;
        pointerY = 0;
        lastReset = config.reset;
      }
      if (!config.paused) time += delta;
      const orbit =
        0.38 +
        config.rotation +
        dragRotation +
        (config.paused ? 0 : Math.sin(time * 0.12) * 0.07 + pointerX * 0.16);
      const distance = camera.aspect < 0.9 ? 25 : 21;
      const scroll = config.paused ? 0 : Math.min(window.scrollY / 1500, 0.6);
      camera.position.set(
        Math.sin(orbit) * distance,
        8.2 + (config.paused ? 0 : pointerY * 0.8) + scroll,
        Math.cos(orbit) * distance,
      );
      camera.lookAt(0, 2.1, 0);
      particles.rotation.y = time * 0.015;
      renderer.render(scene, camera);
    }
    raf = requestAnimationFrame(render);
    onReady();
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      intersection.disconnect();
      container.removeEventListener("pointermove", move);
      container.removeEventListener("pointerdown", down);
      container.removeEventListener("pointerup", up);
      container.removeEventListener("pointercancel", up);
      container.removeEventListener("pointerleave", leave);
      renderer.domElement.removeEventListener("webglcontextlost", contextLost);
      const geometries = new Set<THREE.BufferGeometry>(),
        materials = new Set<THREE.Material>();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Points) {
          geometries.add(object.geometry);
          const list = Array.isArray(object.material)
            ? object.material
            : [object.material];
          list.forEach((material) => materials.add(material));
        }
      });
      geometries.forEach((geometry) => geometry.dispose());
      materials.forEach((material) => material.dispose());
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [onReady, onError]);
  return <div className="three-host" ref={host} />;
}
