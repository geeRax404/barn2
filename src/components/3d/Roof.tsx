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

  // Create roof materials and geometries with DRAMATICALLY ENHANCED corrugated ridges
  const { leftRoofGeometry, rightRoofGeometry, leftRoofMaterial, rightRoofMaterial } = useMemo(() => {
    // 🎯 DRAMATICALLY ENHANCED CORRUGATED METAL TEXTURE - SUPER DEFINED RIDGES
    const createEnhancedCorrugatedTexture = (panelSide: 'left' | 'right') => {
      const textureWidth = 1024;
      const textureHeight = 1024;
      const canvas = document.createElement('canvas');
      canvas.width = textureWidth;
      canvas.height = textureHeight;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // Base color fill
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, textureWidth, textureHeight);
        
        // 🔥 DRAMATICALLY ENHANCED CORRUGATED PATTERN - SUPER DEFINED RIDGES
        const corrugationWidth = textureWidth / 8; // MUCH WIDER corrugations (was /16, now /8)
        const corrugationSpacing = corrugationWidth * 1.02; // Very tight spacing for continuous ridges
        
        // Special handling for different colors
        const isWhite = color === '#FFFFFF';
        const isDark = ['#1F2937', '#374151', '#4B5563', '#9CA3AF'].includes(color);
        const isRed = color === '#9B2226' || color === '#B91C1C';
        const isGreen = color === '#2D6A4F' || color === '#059669';
        
        // 🔥 EXTREME CONTRAST VALUES - SUPER DRAMATIC RIDGES
        let deepShadowOpacity, lightShadowOpacity, highlightOpacity, brightHighlightOpacity, ultraBrightOpacity;
        
        if (isWhite) {
          deepShadowOpacity = 0.4;      // MUCH STRONGER (was 0.2)
          lightShadowOpacity = 0.25;    // MUCH STRONGER (was 0.12)
          highlightOpacity = 0.35;      // MUCH STRONGER (was 0.15)
          brightHighlightOpacity = 0.5; // MUCH STRONGER (was 0.25)
          ultraBrightOpacity = 0.7;     // NEW - ULTRA BRIGHT
        } else if (isDark) {
          deepShadowOpacity = 0.8;      // EXTREME (was 0.5)
          lightShadowOpacity = 0.6;     // EXTREME (was 0.3)
          highlightOpacity = 0.7;       // EXTREME (was 0.4)
          brightHighlightOpacity = 0.9; // EXTREME (was 0.6)
          ultraBrightOpacity = 1.0;     // MAXIMUM
        } else if (isRed || isGreen) {
          deepShadowOpacity = 0.6;      // MUCH STRONGER (was 0.35)
          lightShadowOpacity = 0.4;     // MUCH STRONGER (was 0.2)
          highlightOpacity = 0.5;       // MUCH STRONGER (was 0.25)
          brightHighlightOpacity = 0.7; // MUCH STRONGER (was 0.4)
          ultraBrightOpacity = 0.9;     // NEW
        } else {
          deepShadowOpacity = 0.55;     // MUCH STRONGER (was 0.3)
          lightShadowOpacity = 0.35;    // MUCH STRONGER (was 0.18)
          highlightOpacity = 0.45;      // MUCH STRONGER (was 0.2)
          brightHighlightOpacity = 0.65; // MUCH STRONGER (was 0.35)
          ultraBrightOpacity = 0.85;    // NEW
        }
        
        console.log(`🔥 CREATING SUPER DEFINED ROOF RIDGES: ${corrugationWidth}px wide, extreme contrast`);
        
        // 🔥 DRAMATICALLY ENHANCED CORRUGATED PATTERN - Create SUPER DEFINED metal roofing ridges
        for (let x = 0; x < textureWidth; x += corrugationSpacing) {
          // Create an even MORE complex corrugation profile with EXTREME gradients
          
          // 1. ULTRA DEEP valley shadow - MAXIMUM DEPTH
          const valleyGradient = ctx.createLinearGradient(x, 0, x + corrugationWidth * 0.15, 0);
          valleyGradient.addColorStop(0, `rgba(0,0,0,${deepShadowOpacity * 1.2})`); // EVEN DEEPER
          valleyGradient.addColorStop(0.5, `rgba(0,0,0,${deepShadowOpacity})`);
          valleyGradient.addColorStop(1, `rgba(0,0,0,${lightShadowOpacity})`);
          ctx.fillStyle = valleyGradient;
          ctx.fillRect(x, 0, corrugationWidth * 0.15, textureHeight);
          
          // 2. DRAMATIC rising slope with EXTREME contrast progression
          const riseGradient = ctx.createLinearGradient(x + corrugationWidth * 0.15, 0, x + corrugationWidth * 0.4, 0);
          riseGradient.addColorStop(0, `rgba(0,0,0,${lightShadowOpacity})`);
          riseGradient.addColorStop(0.2, `rgba(0,0,0,${lightShadowOpacity * 0.6})`);
          riseGradient.addColorStop(0.5, `rgba(0,0,0,0)`); // Neutral
          riseGradient.addColorStop(0.7, `rgba(255,255,255,${highlightOpacity * 0.5})`);
          riseGradient.addColorStop(0.9, `rgba(255,255,255,${highlightOpacity})`);
          riseGradient.addColorStop(1, `rgba(255,255,255,${brightHighlightOpacity * 0.8})`);
          ctx.fillStyle = riseGradient;
          ctx.fillRect(x + corrugationWidth * 0.15, 0, corrugationWidth * 0.25, textureHeight);
          
          // 3. ULTRA BRIGHT peak plateau with MAXIMUM highlight
          const peakGradient = ctx.createLinearGradient(x + corrugationWidth * 0.4, 0, x + corrugationWidth * 0.6, 0);
          peakGradient.addColorStop(0, `rgba(255,255,255,${brightHighlightOpacity})`);
          peakGradient.addColorStop(0.3, `rgba(255,255,255,${ultraBrightOpacity})`); // ULTRA BRIGHT
          peakGradient.addColorStop(0.7, `rgba(255,255,255,${ultraBrightOpacity})`); // ULTRA BRIGHT
          peakGradient.addColorStop(1, `rgba(255,255,255,${brightHighlightOpacity})`);
          ctx.fillStyle = peakGradient;
          ctx.fillRect(x + corrugationWidth * 0.4, 0, corrugationWidth * 0.2, textureHeight);
          
          // 4. DRAMATIC falling slope back to DEEP shadow
          const fallGradient = ctx.createLinearGradient(x + corrugationWidth * 0.6, 0, x + corrugationWidth * 0.85, 0);
          fallGradient.addColorStop(0, `rgba(255,255,255,${brightHighlightOpacity})`);
          fallGradient.addColorStop(0.2, `rgba(255,255,255,${highlightOpacity})`);
          fallGradient.addColorStop(0.5, `rgba(0,0,0,0)`); // Neutral
          fallGradient.addColorStop(0.8, `rgba(0,0,0,${lightShadowOpacity * 0.6})`);
          fallGradient.addColorStop(1, `rgba(0,0,0,${lightShadowOpacity})`);
          ctx.fillStyle = fallGradient;
          ctx.fillRect(x + corrugationWidth * 0.6, 0, corrugationWidth * 0.25, textureHeight);
          
          // 5. FINAL valley approach with MAXIMUM shadow depth
          const finalGradient = ctx.createLinearGradient(x + corrugationWidth * 0.85, 0, x + corrugationWidth, 0);
          finalGradient.addColorStop(0, `rgba(0,0,0,${lightShadowOpacity})`);
          finalGradient.addColorStop(0.5, `rgba(0,0,0,${deepShadowOpacity})`);
          finalGradient.addColorStop(1, `rgba(0,0,0,${deepShadowOpacity * 1.2})`); // MAXIMUM DEPTH
          ctx.fillStyle = finalGradient;
          ctx.fillRect(x + corrugationWidth * 0.85, 0, corrugationWidth * 0.15, textureHeight);
          
          // 6. ULTRA SHARP definition lines for MAXIMUM ridge visibility
          if (corrugationWidth > 15) { // Only for larger corrugations
            // ULTRA BRIGHT line at the very peak - LASER SHARP
            ctx.fillStyle = `rgba(255,255,255,${ultraBrightOpacity * 1.5})`;
            ctx.fillRect(x + corrugationWidth * 0.49, 0, 6, textureHeight); // WIDER line (was 2px, now 6px)
            
            // SECONDARY bright lines for more definition
            ctx.fillStyle = `rgba(255,255,255,${brightHighlightOpacity * 1.3})`;
            ctx.fillRect(x + corrugationWidth * 0.46, 0, 3, textureHeight);
            ctx.fillRect(x + corrugationWidth * 0.53, 0, 3, textureHeight);
            
            // ULTRA DARK shadow lines in the valleys - MAXIMUM DEPTH
            ctx.fillStyle = `rgba(0,0,0,${deepShadowOpacity * 1.5})`;
            ctx.fillRect(x + corrugationWidth * 0.02, 0, 4, textureHeight); // WIDER shadow
            ctx.fillRect(x + corrugationWidth * 0.98, 0, 4, textureHeight); // WIDER shadow
            
            // SECONDARY shadow lines for more depth
            ctx.fillStyle = `rgba(0,0,0,${deepShadowOpacity * 1.2})`;
            ctx.fillRect(x + corrugationWidth * 0.08, 0, 2, textureHeight);
            ctx.fillRect(x + corrugationWidth * 0.92, 0, 2, textureHeight);
            
            // TERTIARY definition lines for ULTRA REALISM
            ctx.fillStyle = `rgba(255,255,255,${highlightOpacity * 1.1})`;
            ctx.fillRect(x + corrugationWidth * 0.43, 0, 1, textureHeight);
            ctx.fillRect(x + corrugationWidth * 0.56, 0, 1, textureHeight);
            
            ctx.fillStyle = `rgba(0,0,0,${lightShadowOpacity * 1.3})`;
            ctx.fillRect(x + corrugationWidth * 0.12, 0, 1, textureHeight);
            ctx.fillRect(x + corrugationWidth * 0.88, 0, 1, textureHeight);
          }
        }
        
        // Add ENHANCED horizontal panel seams every 8 feet equivalent
        const seamSpacing = textureHeight / 3; // Fewer, more prominent seams
        ctx.strokeStyle = `rgba(0,0,0,${lightShadowOpacity * 1.2})`;
        ctx.lineWidth = 4; // THICKER seams (was 2, now 4)
        for (let y = seamSpacing; y < textureHeight; y += seamSpacing) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(textureWidth, y);
          ctx.stroke();
          
          // Add BRIGHT highlight above seam for more definition
          ctx.strokeStyle = `rgba(255,255,255,${highlightOpacity * 0.6})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(0, y - 2);
          ctx.lineTo(textureWidth, y - 2);
          ctx.stroke();
          
          // Add SHADOW below seam for more depth
          ctx.strokeStyle = `rgba(0,0,0,${lightShadowOpacity * 0.8})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(0, y + 2);
          ctx.lineTo(textureWidth, y + 2);
          ctx.stroke();
          
          // Reset for next seam
          ctx.strokeStyle = `rgba(0,0,0,${lightShadowOpacity * 1.2})`;
          ctx.lineWidth = 4;
        }
        
        // 🎯 ADD ENHANCED WEATHERING PATTERN for more realism
        if (!isWhite) {
          // Add STRONGER random weathering marks
          ctx.globalAlpha = 0.08; // STRONGER weathering (was 0.04)
          for (let i = 0; i < 60; i++) { // MORE weathering marks (was 40)
            const wx = Math.random() * textureWidth;
            const wy = Math.random() * textureHeight;
            const wsize = Math.random() * 5 + 2; // LARGER weathering marks
            ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)';
            ctx.fillRect(wx, wy, wsize, wsize * 0.3);
          }
          ctx.globalAlpha = 1.0;
        }
        
        console.log(`✅ SUPER DEFINED CORRUGATED ROOF TEXTURE CREATED for ${panelSide} panel - EXTREME RIDGE DEFINITION`);
      }
      
      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(6, length/2.5); // LARGER corrugations (was 8, now 6) for MORE DEFINITION
      
      return texture;
    };

    // 🎯 ALWAYS CREATE SUPER DEFINED CORRUGATED TEXTURES - regardless of skylights
    console.log(`🔥 CREATING SUPER DEFINED CORRUGATED TEXTURES for both roof panels - EXTREME RIDGE DEFINITION`);
    const leftTexture = createEnhancedCorrugatedTexture('left');
    const rightTexture = createEnhancedCorrugatedTexture('right');
    
    // 🎯 ENHANCED MATERIAL PROPERTIES for MAXIMUM ridge definition
    const isWhite = color === '#FFFFFF';
    const isDark = ['#1F2937', '#374151', '#4B5563', '#9CA3AF'].includes(color);
    
    const materialProps = isWhite ? {
      metalness: 0.8, // INCREASED metalness for better reflection (was 0.6)
      roughness: 0.15, // REDUCED roughness for sharper highlights (was 0.3)
      envMapIntensity: 1.8, // INCREASED environment reflection (was 1.2)
    } : isDark ? {
      metalness: 0.95, // MAXIMUM metalness for dark metal roofing (was 0.9)
      roughness: 0.05, // MINIMUM roughness for ultra-sharp highlights (was 0.15)
      envMapIntensity: 2.0, // MAXIMUM environment reflection (was 1.4)
    } : {
      metalness: 0.9, // HIGH metalness for metal roofing (was 0.8)
      roughness: 0.1, // VERY LOW roughness for sharp highlights (was 0.2)
      envMapIntensity: 1.5, // STRONG environment reflection (was 1.0)
    };
    
    // 🎯 ALWAYS CREATE MATERIALS WITH SUPER DEFINED CORRUGATED TEXTURES
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
    
    console.log(`🔥 SUPER DEFINED ROOF MATERIALS CREATED: Both panels have EXTREME RIDGE DEFINITION`);

    // Create roof geometries with skylight cutouts ONLY where needed
    const createRoofGeometryWithCutouts = (isLeftPanel: boolean) => {
      // Filter skylights for this specific panel only
      const panelSkylights = skylights.filter(s => 
        s.panel === (isLeftPanel ? 'left' : 'right')
      );

      console.log(`${isLeftPanel ? 'Left' : 'Right'} panel has ${panelSkylights.length} skylights`);

      if (panelSkylights.length === 0) {
        // 🎯 NO SKYLIGHTS: Use simple box geometry - SUPER DEFINED RIDGES ALWAYS VISIBLE
        console.log(`${isLeftPanel ? 'Left' : 'Right'} panel: Using simple BoxGeometry - SUPER DEFINED RIDGES ALWAYS VISIBLE`);
        const geometry = new THREE.BoxGeometry(panelLength, 0.2, length);
        
        // 🔧 CRITICAL: Apply proper UV mapping for super defined corrugated texture on simple geometry
        const uvAttribute = geometry.attributes.uv;
        const positionAttribute = geometry.attributes.position;
        const uvArray = uvAttribute.array;
        const positionArray = positionAttribute.array;
        
        // Map UVs to show SUPER DEFINED corrugations running along the panel length
        for (let i = 0; i < positionArray.length; i += 3) {
          const x = positionArray[i];
          const y = positionArray[i + 1];
          const z = positionArray[i + 2];
          
          const uvIndex = (i / 3) * 2;
          
          // Calculate UV coordinates for SUPER DEFINED corrugated pattern
          // Corrugations run along the length (Z direction), so use Z for the corrugated axis
          uvArray[uvIndex] = (z + length/2) / length * 6; // U coordinate - LARGER corrugations (was 8, now 6)
          uvArray[uvIndex + 1] = (x + panelLength/2) / panelLength * (length/2.5); // V coordinate - across width
        }
        
        uvAttribute.needsUpdate = true;
        console.log(`${isLeftPanel ? 'Left' : 'Right'} panel: Applied SUPER DEFINED corrugated UV mapping to BoxGeometry - EXTREME RIDGE DEFINITION ALWAYS VISIBLE`);
        return geometry;
      }

      // 🎯 HAS SKYLIGHTS: Use extruded geometry with SELECTIVE cutouts - SUPER DEFINED RIDGES PRESERVED
      console.log(`${isLeftPanel ? 'Left' : 'Right'} panel: Using ExtrudeGeometry with ${panelSkylights.length} skylight cutouts - SUPER DEFINED RIDGES PRESERVED EXCEPT IN CUTOUTS`);
      
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
        console.log(`  ✂️ Added SELECTIVE hole for skylight - SUPER DEFINED ridges preserved everywhere else`);
      });

      const extrudeSettings = {
        steps: 1,
        depth: 0.2,
        bevelEnabled: false
      };

      const geometry = new THREE.ExtrudeGeometry(roofShape, extrudeSettings);
      
      // 🔧 CRITICAL: Apply proper UV mapping to extruded geometry for PRESERVED SUPER DEFINED corrugated texture
      const uvAttribute = geometry.attributes.uv;
      const positionAttribute = geometry.attributes.position;
      const uvArray = uvAttribute.array;
      const positionArray = positionAttribute.array;
      
      console.log(`${isLeftPanel ? 'Left' : 'Right'} panel: Applying SUPER DEFINED corrugated UV mapping to ExtrudeGeometry with selective cutouts`);
      
      // Apply UV mapping that preserves the SUPER DEFINED corrugated pattern EVERYWHERE except in the holes
      for (let i = 0; i < positionArray.length; i += 3) {
        const x = positionArray[i];
        const y = positionArray[i + 1];
        const z = positionArray[i + 2];
        
        const uvIndex = (i / 3) * 2;
        
        // 🎯 PRESERVE SUPER DEFINED RIDGES: Map UV coordinates to show EXTREME corrugations running along the panel length
        // The extruded geometry is in XY plane, so:
        // - X corresponds to the panel length direction (where corrugations run)
        // - Y corresponds to the panel width direction (across corrugations)
        uvArray[uvIndex] = (x + panelLength/2) / panelLength * 6; // U coordinate - LARGER corrugations (was 8, now 6)
        uvArray[uvIndex + 1] = (y + length/2) / length * (length/2.5); // V coordinate - across width
      }
      
      // Rotate the geometry to align with the roof pitch
      // The extruded geometry is created in XY plane, we need to rotate it to XZ plane
      geometry.rotateX(-Math.PI / 2); // Rotate to lie flat in XZ plane
      
      uvAttribute.needsUpdate = true;
      console.log(`${isLeftPanel ? 'Left' : 'Right'} panel: SUPER DEFINED corrugated texture applied to ExtrudeGeometry - EXTREME RIDGE DEFINITION PRESERVED with selective skylight cutouts`);
      return geometry;
    };
    
    // Create geometries with SELECTIVE cutouts and PRESERVED SUPER DEFINED ridges
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
      {/* Left roof panel with SUPER DEFINED CORRUGATED TEXTURE ALWAYS VISIBLE */}
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
      
      {/* Right roof panel with SUPER DEFINED CORRUGATED TEXTURE ALWAYS VISIBLE */}
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
      
      {/* Ridge cap with ENHANCED corrugated texture */}
      <mesh 
        position={[0, roofHeight, 0]} 
        castShadow 
        receiveShadow
      >
        <boxGeometry args={[0.4, 0.3, length]} />
        <meshStandardMaterial 
          color={color} 
          metalness={color === '#FFFFFF' ? 0.7 : 0.95} // INCREASED metalness
          roughness={color === '#FFFFFF' ? 0.2 : 0.05} // REDUCED roughness for sharper definition
          envMapIntensity={color === '#FFFFFF' ? 1.5 : 2.0} // INCREASED environment reflection
        />
      </mesh>
    </group>
  );
};

export default Roof;