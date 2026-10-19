import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

/**
 * ==============================================================================
 * Realistic 3D Virtual Ceiling Fan (Three.js WebGL)
 * ==============================================================================
 * Architectural Features:
 * 1. Proper 3D Scene Hierarchy:
 *    - mountGroup (STATIONARY): Ceiling canopy, vertical downrod, motor upper body.
 *    - rotorGroup (ROTATING): Center rotor hub + 3 aerodynamic blades + brackets.
 * 2. Real WebGL 3D Geometry:
 *    - Procedural beveled downrod, brushed motor housing, aerodynamically pitched blades.
 * 3. Rotational Physics & Inertia:
 *    - Smooth acceleration and deceleration between OFF, LOW, MEDIUM, and HIGH.
 *    - Rotor decelerates with realistic inertia and stops completely when OFF.
 * 4. Transparent Canvas:
 *    - Seamlessly blends into the soft glassmorphic UI card.
 * 5. Lifecycle & Disposal:
 *    - All geometries, materials, and renderer instances cleanly disposed on unmount.
 * 6. Accessibility & Fallback:
 *    - Respects prefers-reduced-motion and provides graceful WebGL-unavailable fallback.
 */

const SPEED_RAD_PER_SEC = {
  OFF: 0,
  LOW: 3.2,
  MEDIUM: 7.5,
  HIGH: 15.0,
};

export default function CeilingFan3D({
  mode = 'OFF',
  isAuto = true,
  className = '',
  height = 360,
}) {
  const containerRef = useRef(null);
  const [webglSupported, setWebglSupported] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Speed reference for continuous frame-to-frame inertia
  const speedStateRef = useRef({
    currentSpeed: mode === 'OFF' ? 0 : SPEED_RAD_PER_SEC[mode] || 0,
    targetSpeed: SPEED_RAD_PER_SEC[mode] || 0,
  });

  // Check reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);
    const handler = (e) => setReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  // Sync target speed when mode changes
  useEffect(() => {
    const target = reducedMotion && mode !== 'OFF'
      ? 1.0 // gentle crawl for reduced motion
      : SPEED_RAD_PER_SEC[mode] ?? 0;
    speedStateRef.current.targetSpeed = target;
  }, [mode, reducedMotion]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Verify WebGL support
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

    const width = container.clientWidth || 400;
    const canvasHeight = height;

    // 2. Scene setup
    const scene = new THREE.Scene();

    // 3. Camera setup - perfectly framed so rotating blades have generous margin
    const camera = new THREE.PerspectiveCamera(34, width / canvasHeight, 0.1, 50);
    // Positioned to show stationary canopy, rod, motor, and blade depth with generous margin
    camera.position.set(0, 1.35, 5.1);
    camera.lookAt(0, 0.28, 0);

    // 4. WebGL Renderer with transparent background
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

    // 5. Studio Lighting matching soft warm ivory glassmorphism theme
    const ambientLight = new THREE.AmbientLight(0xfdfbf7, 1.6);
    scene.add(ambientLight);

    // Warm sunlight key light: angled top-front-left highlighting metallic curves
    const keyLight = new THREE.DirectionalLight(0xfff5e6, 2.5);
    keyLight.position.set(4, 8, 6);
    scene.add(keyLight);

    // Soft rim light from back-right for depth
    const rimLight = new THREE.DirectionalLight(0xc7d2fe, 0.8);
    rimLight.position.set(-4, 3, -3);
    scene.add(rimLight);

    // Soft warm under-light fill
    const fillLight = new THREE.DirectionalLight(0xfef3c7, 1.1);
    fillLight.position.set(0, -2, 4);
    scene.add(fillLight);

    // 6. Materials - Warm Champagne Titanium & Satin Platinum Finish
    // Brushed Champagne Nickel / Titanium for Rod, Canopy and Stationary Motor
    const metalMaterial = new THREE.MeshStandardMaterial({
      color: 0xc8c2b7,
      roughness: 0.28,
      metalness: 0.76,
    });

    // Deeper warm brushed titanium accent collar & hub
    const accentMetalMaterial = new THREE.MeshStandardMaterial({
      color: 0x9e988f,
      roughness: 0.32,
      metalness: 0.82,
    });

    // Aerodynamic Blades - Refined Warm Satin Platinum-Silver
    const bladeMaterial = new THREE.MeshStandardMaterial({
      color: 0xd6d2cb,
      roughness: 0.34,
      metalness: 0.38,
    });

    // Warm LED Center Diffuser Disc
    const diffuserMaterial = new THREE.MeshStandardMaterial({
      color: 0xfffaed,
      roughness: 0.35,
      metalness: 0.05,
      emissive: 0xfef08a,
      emissiveIntensity: 0.45,
    });

    // Geometries tracker for complete disposal
    const geometriesToDispose = [];
    const registerGeom = (g) => {
      geometriesToDispose.push(g);
      return g;
    };

    // 7. Hierarchy Construction
    const fanRoot = new THREE.Group();
    // Subtle tilt towards camera so top & blades are distinct
    fanRoot.rotation.x = 0.12;
    scene.add(fanRoot);

    // =========================================================================
    // A. STATIONARY MOUNT GROUP (Never rotates!)
    // =========================================================================
    const mountGroup = new THREE.Group();
    fanRoot.add(mountGroup);

    // 1. Ceiling Canopy (flange at ceiling)
    const canopyGeom = registerGeom(new THREE.CylinderGeometry(0.38, 0.44, 0.14, 32));
    const canopyMesh = new THREE.Mesh(canopyGeom, metalMaterial);
    canopyMesh.position.y = 1.25;
    mountGroup.add(canopyMesh);

    // 2. Downrod (stationary vertical shaft)
    const rodGeom = registerGeom(new THREE.CylinderGeometry(0.048, 0.048, 0.82, 24));
    const rodMesh = new THREE.Mesh(rodGeom, metalMaterial);
    rodMesh.position.y = 0.82;
    mountGroup.add(rodMesh);

    // 3. Rod Collar & Coupler
    const collarGeom = registerGeom(new THREE.CylinderGeometry(0.09, 0.09, 0.12, 24));
    const collarMesh = new THREE.Mesh(collarGeom, accentMetalMaterial);
    collarMesh.position.y = 0.44;
    mountGroup.add(collarMesh);

    // 4. Stationary Upper Motor Housing
    const upperMotorGeom = registerGeom(new THREE.CylinderGeometry(0.42, 0.48, 0.28, 36));
    const upperMotorMesh = new THREE.Mesh(upperMotorGeom, metalMaterial);
    upperMotorMesh.position.y = 0.26;
    mountGroup.add(upperMotorMesh);

    // 5. Stationary Light Dome / Lower Housing Cap
    const domeGeom = registerGeom(new THREE.CylinderGeometry(0.36, 0.32, 0.08, 32));
    const domeMesh = new THREE.Mesh(domeGeom, diffuserMaterial);
    domeMesh.position.y = 0.04;
    mountGroup.add(domeMesh);

    const domeTrimGeom = registerGeom(new THREE.TorusGeometry(0.36, 0.02, 16, 32));
    const domeTrimMesh = new THREE.Mesh(domeTrimGeom, accentMetalMaterial);
    domeTrimMesh.rotation.x = Math.PI / 2;
    domeTrimMesh.position.y = 0.07;
    mountGroup.add(domeTrimMesh);

    // =========================================================================
    // B. ROTATING ASSEMBLY (ROTOR GROUP) - ROTATES AROUND VERTICAL Y AXIS
    // =========================================================================
    const rotorGroup = new THREE.Group();
    // Center of rotation aligned precisely with the vertical downrod shaft
    rotorGroup.position.set(0, 0.18, 0);
    fanRoot.add(rotorGroup);

    // 1. Rotor Hub Ring (central rotating drum)
    const rotorHubGeom = registerGeom(new THREE.CylinderGeometry(0.51, 0.51, 0.14, 36));
    const rotorHubMesh = new THREE.Mesh(rotorHubGeom, accentMetalMaterial);
    rotorGroup.add(rotorHubMesh);

    // 2. Three Aerodynamic Fan Blades (spaced at 120° increments)
    const NUM_BLADES = 3;
    const bladeAngleStep = (Math.PI * 2) / NUM_BLADES;

    // Procedural Aerodynamic Blade Profile using Shape
    const bladeShape = new THREE.Shape();
    // Root start at bracket
    bladeShape.moveTo(0, -0.09);
    bladeShape.lineTo(0.35, -0.11);
    // Smooth aerodynamic curve along leading edge
    bladeShape.bezierCurveTo(0.85, -0.13, 1.35, -0.12, 1.68, -0.06);
    // Rounded tip
    bladeShape.bezierCurveTo(1.78, -0.02, 1.82, 0.05, 1.74, 0.09);
    // Trailing edge with graceful taper
    bladeShape.bezierCurveTo(1.35, 0.14, 0.75, 0.13, 0.35, 0.10);
    bladeShape.lineTo(0, 0.08);
    bladeShape.closePath();

    const extrudeSettings = {
      depth: 0.016,
      bevelEnabled: true,
      bevelSegments: 2,
      steps: 1,
      bevelSize: 0.006,
      bevelThickness: 0.006,
    };
    const bladeGeom = registerGeom(new THREE.ExtrudeGeometry(bladeShape, extrudeSettings));
    // Center blade geometry on pivot
    bladeGeom.center();

    // Metallic Blade Iron Bracket
    const bracketGeom = registerGeom(new THREE.BoxGeometry(0.24, 0.03, 0.07));

    for (let i = 0; i < NUM_BLADES; i++) {
      const angle = i * bladeAngleStep;
      const bladeArm = new THREE.Group();
      bladeArm.rotation.y = angle;

      // Iron bracket connecting hub to blade
      const bracketMesh = new THREE.Mesh(bracketGeom, metalMaterial);
      bracketMesh.position.set(0.48, 0, 0);
      bladeArm.add(bracketMesh);

      // Aerodynamic Blade
      const bladeMesh = new THREE.Mesh(bladeGeom, bladeMaterial);
      // Position outwards along radial arm
      bladeMesh.position.set(1.42, 0, 0);
      // Add realistic aerodynamic attack angle pitch (~11 degrees)
      bladeMesh.rotation.x = -0.19;
      // Slight upward dihedral angle (~2 degrees)
      bladeMesh.rotation.z = 0.035;

      bladeArm.add(bladeMesh);
      rotorGroup.add(bladeArm);
    }

    // 8. Animation Loop with Inertia
    let animationFrameId;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const delta = Math.min(clock.getDelta(), 0.1);
      const state = speedStateRef.current;

      // Smooth exponential acceleration / deceleration towards target speed
      // Faster acceleration (3.5), smoother coasting deceleration (2.2)
      const lerpRate = state.targetSpeed < state.currentSpeed ? 2.2 : 3.5;
      state.currentSpeed += (state.targetSpeed - state.currentSpeed) * Math.min(1.0, delta * lerpRate);

      // Snap to exact zero when near standstill to prevent microscopic drift
      if (state.targetSpeed === 0 && state.currentSpeed < 0.02) {
        state.currentSpeed = 0;
      }

      // Rotate ONLY the rotor group around its vertical central axis
      if (state.currentSpeed > 0) {
        rotorGroup.rotation.y += state.currentSpeed * delta;
      }

      renderer.render(scene, camera);
    };

    animate();

    // 9. Resize Observer
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth || 400;
      camera.aspect = newWidth / canvasHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, canvasHeight);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // 10. Resource Cleanup & WebGL Disposal
    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();

      geometriesToDispose.forEach((g) => g.dispose());
      metalMaterial.dispose();
      accentMetalMaterial.dispose();
      bladeMaterial.dispose();
      diffuserMaterial.dispose();
      renderer.dispose();

      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, [height]);

  // Graceful WebGL unavailable fallback
  if (!webglSupported) {
    return (
      <div
        style={{ height }}
        className={`w-full flex flex-col items-center justify-center p-6 bg-stone-50/80 rounded-2xl border border-stone-200 text-stone-600 ${className}`}
      >
        <svg className="w-24 h-24 text-stone-400 mb-3" viewBox="0 0 100 100" fill="none">
          <circle cx="50" cy="50" r="16" fill="#9ca3af" />
          <line x1="50" y1="50" x2="50" y2="10" stroke="#d4d8df" strokeWidth="8" strokeLinecap="round" />
          <line x1="50" y1="50" x2="85" y2="70" stroke="#d4d8df" strokeWidth="8" strokeLinecap="round" />
          <line x1="50" y1="50" x2="15" y2="70" stroke="#d4d8df" strokeWidth="8" strokeLinecap="round" />
          <circle cx="50" cy="50" r="7" fill="#fef3c7" />
        </svg>
        <div className="text-xs font-bold text-stone-800">3D Ceiling Fan Visualization</div>
        <div className="text-[11px] text-stone-400 mt-1 text-center">
          WebGL acceleration is unavailable in your browser environment. Fan mode: <strong>{mode}</strong>
        </div>
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
