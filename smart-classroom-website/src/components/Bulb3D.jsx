import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

/**
 * ==============================================================================
 * Realistic 3D Virtual Bulb (Three.js WebGL)
 * ==============================================================================
 * Genuine 3D procedural geometry for physical LED visualization:
 * - Rounded pear-shaped glass envelope (procedural LatheGeometry)
 * - Tapered neck transition & screw base (E26/E27 metallic threaded cylinder)
 * - Central vintage/modern LED filament structure on glass mount
 * - Emissive warmth & local point illumination when confirmed ON
 * - Neutral refractive glass and unlit tungsten filament when confirmed OFF
 * - Stationary (never rotates) with smooth state transitions
 * - Clean WebGL resource disposal on unmount
 */

export default function Bulb3D({
  isOn = false,
  isPending = false,
  isOnline = true,
  className = '',
  height = 130,
}) {
  const containerRef = useRef(null);
  const [webglSupported, setWebglSupported] = useState(true);

  // References for animation state
  const stateRef = useRef({
    isOn,
    isPending,
    isOnline,
    currentGlow: isOn ? 1.0 : 0.0,
    targetGlow: isOn ? 1.0 : 0.0,
  });

  // Keep state updated
  useEffect(() => {
    stateRef.current.isOn = isOn;
    stateRef.current.isPending = isPending;
    stateRef.current.isOnline = isOnline;
    stateRef.current.targetGlow = isOn && isOnline ? 1.0 : 0.0;
  }, [isOn, isPending, isOnline]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check WebGL availability
    try {
      const testCanvas = document.createElement('canvas');
      const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
      if (!gl) {
        setWebglSupported(false);
        return;
      }
    } catch {
      setWebglSupported(false);
      return;
    }

    const width = container.clientWidth || 140;
    const canvasHeight = height;

    // 1. Scene Setup
    const scene = new THREE.Scene();

    // 2. Camera Setup (fixed, attractive angle)
    const camera = new THREE.PerspectiveCamera(34, width / canvasHeight, 0.1, 50);
    camera.position.set(0, 0.05, 4.6);
    camera.lookAt(0, 0.05, 0);

    // 3. Renderer with transparent background
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, canvasHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Studio Lighting
    const ambientLight = new THREE.AmbientLight(0xfffdf7, 1.4);
    scene.add(ambientLight);

    // Main studio key light casting highlights on glass curvature and metal screw
    const keyLight = new THREE.DirectionalLight(0xfffaed, 2.2);
    keyLight.position.set(3, 5, 4);
    scene.add(keyLight);

    // Rim light defining glass outer edges
    const rimLight = new THREE.DirectionalLight(0xc7d2fe, 0.9);
    rimLight.position.set(-3, -1, -3);
    scene.add(rimLight);

    // Internal Point Light for emissive bulb glow
    const bulbPointLight = new THREE.PointLight(0xfef08a, 0.0, 3.5, 1.2);
    bulbPointLight.position.set(0, 0.35, 0);
    scene.add(bulbPointLight);

    // Track geometries for cleanup
    const geometriesToDispose = [];
    const registerGeom = (g) => {
      geometriesToDispose.push(g);
      return g;
    };

    // 5. Root Bulb Group (Stationary, upright, centered)
    const bulbGroup = new THREE.Group();
    bulbGroup.position.set(0, -0.05, 0);
    // Subtle tilt to reveal depth and screw ridges
    bulbGroup.rotation.x = 0.08;
    scene.add(bulbGroup);

    // =========================================================================
    // MATERIALS
    // =========================================================================

    // A. Glass Envelope Material (Refractive with subtle specular highlight)
    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.38,
      roughness: 0.08,
      metalness: 0.05,
      transmission: 0.88,
      ior: 1.5,
      emissive: new THREE.Color(0xfef3c7),
      emissiveIntensity: 0.0,
      depthWrite: false,
    });

    // B. Vintage Brass/Gold Screw Base
    const brassBaseMaterial = new THREE.MeshStandardMaterial({
      color: 0xc8aa6e,
      roughness: 0.28,
      metalness: 0.82,
    });

    // C. Base Insulator & Contact Point
    const insulatorMaterial = new THREE.MeshStandardMaterial({
      color: 0x1f242d,
      roughness: 0.6,
      metalness: 0.2,
    });

    const contactPointMaterial = new THREE.MeshStandardMaterial({
      color: 0x92612b,
      roughness: 0.3,
      metalness: 0.9,
    });

    // D. Central Glass Stem & Internal Support Wires
    const stemMaterial = new THREE.MeshStandardMaterial({
      color: 0xe5e7eb,
      transparent: true,
      opacity: 0.5,
      roughness: 0.2,
    });

    const wireMaterial = new THREE.MeshStandardMaterial({
      color: 0x9ca3af,
      roughness: 0.3,
      metalness: 0.85,
    });

    // E. Glowing LED Filament Material
    const filamentMaterial = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      emissive: new THREE.Color(0xfbbf24),
      emissiveIntensity: 0.0,
      roughness: 0.4,
      metalness: 0.1,
    });

    // =========================================================================
    // 3D GEOMETRY CONSTRUCTION
    // =========================================================================

    // 1. Procedural Glass Bulb Envelope (A19 / Edison teardrop contour)
    const bulbPoints = [];
    // Start at bottom neck transition
    bulbPoints.push(new THREE.Vector2(0.24, -0.45));
    bulbPoints.push(new THREE.Vector2(0.28, -0.32));
    bulbPoints.push(new THREE.Vector2(0.36, -0.15));
    bulbPoints.push(new THREE.Vector2(0.52, 0.08));
    bulbPoints.push(new THREE.Vector2(0.68, 0.35));
    bulbPoints.push(new THREE.Vector2(0.74, 0.62));
    bulbPoints.push(new THREE.Vector2(0.70, 0.88));
    bulbPoints.push(new THREE.Vector2(0.55, 1.10));
    bulbPoints.push(new THREE.Vector2(0.34, 1.25));
    bulbPoints.push(new THREE.Vector2(0.12, 1.32));
    bulbPoints.push(new THREE.Vector2(0.00, 1.34)); // Top apex

    const glassGeom = registerGeom(new THREE.LatheGeometry(bulbPoints, 36));
    const glassMesh = new THREE.Mesh(glassGeom, glassMaterial);
    bulbGroup.add(glassMesh);

    // 2. Metallic Screw Base (E27 thread pattern)
    // Cylindrical core
    const baseCoreGeom = registerGeom(new THREE.CylinderGeometry(0.25, 0.23, 0.45, 32));
    const baseCoreMesh = new THREE.Mesh(baseCoreGeom, brassBaseMaterial);
    baseCoreMesh.position.y = -0.68;
    bulbGroup.add(baseCoreMesh);

    // 4 Distinct Screw Ridges / Threads
    for (let r = 0; r < 4; r++) {
      const ridgeGeom = registerGeom(new THREE.TorusGeometry(0.248, 0.024, 12, 32));
      const ridgeMesh = new THREE.Mesh(ridgeGeom, brassBaseMaterial);
      ridgeMesh.rotation.x = Math.PI / 2;
      ridgeMesh.position.y = -0.52 - r * 0.1;
      bulbGroup.add(ridgeMesh);
    }

    // 3. Black Insulator Ring & Bottom Contact Tip
    const insulatorGeom = registerGeom(new THREE.CylinderGeometry(0.21, 0.14, 0.08, 24));
    const insulatorMesh = new THREE.Mesh(insulatorGeom, insulatorMaterial);
    insulatorMesh.position.y = -0.93;
    bulbGroup.add(insulatorMesh);

    const contactGeom = registerGeom(new THREE.CylinderGeometry(0.09, 0.05, 0.04, 24));
    const contactMesh = new THREE.Mesh(contactGeom, contactPointMaterial);
    contactMesh.position.y = -0.98;
    bulbGroup.add(contactMesh);

    // 4. Internal Glass Mount & Support Stem
    const stemGeom = registerGeom(new THREE.CylinderGeometry(0.065, 0.11, 0.38, 20));
    const stemMesh = new THREE.Mesh(stemGeom, stemMaterial);
    stemMesh.position.y = -0.28;
    bulbGroup.add(stemMesh);

    // 5. Internal Metallic Support Leads
    const leadGeom = registerGeom(new THREE.CylinderGeometry(0.009, 0.009, 0.42, 12));
    
    const lead1 = new THREE.Mesh(leadGeom, wireMaterial);
    lead1.position.set(0.09, 0.05, 0);
    lead1.rotation.z = -0.15;
    bulbGroup.add(lead1);

    const lead2 = new THREE.Mesh(leadGeom, wireMaterial);
    lead2.position.set(-0.09, 0.05, 0);
    lead2.rotation.z = 0.15;
    bulbGroup.add(lead2);

    // 6. Realistic Vintage LED Filament Bars
    // 4 vertical arched filament sticks forming classic Edison/LED chandelier look
    const numFilaments = 4;
    const filamentGeom = registerGeom(new THREE.CylinderGeometry(0.016, 0.016, 0.46, 16));

    for (let f = 0; f < numFilaments; f++) {
      const angle = (f * Math.PI * 2) / numFilaments;
      const radius = 0.13;
      const filamentMesh = new THREE.Mesh(filamentGeom, filamentMaterial);
      filamentMesh.position.set(
        Math.cos(angle) * radius,
        0.44,
        Math.sin(angle) * radius
      );
      // Slight outward lean
      filamentMesh.rotation.x = Math.sin(angle) * 0.1;
      filamentMesh.rotation.z = -Math.cos(angle) * 0.1;
      bulbGroup.add(filamentMesh);
    }

    // 7. Subtle Central Glow Core (Spherical light-diffusion core)
    const glowCoreGeom = registerGeom(new THREE.SphereGeometry(0.18, 20, 20));
    const glowCoreMaterial = new THREE.MeshBasicMaterial({
      color: 0xfef08a,
      transparent: true,
      opacity: 0.0,
      depthWrite: false,
    });
    const glowCoreMesh = new THREE.Mesh(glowCoreGeom, glowCoreMaterial);
    glowCoreMesh.position.y = 0.44;
    bulbGroup.add(glowCoreMesh);

    // =========================================================================
    // ANIMATION & STATE TRANSITION LOOP
    // =========================================================================
    let animationFrameId;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.1);
      const state = stateRef.current;

      // Smooth interpolation for warm illumination ramp (simulates real incandescent/LED phosphor ramp)
      const glowLerpSpeed = 7.0;
      state.currentGlow += (state.targetGlow - state.currentGlow) * Math.min(1.0, delta * glowLerpSpeed);

      // Handle subtle pending state pulse
      let effectiveGlow = state.currentGlow;
      if (state.isPending) {
        effectiveGlow = 0.35 + Math.sin(clock.getElapsedTime() * 8) * 0.25;
      }

      // Update materials according to confirmed hardware glow
      filamentMaterial.emissiveIntensity = effectiveGlow * 3.2;
      glassMaterial.emissiveIntensity = effectiveGlow * 0.42;
      glowCoreMaterial.opacity = effectiveGlow * 0.55;
      bulbPointLight.intensity = effectiveGlow * 2.2;

      // Render the scene
      renderer.render(scene, camera);
    };

    animate();

    // Resize handling
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth || 140;
      camera.aspect = newWidth / canvasHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, canvasHeight);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // Cleanup on unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();

      geometriesToDispose.forEach((g) => g.dispose());
      glassMaterial.dispose();
      brassBaseMaterial.dispose();
      insulatorMaterial.dispose();
      contactPointMaterial.dispose();
      stemMaterial.dispose();
      wireMaterial.dispose();
      filamentMaterial.dispose();
      glowCoreMaterial.dispose();
      renderer.dispose();

      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, [height]);

  // Graceful WebGL Fallback
  if (!webglSupported) {
    return (
      <div
        style={{ height }}
        className={`w-full flex flex-col items-center justify-center p-2 text-stone-500 ${className}`}
      >
        <svg className="w-14 h-14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M9 18h6" />
          <path d="M10 22h4" />
          <path d="M12 2a7 7 0 0 0-7 7c0 2.5 1.5 4.5 3 6v1a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-1c1.5-1.5 3-3.5 3-6a7 7 0 0 0-7-7z" fill={isOn ? '#fbbf24' : 'none'} />
        </svg>
        <span className="text-[10px] text-stone-400 mt-1">
          {isOn ? 'Confirmed ON' : 'Confirmed OFF'}
        </span>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{ height }}
      className={`w-full relative overflow-hidden flex items-center justify-center select-none ${className}`}
    />
  );
}
