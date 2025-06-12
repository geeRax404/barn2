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

  // Create roof materials and geometries with NON-METALLIC appearance
  const { leftRoofGeometry, rightRoofGeometry, leftRoofMaterial, rightRoofMaterial } = useMemo(() => {
    // 🎯 ENHANCED CORRUGATED TEXTURE - Now for PAINTED/COMPOSITE material
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
        
        // 🔧 ENHANCED CORRUGATED PATTERN - More defined with stronger contrast
        const corrugationWidth = textureWidth / 16; // Wider corrugations for better definition
        const corrugationSpacing = corrugationWidth * 1.05; // Tight spacing
        
        // Special handling for different colors
        const isWhite = color === '#FFFFFF';
        const isDark = ['#1F2937', '#374151', '#4B5563', '#9CA3AF'].includes(color);
        const isRed = color === '#9B2226' || color === '#B91C1C';
        const isGreen = color === '#2D6A4F' || color === '#059669';
        
        // 🎯 ENHANCED CONTRAST VALUES - Much stronger definition
        let deepShadowOpacity, lightShadowOpacity, highlightOpacity, brightHighlightOpacity;
        
        if (isWhite) {
          deepShadowOpacity = 0.2;
          lightShadowOpacity = 0.12;
          highlightOpacity = 0.15;
          brightHighlightOpacity = 0.25;
        } else if (isDark) {
          deepShadowOpacity = 0.5;
          lightShadowOpacity = 0.3;
          highlightOpacity = 0.4;
          brightHighlightOpacity = 0.6;
        } else if (isRed || isGreen) {
          deepShadowOpacity = 0.35;
          lightShadowOpacity = 0.2;
          highlightOpacity = 0.25;
          brightHighlightOpacity = 0.4;
        } else {
          deepShadowOpacity = 0.3;
          lightShadowOpacity = 0.18;
          highlightOpacity = 0.2;
          brightHighlightOpacity = 0.35;
        }
        
        // 🎯 ENHANCED CORRUGATED PATTERN - Create more defined metal roofing corrugations
        for (let x = 0; x < textureWidth; x += corrugationSpacing) {
          // Create a more complex corrugation profile with multiple gradients
          
          // 1. Deep valley shadow
          const valleyGradient = ctx.createLinearGradient(x, 0, x + corrugationWidth * 0.2, 0);
          valleyGradient.addColorStop(0, `rgba(0,0,0,${deepShadowOpacity})`);
          valleyGradient.addColorStop(1, `rgba(0,0,0,${lightShadowOpacity})`);
          ctx.fillStyle = valleyGradient;
          ctx.fillRect(x, 0, corrugationWidth * 0.2, textureHeight);
          
          // 2. Rising slope with gradient from shadow to highlight
          const riseGradient = ctx.createLinearGradient(x + corrugationWidth * 0.2, 0, x + corrugationWidth * 0.45, 0);
          riseGradient.addColorStop(0, `rgba(0,0,0,${lightShadowOpacity})`);
          riseGradient.addColorStop(0.3, `rgba(0,0,0,0)`); // Neutral
          riseGradient.addColorStop(0.7, `rgba(255,255,255,${highlightOpacity * 0.4})`);
          riseGradient.addColorStop(1, `rgba(255,255,255,${highlightOpacity})`);
          ctx.fillStyle = riseGradient;
          ctx.fillRect(x + corrugationWidth * 0.2, 0, corrugationWidth * 0.25, textureHeight);
          
          // 3. Peak plateau with bright highlight
          const peakGradient = ctx.createLinearGradient(x + corrugationWidth * 0.45, 0, x + corrugationWidth * 0.55, 0);
          peakGradient.addColorStop(0, `rgba(255,255,255,${highlightOpacity})`);
          peakGradient.addColorStop(0.5, `rgba(255,255,255,${brightHighlightOpacity})`); // Peak highlight
          peakGradient.addColorStop(1, `rgba(255,255,255,${highlightOpacity})`);
          ctx.fillStyle = peakGradient;
          ctx.fillRect(x + corrugationWidth * 0.45, 0, corrugationWidth * 0.1, textureHeight);
          
          // 4. Falling slope back to shadow
          const fallGradient = ctx.createLinearGradient(x + corrugationWidth * 0.55, 0, x + corrugationWidth * 0.8, 0);
          fallGradient.addColorStop(0, `rgba(255,255,255,${highlightOpacity})`);
          fallGradient.addColorStop(0.3, `rgba(255,255,255,${highlightOpacity * 0.4})`);
          fallGradient.addColorStop(0.7, `rgba(0,0,0,0)`); // Neutral
          fallGradient.addColorStop(1, `rgba(0,0,0,${lightShadowOpacity})`);
          ctx.fillStyle = fallGradient;
          ctx.fillRect(x + corrugationWidth * 0.55, 0, corrugationWidth * 0.25, textureHeight);
          
          // 5. Final valley approach
          const finalGradient = ctx.createLinearGradient(x + corrugationWidth * 0.8, 0, x + corrugationWidth, 0);
          finalGradient.addColorStop(0, `rgba(0,0,0,${lightShadowOpacity})`);
          finalGradient.addColorStop(1, `rgba(0,0,0,${deepShadowOpacity})`);
          ctx.fillStyle = finalGradient;
          ctx.fillRect(x + corrugationWidth * 0.8, 0, corrugationWidth * 0.2, textureHeight);
          
          // 6. Add sharp definition lines for more realism
          if (corrugationWidth > 20) { // Only for larger corrugations
            // Thin bright line at the very peak
            ctx.fillStyle = `rgba(255,255,255,${brightHighlightOpacity * 1.3})`;
            ctx.fillRect(x + corrugationWidth * 0.49, 0, 2, textureHeight);
            
            // Thin shadow line in the valley
            ctx.fillStyle = `rgba(0,0,0,${deepShadowOpacity * 1.2})`;
            ctx.fillRect(x + corrugationWidth * 0.05, 0, 1, textureHeight);
            ctx.fillRect(x + corrugationWidth * 0.95, 0, 1, textureHeight);
          }
        }
        
        // Add horizontal panel seams every 8 feet equivalent
        const seamSpacing = textureHeight / 4;
        ctx.strokeStyle = `rgba(0,0,0,${lightShadowOpacity * 0.8})`;
        ctx.lineWidth = 2;
        for (let y = seamSpacing; y < textureHeight; y += seamSpacing) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(textureWidth, y);
          ctx.stroke();
          
          // Add slight highlight above seam
          ctx.strokeStyle = `rgba(255,255,255,${highlightOpacity * 0.3})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(0, y - 1);
          ctx.lineTo(textureWidth, y - 1);
          ctx.stroke();
          ctx.strokeStyle = `rgba(0,0,0,${lightShadowOpacity * 0.8})`;
          ctx.lineWidth = 2;
        }
        
        // 🎯 ADD SUBTLE WEATHERING PATTERN for more realism
        if (!isWhite) {
          // Add very subtle random weathering marks
          ctx.globalAlpha = 0.04;
          for (let i = 0; i < 40; i++) {
            const wx = Math.random() * textureWidth;
            const wy = Math.random() * textureHeight;
            const wsize = Math.random() * 3 + 1;
            ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)';
            ctx.fillRect(wx, wy, wsize, wsize * 0.4);
          }
          ctx.globalAlpha = 1.0;
        }
        
        console.log(`✅ ENHANCED CORRUGATED TEXTURE CREATED for ${panelSide} panel - HIGHLY DEFINED corrugations`);
      }
      
      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(8, length/3); // More corrugations across, panels along length
      
      return texture;
    };

    // 🎯 ALWAYS CREATE ENHANCED CORRUGATED TEXTURES - regardless of skylights
    console.log(`🎯 CREATING NON-METALLIC CORRUGATED TEXTURES for both roof panels - PAINTED/COMPOSITE MATERIAL`);
    const leftTexture = createEnhancedCorrugatedTexture('left');
    const rightTexture = createEnhancedCorrugatedTexture('right');
    
    // 🎯 NON-METALLIC MATERIAL PROPERTIES - Like painted steel or composite
    const isWhite = color === '#FFFFFF';
    const isDark = ['#1F2937', '#374151', '#4B5563', '#9CA3AF'].includes(color);
    
    const materialProps = isWhite ? {
      metalness: 0.05, // VERY LOW metalness - painted surface
      roughness: 0.9, // VERY HIGH roughness - matte finish
      envMapIntensity: 0.1, // MINIMAL environment reflection
    } : isDark ? {
      metalness: 0.08, // VERY LOW metalness - painted dark surface
      roughness: 0.85, // HIGH roughness - matte finish
      envMapIntensity: 0.15, // MINIMAL environment reflection
    } : {
      metalness: 0.06, // VERY LOW metalness - painted colored surface
      roughness: 0.88, // VERY HIGH roughness - matte finish
      envMapIntensity: 0.12, // MINIMAL environment reflection
    };
    
    // 🎯 ALWAYS CREATE MATERIALS WITH NON-METALLIC PROPERTIES
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
    
    console.log(`🎯 NON-METALLIC ROOF MATERIALS CREATED: Both panels have PAINTED/COMPOSITE FINISH`);

    // Create roof geometries with skylight cutouts ONLY where needed
    const createRoofGeometryWithCutouts = (isLeftPanel: boolean) => {
      // Filter skylights for this specific panel only
      const panelSkylights = skylights.filter(s => 
        s.panel === (isLeftPanel ? 'left' : 'right')
      );

      console.log(`${isLeftPanel ? 'Left' : 'Right'} panel has ${panelSkylights.length} skylights`);

      if (panelSkylights.length === 0) {
        // 🎯 NO SKYLIGHTS: Use simple box geometry - ENHANCED CORRUGATIONS ALWAYS VISIBLE
        console.log(`${isLeftPanel ? 'Left' : 'Right'} panel: Using simple BoxGeometry - ENHANCED CORRUGATIONS ALWAYS VISIBLE`);
        const geometry = new THREE.BoxGeometry(panelLength, 0.2, length);
        
        // 🔧 CRITICAL: Apply proper UV mapping for enhanced corrugated texture on simple geometry
        const uvAttribute = geometry.attributes.uv;
        const positionAttribute = geometry.attributes.position;
        const uvArray = uvAttribute.array;
        const positionArray = positionAttribute.array;
        
        // Map UVs to show enhanced corrugations running along the panel length
        for (let i = 0; i < positionArray.length; i += 3) {
          const x = positionArray[i];
          const y = positionArray[i + 1];
          const z = positionArray[i + 2];
          
          const uvIndex = (i / 3) * 2;
          
          // Calculate UV coordinates for enhanced corrugated pattern
          // Corrugations run along the length (Z direction), so use Z for the corrugated axis
          uvArray[uvIndex] = (z + length/2) / length * 8; // U coordinate - more corrugations along length
          uvArray[uvIndex + 1] = (x + panelLength/2) / panelLength * (length/3); // V coordinate - across width
        }
        
        uvAttribute.needsUpdate = true;
        console.log(`${isLeftPanel ? 'Left' : 'Right'} panel: Applied enhanced corrugated UV mapping to BoxGeometry - ENHANCED CORRUGATIONS ALWAYS VISIBLE`);
        return geometry;
      }

      // 🎯 HAS SKYLIGHTS: Use extruded geometry with SELECTIVE cutouts - ENHANCED CORRUGATIONS PRESERVED
      console.log(`${isLeftPanel ? 'Left' : 'Right'} panel: Using ExtrudeGeometry with ${panelSkylights.length} skylight cutouts - ENHANCED CORRUGATIONS PRESERVED EXCEPT IN CUTOUTS`);
      
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
        console.log(`  ✂️ Added SELECTIVE hole for skylight - enhanced corrugations preserved everywhere else`);
      });

      const extrudeSettings = {
        steps: 1,
        depth: 0.2,
        bevelEnabled: false
      };

      const geometry = new THREE.ExtrudeGeometry(roofShape, extrudeSettings);
      
      // 🔧 CRITICAL: Apply proper UV mapping to extruded geometry for PRESERVED enhanced corrugated texture
      const uvAttribute = geometry.attributes.uv;
      const positionAttribute = geometry.attributes.position;
      const uvArray = uvAttribute.array;
      const positionArray = positionAttribute.array;
      
      console.log(`${isLeftPanel ? 'Left' : 'Right'} panel: Applying enhanced corrugated UV mapping to ExtrudeGeometry with selective cutouts`);
      
      // Apply UV mapping that preserves the enhanced corrugated pattern EVERYWHERE except in the holes
      for (let i = 0; i < positionArray.length; i += 3) {
        const x = positionArray[i];
        const y = positionArray[i + 1];
        const z = positionArray[i + 2];
        
        const uvIndex = (i / 3) * 2;
        
        // 🎯 PRESERVE ENHANCED CORRUGATIONS: Map UV coordinates to show enhanced corrugations running along the panel length
        // The extruded geometry is in XY plane, so:
        // - X corresponds to the panel length direction (where corrugations run)
        // - Y corresponds to the panel width direction (across corrugations)
        uvArray[uvIndex] = (x + panelLength/2) / panelLength * 8; // U coordinate - more enhanced corrugations along length
        uvArray[uvIndex + 1] = (y + length/2) / length * (length/3); // V coordinate - across width
      }
      
      // Rotate the geometry to align with the roof pitch
      // The extruded geometry is created in XY plane, we need to rotate it to XZ plane
      geometry.rotateX(-Math.PI / 2); // Rotate to lie flat in XZ plane
      
      uvAttribute.needsUpdate = true;
      console.log(`${isLeftPanel ? 'Left' : 'Right'} panel: Enhanced corrugated texture applied to ExtrudeGeometry - ENHANCED CORRUGATIONS PRESERVED with selective skylight cutouts`);
      return geometry;
    };
    
    // Create geometries with SELECTIVE cutouts and PRESERVED enhanced corrugations
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
      {/* Left roof panel with NON-METALLIC FINISH */}
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
      
      {/* Right roof panel with NON-METALLIC FINISH */}
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
      
      {/* Ridge cap with NON-METALLIC FINISH */}
      <mesh 
        position={[0, roofHeight, 0]} 
        castShadow 
        receiveShadow
      >
        <boxGeometry args={[0.4, 0.3, length]} />
        <meshStandardMaterial 
          color={color} 
          metalness={0.05} // VERY LOW metalness - painted finish
          roughness={0.9} // VERY HIGH roughness - matte finish
          envMapIntensity={0.1} // MINIMAL environment reflection
        />
      </mesh>
    </group>
  );
};

export default Roof;