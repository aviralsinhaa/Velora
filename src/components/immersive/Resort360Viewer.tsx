import React, { useEffect, useRef, useState, useCallback } from 'react';
import { veloraResort } from '../../data/resortConfig';
import { PanoramaScene } from '../../types';
import * as THREE from 'three';
import { X, ZoomIn, ZoomOut, Compass, ChevronRight } from 'lucide-react';

interface Resort360ViewerProps {
  initialSceneId?: string;
  onClose: () => void;
}

export function Resort360Viewer({ initialSceneId, onClose }: Resort360ViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeScene, setActiveScene] = useState<PanoramaScene>(() => {
    const found = veloraResort.panoramaScenes.find((s) => s.id === initialSceneId);
    return found || veloraResort.panoramaScenes[0];
  });
  const [isLoadingTexture, setIsLoadingTexture] = useState(true);

  // Three.js single-instance refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sphereMeshRef = useRef<THREE.Mesh | null>(null);
  const currentTextureRef = useRef<THREE.Texture | null>(null);
  const reqIdRef = useRef<number | null>(null);

  // Orbit state
  const isUserInteracting = useRef(false);
  const onPointerDownMouseX = useRef(0);
  const onPointerDownMouseY = useRef(0);
  const lon = useRef(0);
  const onPointerDownLon = useRef(0);
  const lat = useRef(0);
  const onPointerDownLat = useRef(0);
  const phi = useRef(0);
  const theta = useRef(0);
  const fov = useRef(75);

  // Texture swapper: swaps texture without tearing down the WebGL renderer
  const loadTextureIntoMesh = useCallback((imageUrl: string) => {
    if (!sphereMeshRef.current) return;
    setIsLoadingTexture(true);

    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
      imageUrl,
      (newTexture) => {
        newTexture.colorSpace = THREE.SRGBColorSpace;
        newTexture.minFilter = THREE.LinearFilter;
        newTexture.generateMipmaps = false;

        // Dispose previous texture to prevent GPU memory leak
        if (currentTextureRef.current) {
          currentTextureRef.current.dispose();
        }
        currentTextureRef.current = newTexture;

        if (sphereMeshRef.current) {
          const mat = sphereMeshRef.current.material as THREE.MeshBasicMaterial;
          mat.map = newTexture;
          mat.needsUpdate = true;
        }
        setIsLoadingTexture(false);
      },
      undefined,
      (err) => {
        console.error('[360] Texture load error:', err);
        setIsLoadingTexture(false);
      }
    );
  }, []);

  const lastActiveElementRef = useRef<HTMLElement | null>(null);

  // Initialize Three.js scene ONCE per viewer session
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    lastActiveElementRef.current = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(fov.current, width / height, 1, 1100);
    cameraRef.current = camera;

    // 3. Inverted sphere geometry
    const geometry = new THREE.SphereGeometry(500, 60, 40);
    geometry.scale(-1, 1, 1);

    // 4. Material
    const material = new THREE.MeshBasicMaterial();
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    sphereMeshRef.current = mesh;

    // 5. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    rendererRef.current = renderer;

    container.appendChild(renderer.domElement);

    // Load initial scene texture
    loadTextureIntoMesh(activeScene.image);

    // Render loop
    const animate = () => {
      reqIdRef.current = requestAnimationFrame(animate);

      if (!isUserInteracting.current) {
        lon.current += 0.035; // Gentle atmospheric drift
      }

      lat.current = Math.max(-85, Math.min(85, lat.current));
      phi.current = THREE.MathUtils.degToRad(90 - lat.current);
      theta.current = THREE.MathUtils.degToRad(lon.current);

      const targetX = 500 * Math.sin(phi.current) * Math.cos(theta.current);
      const targetY = 500 * Math.cos(phi.current);
      const targetZ = 500 * Math.sin(phi.current) * Math.sin(theta.current);

      camera.lookAt(targetX, targetY, targetZ);
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    // Thorough GPU and DOM cleanup on unmount
    return () => {
      document.body.style.overflow = prevOverflow;
      if (reqIdRef.current) cancelAnimationFrame(reqIdRef.current);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);

      if (currentTextureRef.current) {
        currentTextureRef.current.dispose();
      }
      geometry.dispose();
      material.dispose();

      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      renderer.forceContextLoss();
      if (lastActiveElementRef.current && typeof lastActiveElementRef.current.focus === 'function') {
        lastActiveElementRef.current.focus();
      }
    };
  }, []); // Run only once on mount!

  // Scene switch handler: swap texture without recreating scene
  const handleSelectScene = (scene: PanoramaScene) => {
    setActiveScene(scene);
    loadTextureIntoMesh(scene.image);
  };

  // Pointer & Touch interactions
  const handlePointerDown = (e: React.PointerEvent) => {
    isUserInteracting.current = true;
    onPointerDownMouseX.current = e.clientX;
    onPointerDownMouseY.current = e.clientY;
    onPointerDownLon.current = lon.current;
    onPointerDownLat.current = lat.current;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isUserInteracting.current) return;
    lon.current = (onPointerDownMouseX.current - e.clientX) * 0.15 + onPointerDownLon.current;
    lat.current = (e.clientY - onPointerDownMouseY.current) * 0.15 + onPointerDownLat.current;
  };

  const handlePointerUp = () => {
    isUserInteracting.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (!cameraRef.current) return;
    fov.current = Math.max(40, Math.min(100, fov.current + e.deltaY * 0.05));
    cameraRef.current.fov = fov.current;
    cameraRef.current.updateProjectionMatrix();
  };

  const handleZoom = (delta: number) => {
    if (!cameraRef.current) return;
    fov.current = Math.max(40, Math.min(100, fov.current + delta));
    cameraRef.current.fov = fov.current;
    cameraRef.current.updateProjectionMatrix();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="360° Spatial Panorama Explorer"
      className="fixed inset-0 z-[200] bg-black text-white select-none overflow-hidden touch-none"
    >
      {/* Three.js Canvas Container */}
      <div
        ref={containerRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onWheel={handleWheel}
      />

      {/* Top Floating Bar */}
      <header className="absolute top-0 left-0 right-0 z-30 p-4 sm:p-6 flex items-center justify-between pointer-events-none pt-[calc(1rem+env(safe-area-inset-top))]">
        <div className="pointer-events-auto flex items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20">
            <Compass className="w-3.5 h-3.5 text-[#dfcaa3] shrink-0" />
            <span className="text-[10px] uppercase tracking-[0.24em] font-sans font-medium text-white truncate max-w-[130px] min-[400px]:max-w-[200px] sm:max-w-none">
              {activeScene.title}
            </span>
          </div>
          <span className="hidden sm:inline text-xs text-white/50 font-sans font-light">
            Drag to look around
          </span>
        </div>

        <button
          onClick={onClose}
          className="pointer-events-auto p-2.5 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/20 text-white transition-all hover:scale-105"
          aria-label="Close 360 viewer"
        >
          <X className="w-5 h-5" />
        </button>
      </header>

      {/* Loading Overlay */}
      {isLoadingTexture && (
        <div className="absolute inset-0 z-20 bg-black/50 backdrop-blur-xs flex items-center justify-center pointer-events-none">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-[#dfcaa3] border-t-transparent animate-spin" />
            <span className="text-[10px] uppercase tracking-[0.24em] text-[#dfcaa3] font-sans">
              Loading Panorama
            </span>
          </div>
        </div>
      )}

      {/* Bottom Floating Scene Selector */}
      <footer className="absolute bottom-0 left-0 right-0 z-30 p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 pointer-events-none pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
        {/* Scene Carousel */}
        <div className="pointer-events-auto flex items-center gap-2 overflow-x-auto max-w-full py-1 scrollbar-none">
          {veloraResort.panoramaScenes.map((scene) => {
            const isActive = scene.id === activeScene.id;
            return (
              <button
                key={scene.id}
                onClick={() => handleSelectScene(scene)}
                className={`px-3.5 py-2 rounded-xl border text-left transition-all shrink-0 flex items-center gap-2.5 ${
                  isActive
                    ? 'bg-[#dfcaa3] text-[#04080f] border-[#dfcaa3]'
                    : 'bg-black/60 hover:bg-black/80 text-white/80 border-white/20 backdrop-blur-md'
                }`}
              >
                <span className="text-[9.5px] uppercase tracking-[0.2em] font-sans font-medium whitespace-nowrap">
                  {scene.title}
                </span>
                <ChevronRight className="w-3 h-3 opacity-60" />
              </button>
            );
          })}
        </div>

        {/* Zoom Controls */}
        <div className="pointer-events-auto hidden sm:flex items-center gap-2 bg-black/60 backdrop-blur-md border border-white/20 rounded-full p-1">
          <button
            onClick={() => handleZoom(-10)}
            className="p-2 text-white/70 hover:text-white transition-colors"
            title="Zoom In"
            aria-label="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleZoom(10)}
            className="p-2 text-white/70 hover:text-white transition-colors"
            title="Zoom Out"
            aria-label="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>
      </footer>
    </div>
  );
}
