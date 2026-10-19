import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

/**
 * ==============================================================================
 * Photorealistic 3D LED Bulb (Three.js WebGL)
 * ==============================================================================
 * Modern LED A19 bulb with physically convincing construction:
 *
 * GLASS ENVELOPE — LatheGeometry pear-shaped contour with MeshPhysicalMaterial
 *   using transmission for real refraction. Stays clear in both states; only
 *   picks up a faint warm tint when illuminated.
 *
 * LED FILAMENT ASSEMBLY — 8 thin vertical LED strip bars arranged in a
 *   cylindrical pattern around a tiny central post. Each strip is a narrow
 *   CylinderGeometry (radius 0.007). When OFF they are dark grey; when ON
 *   they glow warm white (~2700 K) via emissive material. No giant yellow
 *   sphere — the glow comes from these thin elements only.
 *
 * INTERNAL STRUCTURE — glass support stem, two metallic lead wires, and a
 *   small hub disc connecting the filament strips to the stem.
 *
 * SCREW BASE — E27 brass cylinder with 4 torus thread ridges, black
 *   insulator ring, and copper contact tip.
 *
 * LIGHTING — warm point light at filament center (only active when ON),
 *   studio key light, rim light, and soft ambient.
 *
 * STATE TRANSITIONS — smooth lerp between OFF and ON. Glass stays clear,
 *   filament strips transition from cold grey to glowing amber-white,
 *   point light ramps up. No rotation, no overlay, no background change.
 *
 * RESOURCE MANAGEMENT — all geometries and materials disposed on unmount.
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

  const stateRef = useRef({
    isOn,
    isPending,
    isOnline,
    currentGlow: isOn ? 1.0 : 0.0,
    targetGlow: isOn ? 1.0 : 0.0,
  });

  useEffect(() => {
    stateRef.current.isOn = isOn;
    stateRef.current.isPending = isPending;
    stateRef.current.isOnline = isOnline;
    stateRef.current.targetGlow = isOn && isOnline ? 1.0 : 0.0;
  }, [isOn, isPending, isOnline]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // WebGL check
    try {
      const tc = document.createElement('canvas');
      const gl = tc.getContext('webgl') || tc.getContext('experimental-webgl');
      if (!gl) { setWebglSupported(false); return; }
    } catch { setWebglSupported(false); return; }

    const width = container.clientWidth || 140;
    const canvasHeight = height;

    // =====================================================================
    // SCENE, CAMERA, RENDERER
    // =====================================================================
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(32, width / canvasHeight, 0.1, 50);
    camera.position.set(0.15, 0.1, 4.8);
    camera.lookAt(0, 0.1, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, canvasHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // =====================================================================
    // STUDIO LIGHTING
    // =====================================================================
    // Soft ambient fill — softly and evenly illuminated when OFF, slightly deeper when ON
    const ambientLight = new THREE.AmbientLight(0xf5f0e8, 1.15);
    scene.add(ambientLight);

    // Key light — warm, upper-right, creates specular highlight on glass
    const keyLight = new THREE.DirectionalLight(0xfff8ef, 1.9);
    keyLight.position.set(3, 4, 4);
    scene.add(keyLight);

    // Fill light — cooler, left side, reveals glass edge definition
    const fillLight = new THREE.DirectionalLight(0xe8ecf0, 0.65);
    fillLight.position.set(-3, 1, 2);
    scene.add(fillLight);

    // Rim light — back, defines glass silhouette
    const rimLight = new THREE.DirectionalLight(0xfff5eb, 0.9);
    rimLight.position.set(-1, -1, -3);
    scene.add(rimLight);

    // Bulb internal point light — centered at filament hub, active when ON
    const bulbPointLight = new THREE.PointLight(0xfde68a, 0, 3.5, 1.4);
    bulbPointLight.position.set(0, 0.42, 0);
    scene.add(bulbPointLight);

    // Geometry tracking for disposal
    const geometries = [];
    const materials = [];
    const reg = (g) => { geometries.push(g); return g; };
    const regMat = (m) => { materials.push(m); return m; };

    // =====================================================================
    // ROOT GROUP
    // =====================================================================
    const bulbGroup = new THREE.Group();
    bulbGroup.position.set(0, -0.05, 0);
    bulbGroup.rotation.x = 0.06; // very subtle tilt
    scene.add(bulbGroup);

    // =====================================================================
    // MATERIALS
    // =====================================================================

    // Glass — clear, refractive, with subtle specular highlights
    const glassMat = regMat(new THREE.MeshPhysicalMaterial({
      color: 0xfcfcfc,
      transparent: true,
      opacity: 0.22,
      roughness: 0.04,
      metalness: 0.0,
      transmission: 0.94,
      thickness: 0.15,
      ior: 1.52,
      emissive: new THREE.Color(0x000000),
      emissiveIntensity: 0,
      depthWrite: false,
      side: THREE.DoubleSide,
    }));

    // Brass screw base
    const brassMat = regMat(new THREE.MeshStandardMaterial({
      color: 0xc9a96e,
      roughness: 0.25,
      metalness: 0.85,
    }));

    // Black insulator
    const insulatorMat = regMat(new THREE.MeshStandardMaterial({
      color: 0x1a1d23,
      roughness: 0.55,
      metalness: 0.15,
    }));

    // Copper contact tip
    const contactMat = regMat(new THREE.MeshStandardMaterial({
      color: 0xa0703a,
      roughness: 0.3,
      metalness: 0.9,
    }));

    // Glass stem (internal transparent support)
    const stemMat = regMat(new THREE.MeshStandardMaterial({
      color: 0xd6d3d1,
      transparent: true,
      opacity: 0.45,
      roughness: 0.15,
      metalness: 0.0,
    }));

    // Internal wire leads
    const wireMat = regMat(new THREE.MeshStandardMaterial({
      color: 0xa1a1aa,
      roughness: 0.3,
      metalness: 0.8,
    }));

    // Central hub disc connecting filament strips to stem
    const hubMat = regMat(new THREE.MeshStandardMaterial({
      color: 0xb0b0b0,
      roughness: 0.35,
      metalness: 0.7,
    }));

    // LED FILAMENT STRIPS — main emissive element
    const filamentMat = regMat(new THREE.MeshStandardMaterial({
      color: 0x78716c, // cold: warm grey
      emissive: new THREE.Color(0x000000),
      emissiveIntensity: 0,
      roughness: 0.45,
      metalness: 0.15,
    }));

    // =====================================================================
    // GEOMETRY: GLASS ENVELOPE (A19 pear contour)
    // =====================================================================
    const bulbProfile = [
      new THREE.Vector2(0.22, -0.48),
      new THREE.Vector2(0.25, -0.38),
      new THREE.Vector2(0.30, -0.25),
      new THREE.Vector2(0.38, -0.10),
      new THREE.Vector2(0.50, 0.08),
      new THREE.Vector2(0.62, 0.28),
      new THREE.Vector2(0.70, 0.48),
      new THREE.Vector2(0.73, 0.65),
      new THREE.Vector2(0.72, 0.80),
      new THREE.Vector2(0.66, 0.94),
      new THREE.Vector2(0.55, 1.06),
      new THREE.Vector2(0.42, 1.16),
      new THREE.Vector2(0.28, 1.24),
      new THREE.Vector2(0.14, 1.29),
      new THREE.Vector2(0.00, 1.31),
    ];
    const glassGeom = reg(new THREE.LatheGeometry(bulbProfile, 48));
    const glassMesh = new THREE.Mesh(glassGeom, glassMat);
    bulbGroup.add(glassMesh);

    // =====================================================================
    // GEOMETRY: SCREW BASE (E27)
    // =====================================================================
    const baseCoreGeom = reg(new THREE.CylinderGeometry(0.235, 0.22, 0.44, 36));
    const baseCoreMesh = new THREE.Mesh(baseCoreGeom, brassMat);
    baseCoreMesh.position.y = -0.70;
    bulbGroup.add(baseCoreMesh);

    // Thread ridges
    for (let r = 0; r < 5; r++) {
      const ridgeG = reg(new THREE.TorusGeometry(0.234, 0.018, 10, 36));
      const ridgeM = new THREE.Mesh(ridgeG, brassMat);
      ridgeM.rotation.x = Math.PI / 2;
      ridgeM.position.y = -0.53 - r * 0.085;
      bulbGroup.add(ridgeM);
    }

    // Insulator ring
    const insGeom = reg(new THREE.CylinderGeometry(0.20, 0.13, 0.07, 28));
    const insMesh = new THREE.Mesh(insGeom, insulatorMat);
    insMesh.position.y = -0.95;
    bulbGroup.add(insMesh);

    // Contact tip
    const contGeom = reg(new THREE.CylinderGeometry(0.08, 0.04, 0.04, 24));
    const contMesh = new THREE.Mesh(contGeom, contactMat);
    contMesh.position.y = -1.0;
    bulbGroup.add(contMesh);

    // =====================================================================
    // GEOMETRY: INTERNAL GLASS STEM & LEAD WIRES
    // =====================================================================
    // Tapered glass stem from base neck to filament area
    const stemGeom = reg(new THREE.CylinderGeometry(0.05, 0.10, 0.50, 20));
    const stemMesh = new THREE.Mesh(stemGeom, stemMat);
    stemMesh.position.y = -0.22;
    bulbGroup.add(stemMesh);

    // Two thin internal lead wires
    const leadGeom = reg(new THREE.CylinderGeometry(0.006, 0.006, 0.55, 8));
    const lead1 = new THREE.Mesh(leadGeom, wireMat);
    lead1.position.set(0.06, 0.0, 0);
    lead1.rotation.z = -0.08;
    bulbGroup.add(lead1);

    const lead2 = new THREE.Mesh(leadGeom, wireMat);
    lead2.position.set(-0.06, 0.0, 0);
    lead2.rotation.z = 0.08;
    bulbGroup.add(lead2);

    // =====================================================================
    // GEOMETRY: LED FILAMENT ASSEMBLY
    // =====================================================================

    // Small hub disc at top of stem — filament mounting plate
    const hubGeom = reg(new THREE.CylinderGeometry(0.09, 0.06, 0.025, 24));
    const hubMesh = new THREE.Mesh(hubGeom, hubMat);
    hubMesh.position.y = 0.06;
    bulbGroup.add(hubMesh);

    // Central post extending from hub upward
    const postGeom = reg(new THREE.CylinderGeometry(0.012, 0.012, 0.72, 10));
    const postMesh = new THREE.Mesh(postGeom, wireMat);
    postMesh.position.y = 0.42;
    bulbGroup.add(postMesh);

    // 8 thin LED filament strips arranged around the central post
    // These are narrow vertical bars — the primary emissive elements
    const numStrips = 8;
    const stripGeom = reg(new THREE.BoxGeometry(0.008, 0.58, 0.025));
    const filamentMeshes = [];

    for (let i = 0; i < numStrips; i++) {
      const angle = (i * Math.PI * 2) / numStrips;
      const r = 0.08; // tight ring around the central post
      const strip = new THREE.Mesh(stripGeom, filamentMat);
      strip.position.set(
        Math.cos(angle) * r,
        0.38,
        Math.sin(angle) * r,
      );
      // Face outward
      strip.rotation.y = -angle;
      // Very slight outward fan
      strip.rotation.x = Math.sin(angle) * 0.04;
      strip.rotation.z = -Math.cos(angle) * 0.04;
      bulbGroup.add(strip);
      filamentMeshes.push(strip);
    }

    // Tiny top cap at the apex of the filament assembly
    const topCapGeom = reg(new THREE.SphereGeometry(0.02, 12, 12));
    const topCapMesh = new THREE.Mesh(topCapGeom, wireMat);
    topCapMesh.position.y = 0.78;
    bulbGroup.add(topCapMesh);

    // Small, contained inner glow — NOT a giant sphere. Just a soft haze
    // around the filament strips to simulate light scatter inside the glass.
    const hazeGeom = reg(new THREE.SphereGeometry(0.10, 16, 16));
    const hazeMat = regMat(new THREE.MeshBasicMaterial({
      color: 0xfef3c7, // very warm cream
      transparent: true,
      opacity: 0,
      depthWrite: false,
    }));
    const hazeMesh = new THREE.Mesh(hazeGeom, hazeMat);
    hazeMesh.position.y = 0.42;
    bulbGroup.add(hazeMesh);

    // =====================================================================
    // ANIMATION LOOP
    // =====================================================================
    let animId;
    const clock = new THREE.Clock();

    // Pre-allocated colors to avoid GC in the animation loop
    const coldFilamentColor = new THREE.Color(0x78716c);  // dark warm grey
    const hotFilamentColor = new THREE.Color(0xfde68a);   // warm white-amber (~2700K look)
    const coldEmissive = new THREE.Color(0x000000);
    const hotEmissive = new THREE.Color(0xf59e0b);        // warm amber emission
    const coldGlass = new THREE.Color(0xfcfcfc);
    const warmGlass = new THREE.Color(0xfff9f0);          // barely perceptible warm tint

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = Math.min(clock.getDelta(), 0.1);
      const s = stateRef.current;

      // Smooth state transition (300-600ms range)
      s.currentGlow += (s.targetGlow - s.currentGlow) * Math.min(1.0, delta * 6.5);

      let glow = s.currentGlow;
      // Pending: gentle pulse around mid-brightness
      if (s.isPending) {
        glow = 0.4 + Math.sin(clock.getElapsedTime() * 6) * 0.2;
      }

      // ---------------------------------------------------------------
      // STUDIO & AMBIENT LIGHTING — softly illuminated in both states, keeping stage bright
      // ---------------------------------------------------------------
      ambientLight.intensity = 1.15 - glow * 0.04;

      // ---------------------------------------------------------------
      // FILAMENT STRIPS — the main visual difference between ON and OFF
      // ---------------------------------------------------------------
      // Color: dark grey → warm white-amber (~2700K look)
      filamentMat.color.lerpColors(coldFilamentColor, hotFilamentColor, glow);
      // Emissive: unlit black → warm amber
      filamentMat.emissive.lerpColors(coldEmissive, hotEmissive, glow);
      filamentMat.emissiveIntensity = glow * 4.2;

      // ---------------------------------------------------------------
      // GLASS ENVELOPE — stays essentially clear, just subtle warmth
      // ---------------------------------------------------------------
      glassMat.color.lerpColors(coldGlass, warmGlass, glow);
      glassMat.emissive.lerpColors(coldEmissive, hotEmissive, glow);
      glassMat.emissiveIntensity = glow * 0.05; // very faint warmth
      glassMat.opacity = 0.22 + glow * 0.05;
      glassMat.transmission = 0.94 - glow * 0.05;

      // ---------------------------------------------------------------
      // INNER HAZE — very small, subtle light scatter near filaments
      // ---------------------------------------------------------------
      hazeMat.opacity = glow * 0.22;

      // ---------------------------------------------------------------
      // POINT LIGHT — illuminates screw base and nearby glass surfaces
      // ---------------------------------------------------------------
      bulbPointLight.intensity = glow * 2.2;
      bulbPointLight.color.setHex(0xfde68a);

      renderer.render(scene, camera);
    };

    animate();

    // Resize
    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth || 140;
      camera.aspect = w / canvasHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(w, canvasHeight);
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(container);

    // Cleanup
    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      renderer.dispose();
      if (renderer.domElement?.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, [height]);

  // WebGL fallback
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
