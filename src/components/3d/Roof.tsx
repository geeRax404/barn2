import React, { useMemo } from 'react';
import * as THREE from 'three';
import type { Skylight } from '../../types';

interface RoofProps {
  width: number;
  length: number;
  height: number;
  pitch: number;
  color: string;
  skylights?: Skylight[];
}

const Roof: React.FC<RoofProps> = ({ width, length, height, pitch, color, skylights = [] }) => {
  const roofHeight = useMemo(() => {
    return (width / 2) * (pitch / 12);
  }, [width, pitch]);
  
  const pitchAngle = Math.atan2(roofHeight, width / 2);
  const panelLength = Math.sqrt(Math.pow(width/2, 2) + Math.pow(roofHeight, 2));

  // Create roof materials and geometries with ULTRA DEFINED corrugated ridges
  const { leftRoofGeometry, rightRoofGeometry, leftRoofMaterial, rightRoofMaterial } = useMemo(() => {
    // 🔥 ULTRA DEFINED CORRUGATED METAL TEXTURE - MAXIMUM RIDGE DEFINITION
    const createUltraDefinedCorrugatedTexture = (panelSide: 'left' | 'right') => {
      const textureWidth = 2048; // DOUBLED resolution for ultra-sharp ridges
      const textureHeight = 2048;
      const canvas = document.createElement('canvas');
      canvas.width = textureWidth;
      canvas.height = textureHeight;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // Base color fill
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, textureWidth, textureHeight);
        
        // 🔥 ULTRA WIDE CORRUGATIONS - MAXIMUM VISIBILITY
        const corrugationWidth = textureWidth / 4; // MASSIVE corrugations (was /8, now /4)
        const corrugationSpacing = corrugationWidth * 1.01; // Ultra-tight spacing
        
        // Special handling for different colors
        const isWhite = color === '#FFFFFF';
        const isDark = ['#1F2937', '#374151', '#4B5563', '#9CA3AF'].includes(color);
        const isRed = color === '#9B2226' || color === '#B91C1C';
        const isGreen = color === '#2D6A4F' || color === '#059669';
        
        // 🔥 MAXIMUM CONTRAST VALUES - ULTRA DRAMATIC RIDGES
        let deepShadowOpacity, lightShadowOpacity, highlightOpacity, brightHighlightOpacity, ultraBrightOpacity, extremeHighlightOpacity;
        
        if (isWhite) {
          deepShadowOpacity = 0.7;        // EXTREME (was 0.4)
          lightShadowOpacity = 0.5;       // EXTREME (was 0.25)
          highlightOpacity = 0.6;         // EXTREME (was 0.35)
          brightHighlightOpacity = 0.8;   // EXTREME (was 0.5)
          ultraBrightOpacity = 0.95;      // ULTRA BRIGHT (was 0.7)
          extremeHighlightOpacity = 1.0;  // MAXIMUM BRIGHTNESS
        } else if (isDark) {
          deepShadowOpacity = 1.0;        // MAXIMUM (was 0.8)
          lightShadowOpacity = 0.8;       // MAXIMUM (was 0.6)
          highlightOpacity = 0.9;         // MAXIMUM (was 0.7)
          brightHighlightOpacity = 1.0;   // MAXIMUM (was 0.9)
          ultraBrightOpacity = 1.0;       // MAXIMUM
          extremeHighlightOpacity = 1.0;  // MAXIMUM
        } else if (isRed || isGreen) {
          deepShadowOpacity = 0.8;        // EXTREME (was 0.6)
          lightShadowOpacity = 0.6;       // EXTREME (was 0.4)
          highlightOpacity = 0.7;         // EXTREME (was 0.5)
          brightHighlightOpacity = 0.9;   // EXTREME (was 0.7)
          ultraBrightOpacity = 1.0;       // MAXIMUM (was 0.9)
          extremeHighlightOpacity = 1.0;  // MAXIMUM
        } else {
          deepShadowOpacity = 0.75;       // EXTREME (was 0.55)
          lightShadowOpacity = 0.55;      // EXTREME (was 0.35)
          highlightOpacity = 0.65;        // EXTREME (was 0.45)
          brightHighlightOpacity = 0.85;  // EXTREME (was 0.65)
          ultraBrightOpacity = 1.0;       // MAXIMUM (was 0.85)
          extremeHighlightOpacity = 1.0;  // MAXIMUM
        }
        
        console.log(`🔥 CREATING ULTRA DEFINED ROOF RIDGES: ${corrugationWidth}px wide, MAXIMUM contrast`);
        
        // 🔥 ULTRA DEFINED CORRUGATED PATTERN - Create MAXIMUM DEFINITION metal roofing ridges
        for (let x = 0; x < textureWidth; x += corrugationSpacing) {
          // Create the MOST complex corrugation profile with EXTREME gradients
          
          // 1. MAXIMUM DEPTH valley shadow - DEEPEST POSSIBLE
          const valleyGradient = ctx.createLinearGradient(x, 0, x + corrugationWidth * 0.12, 0);
          valleyGradient.addColorStop(0, `rgba(0,0,0,${deepShadowOpacity})`);
          valleyGradient.addColorStop(0.3, `rgba(0,0,0,${deepShadowOpacity * 0.9})`);
          valleyGradient.addColorStop(0.7, `rgba(0,0,0,${deepShadowOpacity * 0.7})`);
          valleyGradient.addColorStop(1, `rgba(0,0,0,${lightShadowOpacity})`);
          ctx.fillStyle = valleyGradient;
          ctx.fillRect(x, 0, corrugationWidth * 0.12, textureHeight);
          
          // 2. EXTREME rising slope with MAXIMUM contrast progression
          const riseGradient = ctx.createLinearGradient(x + corrugationWidth * 0.12, 0, x + corrugationWidth * 0.35, 0);
          riseGradient.addColorStop(0, `rgba(0,0,0,${lightShadowOpacity})`);
          riseGradient.addColorStop(0.15, `rgba(0,0,0,${lightShadowOpacity * 0.7})`);
          riseGradient.addColorStop(0.35, `rgba(0,0,0,${lightShadowOpacity * 0.4})`);
          riseGradient.addColorStop(0.55, `rgba(0,0,0,0)`); // Neutral
          riseGradient.addColorStop(0.7, `rgba(255,255,255,${highlightOpacity * 0.3})`);
          riseGradient.addColorStop(0.85, `rgba(255,255,255,${highlightOpacity * 0.7})`);
          riseGradient.addColorStop(1, `rgba(255,255,255,${brightHighlightOpacity * 0.8})`);
          ctx.fillStyle = riseGradient;
          ctx.fillRect(x + corrugationWidth * 0.12, 0, corrugationWidth * 0.23, textureHeight);
          
          // 3. MAXIMUM BRIGHTNESS peak plateau - ULTRA WIDE AND BRIGHT
          const peakGradient = ctx.createLinearGradient(x + corrugationWidth * 0.35, 0, x + corrugationWidth * 0.65, 0);
          peakGradient.addColorStop(0, `rgba(255,255,255,${brightHighlightOpacity})`);
          peakGradient.addColorStop(0.2, `rgba(255,255,255,${ultraBrightOpacity})`);
          peakGradient.addColorStop(0.5, `rgba(255,255,255,${extremeHighlightOpacity})`); // MAXIMUM BRIGHTNESS
          peakGradient.addColorStop(0.8, `rgba(255,255,255,${ultraBrightOpacity})`);
          peakGradient.addColorStop(1, `rgba(255,255,255,${brightHighlightOpacity})`);
          ctx.fillStyle = peakGradient;
          ctx.fillRect(x + corrugationWidth * 0.35, 0, corrugationWidth * 0.3, textureHeight);
          
          // 4. EXTREME falling slope back to MAXIMUM shadow
          const fallGradient = ctx.createLinearGradient(x + corrugationWidth * 0.65, 0, x + corrugationWidth * 0.88, 0);
          fallGradient.addColorStop(0, `rgba(255,255,255,${brightHighlightOpacity})`);
          fallGradient.addColorStop(0.15, `rgba(255,255,255,${highlightOpacity * 0.7})`);
          fallGradient.addColorStop(0.3, `rgba(255,255,255,${highlightOpacity * 0.3})`);
          fallGradient.addColorStop(0.45, `rgba(0,0,0,0)`); // Neutral
          fallGradient.addColorStop(0.65, `rgba(0,0,0,${lightShadowOpacity * 0.4})`);
          fallGradient.addColorStop(0.85, `rgba(0,0,0,${lightShadowOpacity * 0.7})`);
          fallGradient.addColorStop(1, `rgba(0,0,0,${lightShadowOpacity})`);
          ctx.fillStyle = fallGradient;
          ctx.fillRect(x + corrugationWidth * 0.65, 0, corrugationWidth * 0.23, textureHeight);
          
          // 5. FINAL MAXIMUM valley approach with DEEPEST shadow
          const finalGradient = ctx.createLinearGradient(x + corrugationWidth * 0.88, 0, x + corrugationWidth, 0);
          finalGradient.addColorStop(0, `rgba(0,0,0,${lightShadowOpacity})`);
          finalGradient.addColorStop(0.3, `rgba(0,0,0,${deepShadowOpacity * 0.7})`);
          finalGradient.addColorStop(0.7, `rgba(0,0,0,${deepShadowOpacity * 0.9})`);
          finalGradient.addColorStop(1, `rgba(0,0,0,${deepShadowOpacity})`); // MAXIMUM DEPTH
          ctx.fillStyle = finalGradient;
          ctx.fillRect(x + corrugationWidth * 0.88, 0, corrugationWidth * 0.12, textureHeight);
          
          // 6. ULTRA SHARP definition lines for MAXIMUM ridge visibility
          if (corrugationWidth > 20) {
            // LASER BRIGHT line at the very peak - MAXIMUM WIDTH
            ctx.fillStyle = `rgba(255,255,255,${extremeHighlightOpacity})`;
            ctx.fillRect(x + corrugationWidth * 0.48, 0, 12, textureHeight); // ULTRA WIDE (was 6px, now 12px)
            
            // SECONDARY ultra-bright lines for extreme definition
            ctx.fillStyle = `rgba(255,255,255,${ultraBrightOpacity})`;
            ctx.fillRect(x + corrugationWidth * 0.44, 0, 8, textureHeight);
            ctx.fillRect(x + corrugationWidth * 0.56, 0, 8, textureHeight);
            
            // TERTIARY bright lines for maximum definition
            ctx.fillStyle = `rgba(255,255,255,${brightHighlightOpacity * 1.2})`;
            ctx.fillRect(x + corrugationWidth * 0.40, 0, 6, textureHeight);
            ctx.fillRect(x + corrugationWidth * 0.60, 0, 6, textureHeight);
            
            // MAXIMUM DEPTH shadow lines in the valleys
            ctx.fillStyle = `rgba(0,0,0,${deepShadowOpacity})`;
            ctx.fillRect(x + corrugationWidth * 0.01, 0, 8, textureHeight); // ULTRA WIDE shadow
            ctx.fillRect(x + corrugationWidth * 0.99, 0, 8, textureHeight); // ULTRA WIDE shadow
            
            // SECONDARY maximum shadow lines for extreme depth
            ctx.fillStyle = `rgba(0,0,0,${deepShadowOpacity * 0.8})`;
            ctx.fillRect(x + corrugationWidth * 0.06, 0, 6, textureHeight);
            ctx.fillRect(x + corrugationWidth * 0.94, 0, 6, textureHeight);
            
            // TERTIARY shadow lines for maximum depth definition
            ctx.fillStyle = `rgba(0,0,0,${lightShadowOpacity * 1.5})`;
            ctx.fillRect(x + corrugationWidth * 0.10, 0, 4, textureHeight);
            ctx.fillRect(x + corrugationWidth * 0.90, 0, 4, textureHeight);
            
            // QUATERNARY definition lines for ULTRA REALISM
            ctx.fillStyle = `rgba(255,255,255,${highlightOpacity * 1.3})`;
            ctx.fillRect(x + corrugationWidth * 0.37, 0, 3, textureHeight);
            ctx.fillRect(x + corrugationWidth * 0.63, 0, 3, textureHeight);
            
            ctx.fillStyle = `rgba(0,0,0,${lightShadowOpacity * 1.4})`;
            ctx.fillRect(x + corrugationWidth * 0.14, 0, 2, textureHeight);
            ctx.fillRect(x + corrugationWidth * 0.86, 0, 2, textureHeight);
          }
        }
        
        // Add ULTRA ENHANCED horizontal panel seams
        const seamSpacing = textureHeight / 2.5; // Fewer, more prominent seams
        ctx.strokeStyle = `rgba(0,0,0,${lightShadowOpacity * 1.5})`;
        ctx.lineWidth = 8; // ULTRA THICK seams (was 4, now 8)
        for (let y = seamSpacing; y < textureHeight; y += seamSpacing) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(textureWidth, y);
          ctx.stroke();
          
          // Add ULTRA BRIGHT highlight above seam
          ctx.strokeStyle = `rgba(255,255,255,${brightHighlightOpacity})`;
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(0, y - 4);
          ctx.lineTo(textureWidth, y - 4);
          ctx.stroke();
          
          // Add ULTRA SHADOW below seam
          ctx.strokeStyle = `rgba(0,0,0,${deepShadowOpacity})`;
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(0, y + 4);
          ctx.lineTo(textureWidth, y + 4);
          ctx.stroke();
          
          // Reset for next seam
          ctx.strokeStyle = `rgba(0,0,0,${lightShadowOpacity * 1.5})`;
          ctx.lineWidth = 8;
        }
        
        // 🎯 ADD MAXIMUM WEATHERING PATTERN for ultra realism
        if (!isWhite) {
          // Add MAXIMUM random weathering marks
          ctx.globalAlpha = 0.12; // MAXIMUM weathering (was 0.08)
          for (let i = 0; i < 80; i++) { // MAXIMUM weathering marks (was 60)
            const wx = Math.random() * textureWidth;
            const wy = Math.random() * textureHeight;
            const wsize = Math.random() * 8 + 3; // MAXIMUM weathering marks
            ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)';
            ctx.fillRect(wx, wy, wsize, wsize * 0.25);
          }
          ctx.globalAlpha = 1.0;
        }
        
        console.log(`✅ ULTRA DEFINED CORRUGATED ROOF TEXTURE CREATED for ${panelSide} panel - MAXIMUM RIDGE DEFINITION`);
      }
      
      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(3, length/2); // MAXIMUM corrugation size (was 6, now 3) for ULTRA DEFINITION
      
      return texture;
    };

    // 🎯 ALWAYS CREATE ULTRA DEFINED CORRUGATED TEXTURES
    console.log(`🔥 CREATING ULTRA DEFINED CORRUGATED TEXTURES for both roof panels - MAXIMUM RIDGE DEFINITION`);
    const leftTexture = createUltraDefinedCorrugatedTexture('left');
    const rightTexture = createUltraDefinedCorrugatedTexture('right');
    
    // 🎯 MAXIMUM MATERIAL PROPERTIES for ULTRA ridge definition
    const isWhite = color === '#FFFFFF';
    const isDark = ['#1F2937', '#374151', '#4B5563', '#9CA3AF'].includes(color);
    
    const materialProps = isWhite ? {
      metalness: 0.9,  // MAXIMUM metalness (was 0.8)
      roughness: 0.05, // MINIMUM roughness (was 0.15)
      envMapIntensity: 2.5, // MAXIMUM environment reflection (was 1.8)
    } : isDark ? {
      metalness: 1.0,  // ABSOLUTE MAXIMUM (was 0.95)
      roughness: 0.01, // ABSOLUTE MINIMUM (was 0.05)
      envMapIntensity: 3.0, // ABSOLUTE MAXIMUM (was 2.0)
    } : {
      metalness: 0.95, // MAXIMUM metalness (was 0.9)
      roughness: 0.03, // MINIMUM roughness (was 0.1)
      envMapIntensity: 2.0, // MAXIMUM environment reflection (was 1.5)
    };
    
    // 🎯 ALWAYS CREATE MATERIALS WITH ULTRA DEFINED CORRUGATED TEXTURES
    const leftMaterial = new THREE.MeshStandardMaterial({
      map: leftTexture,
      ...materialProps,
      side: THREE.DoubleSide,
    });

    const rightMaterial = new THREE.MeshStandardMaterial({
      map: rightTexture,
      ...materialProps,
      side: THREE.DoubleSide,
    });
    
    console.log(`🔥 ULTRA DEFINED ROOF MATERIALS CREATED: Both panels have MAXIMUM RIDGE DEFINITION`);

    // Create roof geometries with skylight cutouts ONLY where needed
    const createRoofGeometryWithCutouts = (isLeftPanel: boolean) => {
      // Filter skylights for this specific panel only
      const panelSkylights = skylights.filter(s => 
        s.panel === (isLeftPanel ? 'left' : 'right')
      );

      console.log(`${isLeftPanel ? 'Left' : 'Right'} panel has ${panelSkylights.length} skylights`);

      if (panelSkylights.length === 0) {
        // 🎯 NO SKYLIGHTS: Use simple box geometry - ULTRA DEFINED RIDGES ALWAYS VISIBLE
        console.log(`${isLeftPanel ? 'Left' : 'Right'} panel: Using simple BoxGeometry - ULTRA DEFINED RIDGES ALWAYS VISIBLE`);
        const geometry = new THREE.BoxGeometry(panelLength, 0.2, length);
        
        // 🔧 CRITICAL: Apply proper UV mapping for ultra defined corrugated texture on simple geometry
        const uvAttribute = geometry.attributes.uv;
        const positionAttribute = geometry.attributes.position;
        const uvArray = uvAttribute.array;
        const positionArray = positionAttribute.array;
        
        // Map UVs to show ULTRA DEFINED corrugations running along the panel length
        for (let i = 0; i < positionArray.length; i += 3) {
          const x = positionArray[i];
          const y = positionArray[i + 1];
          const z = positionArray[i + 2];
          
          const uvIndex = (i / 3) * 2;
          
          // Calculate UV coordinates for ULTRA DEFINED corrugated pattern
          // Corrugations run along the length (Z direction), so use Z for the corrugated axis
          uvArray[uvIndex] = (z + length/2) / length * 3; // U coordinate - MAXIMUM corrugations (was 6, now 3)
          uvArray[uvIndex + 1] = (x + panelLength/2) / panelLength * (length/2); // V coordinate - across width
        }
        
        uvAttribute.needsUpdate = true;
        console.log(`${isLeftPanel ? 'Left' : 'Right'} panel: Applied ULTRA DEFINED corrugated UV mapping to BoxGeometry - MAXIMUM RIDGE DEFINITION ALWAYS VISIBLE`);
        return geometry;
      }

      // 🎯 HAS SKYLIGHTS: Use extruded geometry with SELECTIVE cutouts - ULTRA DEFINED RIDGES PRESERVED
      console.log(`${isLeftPanel ? 'Left' : 'Right'} panel: Using ExtrudeGeometry with ${panelSkylights.length} skylight cutouts - ULTRA DEFINED RIDGES PRESERVED EXCEPT IN CUTOUTS`);
      
      // Create the roof panel shape in the XY plane (will be rotated later)
      const roofShape = new THREE.Shape();
      roofShape.moveTo(-panelLength/2, -length/2);
      roofShape.lineTo(panelLength/2, -length/2);
      roofShape.lineTo(panelLength/2, length/2);
      roofShape.lineTo(-panelLength/2, length/2);
      roofShape.closePath();

      // 🔪 SELECTIVE CUTTING: Create holes ONLY for skylights on this panel
      panelSkylights.forEach(skylight => {
        const skylightHole = new THREE.Path();
        
        // Convert skylight position to roof panel coordinates
        // Panel coordinates: xOffset is relative to panel center, yOffset is relative to ridge
        const localX = skylight.xOffset * (panelLength / (width/2));
        const localY = skylight.yOffset;
        
        const holeWidth = skylight.width * (panelLength / (width/2));
        const holeLength = skylight.length;
        
        // Ensure skylight hole is within panel bounds
        const maxLocalX = panelLength/2 - holeWidth/2;
        const maxLocalY = length/2 - holeLength/2;
        const clampedLocalX = Math.max(-maxLocalX, Math.min(maxLocalX, localX));
        const clampedLocalY = Math.max(-maxLocalY, Math.min(maxLocalY, localY));
        
        console.log(`🔪 SELECTIVE CUT: Creating skylight hole on ${isLeftPanel ? 'left' : 'right'} panel at (${clampedLocalX.toFixed(2)}, ${clampedLocalY.toFixed(2)}) size ${holeWidth.toFixed(2)}x${holeLength.toFixed(2)}`);
        
        // Create rectangular hole ONLY where the skylight is
        skylightHole.moveTo(clampedLocalX - holeWidth/2, clampedLocalY - holeLength/2);
        skylightHole.lineTo(clampedLocalX + holeWidth/2, clampedLocalY - holeLength/2);
        skylightHole.lineTo(clampedLocalX + holeWidth/2, clampedLocalY + holeLength/2);
        skylightHole.lineTo(clampedLocalX - holeWidth/2, clampedLocalY + holeLength/2);
        skylightHole.closePath();
        
        roofShape.holes.push(skylightHole);
        console.log(`  ✂️ Added SELECTIVE hole for skylight - ULTRA DEFINED ridges preserved everywhere else`);
      });

      const extrudeSettings = {
        steps: 1,
        depth: 0.2,
        bevelEnabled: false
      };

      const geometry = new THREE.ExtrudeGeometry(roofShape, extrudeSettings);
      
      // 🔧 CRITICAL: Apply proper UV mapping to extruded geometry for PRESERVED ULTRA DEFINED corrugated texture
      const uvAttribute = geometry.attributes.uv;
      const positionAttribute = geometry.attributes.position;
      const uvArray = uvAttribute.array;
      const positionArray = positionAttribute.array;
      
      console.log(`${isLeftPanel ? 'Left' : 'Right'} panel: Applying ULTRA DEFINED corrugated UV mapping to ExtrudeGeometry with selective cutouts`);
      
      // Apply UV mapping that preserves the ULTRA DEFINED corrugated pattern EVERYWHERE except in the holes
      for (let i = 0; i < positionArray.length; i += 3) {
        const x = positionArray[i];
        const y = positionArray[i + 1];
        const z = positionArray[i + 2];
        
        const uvIndex = (i / 3) * 2;
        
        // 🎯 PRESERVE ULTRA DEFINED RIDGES: Map UV coordinates to show MAXIMUM corrugations running along the panel length
        // The extruded geometry is in XY plane, so:
        // - X corresponds to the panel length direction (where corrugations run)
        // - Y corresponds to the panel width direction (across corrugations)
        uvArray[uvIndex] = (x + panelLength/2) / panelLength * 3; // U coordinate - MAXIMUM corrugations (was 6, now 3)
        uvArray[uvIndex + 1] = (y + length/2) / length * (length/2); // V coordinate - across width
      }
      
      // Rotate the geometry to align with the roof pitch
      // The extruded geometry is created in XY plane, we need to rotate it to XZ plane
      geometry.rotateX(-Math.PI / 2); // Rotate to lie flat in XZ plane
      
      uvAttribute.needsUpdate = true;
      console.log(`${isLeftPanel ? 'Left' : 'Right'} panel: ULTRA DEFINED corrugated texture applied to ExtrudeGeometry - MAXIMUM RIDGE DEFINITION PRESERVED with selective skylight cutouts`);
      return geometry;
    };
    
    // Create geometries with SELECTIVE cutouts and PRESERVED ULTRA DEFINED ridges
    const leftGeometry = createRoofGeometryWithCutouts(true);
    const rightGeometry = createRoofGeometryWithCutouts(false);
    
    return { 
      leftRoofGeometry: leftGeometry,
      rightRoofGeometry: rightGeometry,
      leftRoofMaterial: leftMaterial, 
      rightRoofMaterial: rightMaterial 
    };
  }, [color, length, width, panelLength, skylights]);

  const skylightMaterial = new THREE.MeshPhysicalMaterial({
    color: '#FFFFFF',
    metalness: 0.1,
    roughness: 0.05,
    transmission: 0.9,
    transparent: true,
    opacity: 0.6,
    side: THREE.DoubleSide,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
  });

  const createSkylight = (skylight: Skylight, isLeftPanel: boolean) => {
    // Only create skylight if it belongs to this panel
    if (skylight.panel !== (isLeftPanel ? 'left' : 'right')) {
      return null;
    }

    const skylightWidth = skylight.width;
    const skylightLength = skylight.length;
    
    // Calculate position in roof panel coordinates
    // Panel coordinates: xOffset is relative to panel center, yOffset is relative to ridge
    const localX = skylight.xOffset * (panelLength / (width/2));
    const localY = skylight.yOffset;
    
    // Position the skylight to sit flush in the cutout
    const skylightX = localX;
    const skylightY = 0.05; // Slightly above the roof surface to prevent z-fighting
    const skylightZ = localY;
    
    return (
      <mesh
        key={`${isLeftPanel ? 'left' : 'right'}-${skylight.xOffset}-${skylight.yOffset}`}
        position={[skylightX, skylightY, skylightZ]}
        rotation={[0, 0, 0]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[skylightWidth * (panelLength / (width/2)), 0.1, skylightLength]} />
        <primitive object={skylightMaterial} attach="material" />
      </mesh>
    );
  };
  
  return (
    <group position={[0, height, 0]}>
      {/* Left roof panel with ULTRA DEFINED CORRUGATED TEXTURE ALWAYS VISIBLE */}
      <group 
        position={[-width / 4, roofHeight / 2, 0]}
        rotation={[0, 0, pitchAngle]}
      >
        <mesh castShadow receiveShadow>
          <primitive object={leftRoofGeometry} />
          <primitive object={leftRoofMaterial} attach="material" />
        </mesh>
        
        {/* Skylights positioned in the cutouts for left panel */}
        {skylights
          .filter(s => s.panel === 'left')
          .map(s => createSkylight(s, true))
          .filter(Boolean) // Remove null skylights
        }
      </group>
      
      {/* Right roof panel with ULTRA DEFINED CORRUGATED TEXTURE ALWAYS VISIBLE */}
      <group
        position={[width / 4, roofHeight / 2, 0]}
        rotation={[0, 0, -pitchAngle]}
      >
        <mesh castShadow receiveShadow>
          <primitive object={rightRoofGeometry} />
          <primitive object={rightRoofMaterial} attach="material" />
        </mesh>
        
        {/* Skylights positioned in the cutouts for right panel */}
        {skylights
          .filter(s => s.panel === 'right')
          .map(s => createSkylight(s, false))
          .filter(Boolean) // Remove null skylights
        }
      </group>
      
      {/* Ridge cap with ULTRA ENHANCED corrugated texture */}
      <mesh 
        position={[0, roofHeight, 0]} 
        castShadow 
        receiveShadow
      >
        <boxGeometry args={[0.4, 0.3, length]} />
        <meshStandardMaterial 
          color={color} 
          metalness={color === '#FFFFFF' ? 0.9 : 1.0} // MAXIMUM metalness
          roughness={color === '#FFFFFF' ? 0.1 : 0.01} // MINIMUM roughness for ultra-sharp definition
          envMapIntensity={color === '#FFFFFF' ? 2.0 : 3.0} // MAXIMUM environment reflection
        />
      </mesh>
    </group>
  );
};

export default Roof;