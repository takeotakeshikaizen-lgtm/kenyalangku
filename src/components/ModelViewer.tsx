"use client";

import { Component, Suspense, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useFBX, useProgress } from "@react-three/drei";
import { Box3, Mesh, Vector3 } from "three";
import { Camera, Download, Pause, Play, RotateCcw } from "lucide-react";
import styles from "./ModelViewer.module.css";

type ModelViewerProps = {
  url: string;
  name: string;
};

// The React Bits Model Viewer interaction, focused on FBX assets for this gallery.
function FbxModel({ url, onLoaded }: { url: string; onLoaded: () => void }) {
  const loaded = useFBX(url);
  const { model, scale, center } = useMemo(() => {
    const model = loaded.clone(true);
    const bounds = new Box3().setFromObject(model);
    const size = bounds.getSize(new Vector3());
    const center = bounds.getCenter(new Vector3());
    const longestSide = Math.max(size.x, size.y, size.z, 0.001);
    return { model, scale: 3 / longestSide, center };
  }, [loaded]);

  useEffect(() => {
    model.traverse((object) => {
      if (object instanceof Mesh) {
        object.castShadow = true;
        object.receiveShadow = true;
      }
    });
    onLoaded();
  }, [model, onLoaded]);

  return (
    <group position={[-center.x * scale, -center.y * scale, -center.z * scale]} scale={scale}>
      <primitive object={model} dispose={null} />
    </group>
  );
}

class ViewerErrorBoundary extends Component<
  { children: ReactNode; name: string },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className={styles.error} role="alert">
          <strong>Model unavailable</strong>
          <span>{this.props.name} could not be displayed. Please try reloading this page.</span>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function ModelViewer({ url, name }: ModelViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [resetCount, setResetCount] = useState(0);
  const { active: downloadActive, progress } = useProgress();
  const handleLoaded = useCallback(() => setLoaded(true), []);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      if (preference.matches) setAutoRotate(false);
    };
    update();
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);

  const capture = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-model.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const reset = () => {
    setLoaded(false);
    setResetCount((count) => count + 1);
  };

  return (
    <div className={styles.viewer} role="group" aria-label={`${name} interactive 3D model`}>
      <ViewerErrorBoundary key={url} name={name}>
        <Canvas
          key={resetCount}
          shadows
          dpr={[1, 1.75]}
          gl={{ antialias: true, preserveDrawingBuffer: true }}
          camera={{ fov: 42, position: [3.7, 2.4, 4.4], near: 0.1, far: 100 }}
          onCreated={({ gl }) => { canvasRef.current = gl.domElement; }}
          className={styles.canvas}
        >
          <color attach="background" args={["#0b1419"]} />
          <ambientLight intensity={1.35} />
          <hemisphereLight args={["#fff1d4", "#263744", 1.15]} />
          <directionalLight position={[4, 7, 5]} intensity={2.1} color="#ffe4b2" castShadow />
          <directionalLight position={[-5, 2, -3]} intensity={1.35} color="#8dc4da" />
          <gridHelper args={[8, 16, "#8b6b3f", "#26343c"]} position={[0, -1.65, 0]} />
          <Suspense fallback={null}>
            <FbxModel url={url} onLoaded={handleLoaded} />
          </Suspense>
          <OrbitControls
            makeDefault
            enableDamping
            dampingFactor={0.08}
            enablePan={false}
            minDistance={2.2}
            maxDistance={12}
            maxPolarAngle={Math.PI * 0.94}
            autoRotate={autoRotate && loaded}
            autoRotateSpeed={1.2}
          />
        </Canvas>
      </ViewerErrorBoundary>

      {!loaded && (
        <div className={styles.loading} aria-live="polite">
          {downloadActive ? `LOADING 3D ASSET · ${Math.round(progress)}%` : "PREPARING 3D ASSET..."}
        </div>
      )}

      <div className={styles.toolbar} role="group" aria-label="3D model controls">
        <button type="button" onClick={reset} title="Reset view" aria-label="Reset model view">
          <RotateCcw size={16} aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => setAutoRotate((value) => !value)}
          title={autoRotate ? "Pause rotation" : "Resume rotation"}
          aria-label={autoRotate ? "Pause model rotation" : "Resume model rotation"}
          aria-pressed={autoRotate}
        >
          {autoRotate ? <Pause size={16} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}
        </button>
        <button type="button" onClick={capture} disabled={!loaded} title="Save image" aria-label="Save model screenshot">
          <Camera size={16} aria-hidden="true" />
          <Download size={11} aria-hidden="true" />
        </button>
      </div>

      <div className={styles.help}>DRAG TO ROTATE <span /> SCROLL OR PINCH TO ZOOM</div>
    </div>
  );
}
