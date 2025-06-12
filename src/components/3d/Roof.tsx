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

  // Create roof materials and geometries with MATTE, NON-REFLECTIVE finish
  const { leftRoofGeometry, rightRoofGeometry, leftRoofMaterial, rightRoofMaterial } = useMemo(() => {
    // 🎯 MATTE CORRUGATED METAL TEXTURE - NO SHINE/REFLECTION
    const createMatteCorrugatedTexture = (panelSide: 'left' | 'right') => {
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
        
        // 🔧 MATTE CORRUGATED PATTERN - Reduced contrast for matte appearance
        const corrugationWidth = textureWidth / 16; // Wider corrugations for better definition
        const corrugationSpacing = corrugationWidth * 1.05; // Tight spacing
        
        // Special handling for different colors with MATTE finish
        const isWhite = color === '#FFFFFF';
        const isDark = ['#1F2937', '#374151', '#4B5563', '#9CA3AF'].includes(color);
        const isRed = color === '#9B2226' || color === '#B91C1C';
        const isGreen = color === '#2D6A4F' || color === '#059669';
        
        // 🎯 MATTE CONTRAST VALUES - Much more subtle for non-reflective appearance
        let deepShadowOpacity, lightShadowOpacity, highlightOpacity, brightHighlightOpacity;
        
        if (isWhite) {
          deepShadowOpacity = 0.08;  // Reduced from 0.2
          lightShadowOpacity = 0.05; // Reduced from 0.12
          highlightOpacity = 0.06;   // Reduced from 0.15
          brightHighlightOpacity = 0.1; // Reduced from 0.25
        } else if (isDark) {
          deepShadowOpacity = 0.15;  // Reduced from 0.5
          lightShadowOpacity = 0.1;  // Reduced from 0.3
          highlightOpacity = 0.12;   // Reduced from 0.4
          brightHighlightOpacity = 0.18; // Reduced from 0.6
        } else if (isRed || isGreen) {
          deepShadowOpacity = 0.12;  // Reduced from 0.35
          lightShadowOpacity = 0.08; // Reduced from 0.2
          highlightOpacity = 0.1;    // Reduced from 0.25
          brightHighlightOpacity = 0.15; // Reduced from 0.4
        } else {
          deepShadowOpacity = 0.1;   // Reduced from 0.3
          lightShadowOpacity = 0.06; // Reduced from 0.18
          highlightOpacity = 0.08;   // Reduced from 0.2
          brightHighlightOpacity = 0.12; // Reduced from 0.35
        }
        
        // 🎯 MATTE CORRUGATED PATTERN - Subtle definition without shine
        for (let x = 0; x < textureWidth; x += corrugationSpacing) {
          // Create a more subtle corrugation profile for matte appearance
          
          // 1. Subtle valley shadow
          const valleyGradient = ctx.createLinearGradient(x, 0, x + corrugationWidth * 0.2, 0);
          valleyGradient.addColorStop(0, `rgba(0,0,0,${deepShadowOpacity})`);
          valleyGradient.addColorStop(1, `rgba(0,0,0,${lightShadowOpacity})`);
          ctx.fillStyle = valleyGradient;
          ctx.fillRect(x, 0, corrugationWidth * 0.2, textureHeight);
          
          // 2. Gentle rising slope
          const riseGradient = ctx.createLinearGradient(x + corrugationWidth * 0.2, 0, x + corrugationWidth * 0.45, 0);
          riseGradient.addColorStop(0, `rgba(0,0,0,${lightShadowOpacity})`);
          riseGradient.addColorStop(0.3, `rgba(0,0,0,0)`); // Neutral
          riseGradient.addColorStop(0.7, `rgba(255,255,255,${highlightOpacity * 0.3})`);
          riseGradient.addColorStop(1, `rgba(255,255,255,${highlightOpacity * 0.6})`);
          ctx.fillStyle = riseGradient;
          ctx.fillRect(x + corrugationWidth * 0.2, 0, corrugationWidth * 0.25, textureHeight);
          
          // 3. Subtle peak with minimal highlight
          const peakGradient = ctx.createLinearGradient(x + corrugationWidth * 0.45, 0, x + corrugationWidth * 0.55, 0);
          peakGradient.addColorStop(0, `rgba(255,255,255,${highlightOpacity * 0.6})`);
          peakGradient.addColorStop(0.5, `rgba(255,255,255,${brightHighlightOpacity * 0.7})`); // Subtle peak
          peakGradient.addColorStop(1, `rgba(255,255,255,${highlightOpacity * 0.6})`);
          ctx.fillStyle = peakGradient;
          ctx.fillRect(x + corrugationWidth * 0.45, 0, corrugationWidth * 0.1, textureHeight);
          
          // 4. Gentle falling slope
          const fallGradient = ctx.createLinearGradient(x + corrugationWidth * 0.55, 0, x + corrugationWidth * 0.8, 0);
          fallGradient.addColorStop(0, `rgba(255,255,255,${highlightOpacity * 0.6})`);
          fallGradient.addColorStop(0.3, `rgba(255,255,255,${highlightOpacity * 0.3})`);
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
          
          // 6. Very subtle definition lines for matte finish
          if (corrugationWidth > 20) { // Only for larger corrugations
            // Very thin, subtle line at the peak
            ctx.fillStyle = `rgba(255,255,255,${brightHighlightOpacity * 0.8})`;
            ctx.fillRect(x + corrugationWidth * 0.49, 0, 1, textureHeight);
            
            // Very thin shadow line in the valley
            ctx.fillStyle = `rgba(0,0,0,${deepShadowOpacity * 0.8})`;
            ctx.fillRect(x + corrugationWidth * 0.05, 0, 1, textureHeight);
            ctx.fillRect(x + corrugationWidth * 0.95, 0, 1, textureHeight);
          }
        }
        
        // Add subtle horizontal panel seams
        const seamSpacing = textureHeight / 4;
        ctx.strokeStyle = `rgba(0,0,0,${lightShadowOpacity * 0.6})`;
        ctx.lineWidth = 1;
        for (let y = seamSpacing; y < textureHeight; y += seamSpacing) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(textureWidth, y);
          ctx.stroke();
          
          // Add very subtle highlight above seam
          ctx.strokeStyle = `rgba(255,255,255,${highlightOpacity * 0.2})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(0, y - 1);
          ctx.lineTo(textureWidth, y - 1);
          ctx.stroke();
          ctx.strokeStyle = `rgba(0,0,0,${lightShadowOpacity * 0.6})`;
          ctx.lineWidth = 1;
        }
        
        // 🎯 ADD VERY SUBTLE WEATHERING for matte realism
        if (!isWhite) {
          // Add very subtle random weathering marks
          ctx.globalAlpha = 0.02; // Very subtle
          for (let i = 0; i < 30; i++) {
            const wx = Math.random() * textureWidth;
            const wy = Math.random() * textureHeight;
            const wsize = Math.random() * 2 + 1;
            ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)';
            ctx.fillRect(wx, wy, wsize, wsize * 0.4);
          }
          ctx.globalAlpha = 1.0;
        }
        
        console.log(`✅ MATTE CORRUGATED TEXTURE CREATED for ${panelSide} panel - NO SHINE/REFLECTION`);
      }
      
      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(8, length/3); // More corrugations across, panels along length
      
      return texture;
    };

    // 🎯 ALWAYS CREATE MATTE CORRUGATED TEXTURES - NO REFLECTIVE FINISH
    console.log(`🎯 CREATING MATTE CORRUGATED TEXTURES for both roof panels - NO SHINE`);
    const leftTexture = createMatteCorrugatedTexture('left');
    const rightTexture = createMatteCorrugatedTexture('right');
    
    // 🎯 MATTE MATERIAL PROPERTIES - NO METALNESS, HIGH ROUGHNESS
    const isWhite = color === '#FFFFFF';
    const isDark = ['#1F2937', '#374151', '#4B5563', '#9CA3AF'].includes(color);
    
    const materialProps = isWhite ? {
      metalness: 0.0,    // NO METALNESS for matte finish
      roughness: 0.95,   // VERY HIGH ROUGHNESS for no reflection
      envMapIntensity: 0.1, // MINIMAL environment reflection
    } : isDark ? {
      metalness: 0.05,   // MINIMAL metalness
      roughness: 0.9,    // HIGH roughness for matte finish
      envMapIntensity: 0.15, // MINIMAL environment reflection
    } : {
      metalness: 0.02,   // ALMOST NO metalness
      roughness: 0.92,   // VERY HIGH roughness for matte finish
      envMapIntensity: 0.12, // MINIMAL environment reflection
    };
    
    // 🎯 ALWAYS CREATE MATERIALS WITH MATTE CORRUGATED TEXTURES
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
    
    console.log(`🎯 MATTE ROOF MATERIALS CREATED: Both panels have NO SHINE/REFLECTION`);

    // Create roof geometries with skylight cutouts ONLY where needed
    const createRoofGeometryWithCutouts = (isLeftPanel: boolean) => {
      // Filter skylights for this specific panel only
      const panelSkylights = skylights.filter(s => 
        s.panel === (isLeftPanel ? 'left' : 'right')
      );

      console.log(`${isLeftPanel ? 'Left' : 'Right'} panel has ${panelSkylights.length} skylights`);

      if (panelSkylights.length === 0) {
        // 🎯 NO SKYLIGHTS: Use simple box geometry - MATTE CORRUGATIONS ALWAYS VISIBLE
        console.log(`${isLeftPanel ? 'Left' : 'Right'} panel: Using simple BoxGeometry - MATTE CORRUGATIONS ALWAYS VISIBLE`);
        const geometry = new THREE.BoxGeometry(panelLength, 0.2, length);
        
        // 🔧 CRITICAL: Apply proper UV mapping for matte corrugated texture on simple geometry
        const uvAttribute = geometry.attributes.uv;
        const positionAttribute = geometry.attributes.position;
        const uvArray = uvAttribute.array;
        const positionArray = positionAttribute.array;
        
        // Map UVs to show matte corrugations running along the panel length
        for (let i = 0; i < positionArray.length; i += 3) {
          const x = positionArray[i];
          const y = positionArray[i + 1];
          const z = positionArray[i + 2];
          
          const uvIndex = (i / 3) * 2;
          
          // Calculate UV coordinates for matte corrugated pattern
          // Corrugations run along the length (Z direction), so use Z for the corrugated axis
          uvArray[uvIndex] = (z + length/2) / length * 8; // U coordinate - more corrugations along length
          uvArray[uvIndex + 1] = (x + panelLength/2) / panelLength * (length/3); // V coordinate - across width
        }
        
        uvAttribute.needsUpdate = true;
        console.log(`${isLeftPanel ? 'Left' : 'Right'} panel: Applied matte corrugated UV mapping to BoxGeometry - MATTE CORRUGATIONS ALWAYS VISIBLE`);
        return geometry;
      }

      // 🎯 HAS SKYLIGHTS: Use extruded geometry with SELECTIVE cutouts - MATTE CORRUGATIONS PRESERVED
      console.log(`${isLeftPanel ? 'Left' : 'Right'} panel: Using ExtrudeGeometry with ${panelSkylights.length} skylight cutouts - MATTE CORRUGATIONS PRESERVED EXCEPT IN CUTOUTS`);
      
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
        console.log(`  ✂️ Added SELECTIVE hole for skylight - matte corrugations preserved everywhere else`);
      });

      const extrudeSettings = {
        steps: 1,
        depth: 0.2,
        bevelEnabled: false
      };

      const geometry = new THREE.ExtrudeGeometry(roofShape, extrudeSettings);
      
      // 🔧 CRITICAL: Apply proper UV mapping to extruded geometry for PRESERVED matte corrugated texture
      const uvAttribute = geometry.attributes.uv;
      const positionAttribute = geometry.attributes.position;
      const uvArray = uvAttribute.array;
      const positionArray = positionAttribute.array;
      
      console.log(`${isLeftPanel ? 'Left' : 'Right'} panel: Applying matte corrugated UV mapping to ExtrudeGeometry with selective cutouts`);
      
      // Apply UV mapping that preserves the matte corrugated pattern EVERYWHERE except in the holes
      for (let i = 0; i < positionArray.length; i += 3) {
        const x = positionArray[i];
        const y = positionArray[i + 1];
        const z = positionArray[i + 2];
        
        const uvIndex = (i / 3) * 2;
        
        // 🎯 PRESERVE MATTE CORRUGATIONS: Map UV coordinates to show matte corrugations running along the panel length
        // The extruded geometry is in XY plane, so:
        // - X corresponds to the panel length direction (where corrugations run)
        // - Y corresponds to the panel width direction (across corrugations)
        uvArray[uvIndex] = (x + panelLength/2) / panelLength * 8; // U coordinate - more matte corrugations along length
        uvArray[uvIndex + 1] = (y + length/2) / length * (length/3); // V coordinate - across width
      }
      
      // Rotate the geometry to align with the roof pitch
      // The extruded geometry is created in XY plane, we need to rotate it to XZ plane
      geometry.rotateX(-Math.PI / 2); // Rotate to lie flat in XZ plane
      
      uvAttribute.needsUpdate = true;
      console.log(`${isLeftPanel ? 'Left' : 'Right'} panel: Matte corrugated texture applied to ExtrudeGeometry - MATTE CORRUGATIONS PRESERVED with selective skylight cutouts`);
      return geometry;
    };
    
    // Create geometries with SELECTIVE cutouts and PRESERVED matte corrugations
    const leftGeometry = createRoofGeometryWithCutouts(true);
    const rightGeometry = createRoofGeometryWithCutouts(false);
    
    return { 
      leftRoofGeometry: leftGeometry,
      rightRoofGeometry: rightGeometry,
      leftRoofMaterial: leftMaterial, 
      rightRoofMaterial: rightMaterial 
    };
  }, [color, length, width, panelLength, skylights]);

  // 🎯 CREATE PHYSICAL RIBS - 3D raised elements on the roof
  const createRoofRibs = (isLeftPanel: boolean) => {
    const ribs = [];
    const ribSpacing = 2; // 2 feet between ribs
    const ribWidth = 0.08; // 1 inch wide ribs
    const ribHeight = 0.04; // 0.5 inch tall ribs
    const numRibs = Math.floor(length / ribSpacing);
    
    console.log(`🏗️ Creating ${numRibs} physical ribs for ${isLeftPanel ? 'left' : 'right'} panel`);
    
    // Rib material - same color as roof but slightly darker for definition
    const ribMaterial = new THREE.MeshStandardMaterial({
      color: color,
      metalness: 0.02,
      roughness: 0.92,
      envMapIntensity: 0.12,
      side: THREE.DoubleSide,
    });
    
    for (let i = 0; i < numRibs; i++) {
      const ribZ = -length/2 + (i + 1) * ribSpacing;
      
      // Skip ribs where skylights are positioned
      const hasSkylightHere = skylights.some(skylight => {
        if (skylight.panel !== (isLeftPanel ? 'left' : 'right')) return false;
        const skylightFront = skylight.yOffset - skylight.length/2;
        const skylightBack = skylight.yOffset + skylight.length/2;
        return ribZ >= skylightFront && ribZ <= skylightBack;
      });
      
      if (!hasSkylightHere) {
        ribs.push(
          <mesh
            key={`rib-${i}`}
            position={[0, ribHeight/2, ribZ]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[panelLength - 0.1, ribHeight, ribWidth]} />
            <primitive object={ribMaterial} attach="material" />
          </mesh>
        );
      }
    }
    
    return ribs;
  };

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
      {/* Left roof panel with MATTE CORRUGATED TEXTURE - NO SHINE */}
      <group 
        position={[-width / 4, roofHeight / 2, 0]}
        rotation={[0, 0, pitchAngle]}
      >
        <mesh castShadow receiveShadow>
          <primitive object={leftRoofGeometry} />
          <primitive object={leftRoofMaterial} attach="material" />
        </mesh>
        
        {/* 🎯 PHYSICAL RIBS for left panel */}
        {createRoofRibs(true)}
        
        {/* Skylights positioned in the cutouts for left panel */}
        {skylights
          .filter(s => s.panel === 'left')
          .map(s => createSkylight(s, true))
          .filter(Boolean) // Remove null skylights
        }
      </group>
      
      {/* Right roof panel with MATTE CORRUGATED TEXTURE - NO SHINE */}
      <group
        position={[width / 4, roofHeight / 2, 0]}
        rotation={[0, 0, -pitchAngle]}
      >
        <mesh castShadow receiveShadow>
          <primitive object={rightRoofGeometry} />
          <primitive object={rightRoofMaterial} attach="material" />
        </mesh>
        
        {/* 🎯 PHYSICAL RIBS for right panel */}
        {createRoofRibs(false)}
        
        {/* Skylights positioned in the cutouts for right panel */}
        {skylights
          .filter(s => s.panel === 'right')
          .map(s => createSkylight(s, false))
          .filter(Boolean) // Remove null skylights
        }
      </group>
      
      {/* Ridge cap with matte finish */}
      <mesh 
        position={[0, roofHeight, 0]} 
        castShadow 
        receiveShadow
      >
        <boxGeometry args={[0.4, 0.3, length]} />
        <meshStandardMaterial 
          color={color} 
          metalness={0.0}     // NO METALNESS for matte finish
          roughness={0.95}    // VERY HIGH ROUGHNESS for no reflection
          envMapIntensity={0.1} // MINIMAL environment reflection
        />
      </mesh>
    </group>
  );
};

export default Roof;