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

  // Create roof materials and geometries with VISIBLE corrugated ridges and MATTE finish
  const { leftRoofGeometry, rightRoofGeometry, leftRoofMaterial, rightRoofMaterial } = useMemo(() => {
    // 🎯 VISIBLE CORRUGATED METAL TEXTURE - MATTE FINISH WITH CLEAR RIDGES
    const createVisibleCorrugatedTexture = (panelSide: 'left' | 'right') => {
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
        
        // 🎯 CLEARLY VISIBLE CORRUGATIONS - MODERATE SIZE FOR VISIBILITY
        const corrugationWidth = textureWidth / 8; // Moderate size for clear visibility
        const corrugationSpacing = corrugationWidth * 1.02;
        
        // Special handling for different colors
        const isWhite = color === '#FFFFFF';
        const isDark = ['#1F2937', '#374151', '#4B5563', '#9CA3AF'].includes(color);
        const isRed = color === '#9B2226' || color === '#B91C1C';
        const isGreen = color === '#2D6A4F' || color === '#059669';
        
        // 🎯 BALANCED CONTRAST VALUES - VISIBLE BUT NOT OVERPOWERING
        let deepShadowOpacity, lightShadowOpacity, highlightOpacity, brightHighlightOpacity;
        
        if (isWhite) {
          deepShadowOpacity = 0.25;
          lightShadowOpacity = 0.15;
          highlightOpacity = 0.1;
          brightHighlightOpacity = 0.15;
        } else if (isDark) {
          deepShadowOpacity = 0.4;
          lightShadowOpacity = 0.25;
          highlightOpacity = 0.3;
          brightHighlightOpacity = 0.4;
        } else if (isRed || isGreen) {
          deepShadowOpacity = 0.3;
          lightShadowOpacity = 0.2;
          highlightOpacity = 0.2;
          brightHighlightOpacity = 0.25;
        } else {
          deepShadowOpacity = 0.35;
          lightShadowOpacity = 0.22;
          highlightOpacity = 0.18;
          brightHighlightOpacity = 0.25;
        }
        
        console.log(`🎯 CREATING VISIBLE CORRUGATED RIDGES: ${corrugationWidth}px wide, balanced contrast`);
        
        // 🎯 CLEARLY VISIBLE CORRUGATED PATTERN - Create realistic metal roofing ridges
        for (let x = 0; x < textureWidth; x += corrugationSpacing) {
          // 1. Valley shadow - clear but not too dark
          const valleyGradient = ctx.createLinearGradient(x, 0, x + corrugationWidth * 0.15, 0);
          valleyGradient.addColorStop(0, `rgba(0,0,0,${deepShadowOpacity})`);
          valleyGradient.addColorStop(1, `rgba(0,0,0,${lightShadowOpacity})`);
          ctx.fillStyle = valleyGradient;
          ctx.fillRect(x, 0, corrugationWidth * 0.15, textureHeight);
          
          // 2. Rising slope with gradual transition
          const riseGradient = ctx.createLinearGradient(x + corrugationWidth * 0.15, 0, x + corrugationWidth * 0.4, 0);
          riseGradient.addColorStop(0, `rgba(0,0,0,${lightShadowOpacity})`);
          riseGradient.addColorStop(0.5, `rgba(0,0,0,0)`);
          riseGradient.addColorStop(1, `rgba(255,255,255,${highlightOpacity * 0.5})`);
          ctx.fillStyle = riseGradient;
          ctx.fillRect(x + corrugationWidth * 0.15, 0, corrugationWidth * 0.25, textureHeight);
          
          // 3. Peak highlight - visible but not blinding
          const peakGradient = ctx.createLinearGradient(x + corrugationWidth * 0.4, 0, x + corrugationWidth * 0.6, 0);
          peakGradient.addColorStop(0, `rgba(255,255,255,${highlightOpacity * 0.5})`);
          peakGradient.addColorStop(0.5, `rgba(255,255,255,${brightHighlightOpacity})`);
          peakGradient.addColorStop(1, `rgba(255,255,255,${highlightOpacity * 0.5})`);
          ctx.fillStyle = peakGradient;
          ctx.fillRect(x + corrugationWidth * 0.4, 0, corrugationWidth * 0.2, textureHeight);
          
          // 4. Falling slope back to shadow
          const fallGradient = ctx.createLinearGradient(x + corrugationWidth * 0.6, 0, x + corrugationWidth * 0.85, 0);
          fallGradient.addColorStop(0, `rgba(255,255,255,${highlightOpacity * 0.5})`);
          fallGradient.addColorStop(0.5, `rgba(0,0,0,0)`);
          fallGradient.addColorStop(1, `rgba(0,0,0,${lightShadowOpacity})`);
          ctx.fillStyle = fallGradient;
          ctx.fillRect(x + corrugationWidth * 0.6, 0, corrugationWidth * 0.25, textureHeight);
          
          // 5. Final valley approach
          const finalGradient = ctx.createLinearGradient(x + corrugationWidth * 0.85, 0, x + corrugationWidth, 0);
          finalGradient.addColorStop(0, `rgba(0,0,0,${lightShadowOpacity})`);
          finalGradient.addColorStop(1, `rgba(0,0,0,${deepShadowOpacity})`);
          ctx.fillStyle = finalGradient;
          ctx.fillRect(x + corrugationWidth * 0.85, 0, corrugationWidth * 0.15, textureHeight);
          
          // 6. Clear definition lines for ridge visibility
          if (corrugationWidth > 15) {
            // Clear highlight line at peak
            ctx.fillStyle = `rgba(255,255,255,${brightHighlightOpacity * 1.2})`;
            ctx.fillRect(x + corrugationWidth * 0.49, 0, 3, textureHeight);
            
            // Clear shadow lines in valleys
            ctx.fillStyle = `rgba(0,0,0,${deepShadowOpacity * 1.1})`;
            ctx.fillRect(x + corrugationWidth * 0.05, 0, 2, textureHeight);
            ctx.fillRect(x + corrugationWidth * 0.95, 0, 2, textureHeight);
          }
        }
        
        // Add horizontal panel seams
        const seamSpacing = textureHeight / 3;
        ctx.strokeStyle = `rgba(0,0,0,${lightShadowOpacity * 0.8})`;
        ctx.lineWidth = 2;
        for (let y = seamSpacing; y < textureHeight; y += seamSpacing) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(textureWidth, y);
          ctx.stroke();
          
          // Add slight highlight above seam
          ctx.strokeStyle = `rgba(255,255,255,${highlightOpacity * 0.4})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(0, y - 1);
          ctx.lineTo(textureWidth, y - 1);
          ctx.stroke();
          ctx.strokeStyle = `rgba(0,0,0,${lightShadowOpacity * 0.8})`;
          ctx.lineWidth = 2;
        }
        
        // Add subtle weathering for realism
        if (!isWhite) {
          ctx.globalAlpha = 0.05;
          for (let i = 0; i < 25; i++) {
            const wx = Math.random() * textureWidth;
            const wy = Math.random() * textureHeight;
            const wsize = Math.random() * 3 + 1;
            ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)';
            ctx.fillRect(wx, wy, wsize, wsize * 0.3);
          }
          ctx.globalAlpha = 1.0;
        }
        
        console.log(`✅ VISIBLE CORRUGATED TEXTURE CREATED for ${panelSide} panel - CLEAR RIDGES`);
      }
      
      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(6, length/3); // Good balance for ridge visibility
      
      return texture;
    };

    // 🎯 CREATE VISIBLE CORRUGATED TEXTURES
    console.log(`🎯 CREATING VISIBLE CORRUGATED TEXTURES for both roof panels - CLEAR RIDGES`);
    const leftTexture = createVisibleCorrugatedTexture('left');
    const rightTexture = createVisibleCorrugatedTexture('right');
    
    // 🎯 REALISTIC MATERIAL PROPERTIES - MATTE METAL FINISH
    const isWhite = color === '#FFFFFF';
    const isDark = ['#1F2937', '#374151', '#4B5563', '#9CA3AF'].includes(color);
    
    const materialProps = isWhite ? {
      metalness: 0.3,  // LOW metalness for matte finish
      roughness: 0.7,  // HIGH roughness to reduce shine
      envMapIntensity: 0.4, // LOW environment reflection
    } : isDark ? {
      metalness: 0.4,  // MODERATE metalness
      roughness: 0.6,  // HIGH roughness for matte finish
      envMapIntensity: 0.5, // MODERATE environment reflection
    } : {
      metalness: 0.35, // LOW-MODERATE metalness
      roughness: 0.65, // HIGH roughness for matte finish
      envMapIntensity: 0.45, // LOW-MODERATE environment reflection
    };
    
    // 🎯 CREATE MATERIALS WITH MATTE FINISH AND VISIBLE RIDGES
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
    
    console.log(`🎯 MATTE ROOF MATERIALS CREATED: Both panels have VISIBLE RIDGES and REALISTIC FINISH`);

    // Create roof geometries with skylight cutouts ONLY where needed
    const createRoofGeometryWithCutouts = (isLeftPanel: boolean) => {
      // Filter skylights for this specific panel only
      const panelSkylights = skylights.filter(s => 
        s.panel === (isLeftPanel ? 'left' : 'right')
      );

      console.log(`${isLeftPanel ? 'Left' : 'Right'} panel has ${panelSkylights.length} skylights`);

      if (panelSkylights.length === 0) {
        // 🎯 NO SKYLIGHTS: Use simple box geometry - VISIBLE RIDGES
        console.log(`${isLeftPanel ? 'Left' : 'Right'} panel: Using simple BoxGeometry - VISIBLE RIDGES`);
        const geometry = new THREE.BoxGeometry(panelLength, 0.2, length);
        
        // 🔧 Apply proper UV mapping for visible corrugated texture
        const uvAttribute = geometry.attributes.uv;
        const positionAttribute = geometry.attributes.position;
        const uvArray = uvAttribute.array;
        const positionArray = positionAttribute.array;
        
        // Map UVs to show visible corrugations running along the panel length
        for (let i = 0; i < positionArray.length; i += 3) {
          const x = positionArray[i];
          const y = positionArray[i + 1];
          const z = positionArray[i + 2];
          
          const uvIndex = (i / 3) * 2;
          
          // Calculate UV coordinates for visible corrugated pattern
          uvArray[uvIndex] = (z + length/2) / length * 6; // U coordinate - good corrugation visibility
          uvArray[uvIndex + 1] = (x + panelLength/2) / panelLength * (length/3); // V coordinate - across width
        }
        
        uvAttribute.needsUpdate = true;
        console.log(`${isLeftPanel ? 'Left' : 'Right'} panel: Applied visible corrugated UV mapping to BoxGeometry`);
        return geometry;
      }

      // 🎯 HAS SKYLIGHTS: Use extruded geometry with SELECTIVE cutouts - VISIBLE RIDGES PRESERVED
      console.log(`${isLeftPanel ? 'Left' : 'Right'} panel: Using ExtrudeGeometry with ${panelSkylights.length} skylight cutouts - VISIBLE RIDGES PRESERVED`);
      
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
        console.log(`  ✂️ Added SELECTIVE hole for skylight - visible ridges preserved everywhere else`);
      });

      const extrudeSettings = {
        steps: 1,
        depth: 0.2,
        bevelEnabled: false
      };

      const geometry = new THREE.ExtrudeGeometry(roofShape, extrudeSettings);
      
      // 🔧 Apply proper UV mapping to extruded geometry for PRESERVED visible corrugated texture
      const uvAttribute = geometry.attributes.uv;
      const positionAttribute = geometry.attributes.position;
      const uvArray = uvAttribute.array;
      const positionArray = positionAttribute.array;
      
      console.log(`${isLeftPanel ? 'Left' : 'Right'} panel: Applying visible corrugated UV mapping to ExtrudeGeometry with selective cutouts`);
      
      // Apply UV mapping that preserves the visible corrugated pattern EVERYWHERE except in the holes
      for (let i = 0; i < positionArray.length; i += 3) {
        const x = positionArray[i];
        const y = positionArray[i + 1];
        const z = positionArray[i + 2];
        
        const uvIndex = (i / 3) * 2;
        
        // 🎯 PRESERVE VISIBLE RIDGES: Map UV coordinates to show corrugations running along the panel length
        uvArray[uvIndex] = (x + panelLength/2) / panelLength * 6; // U coordinate - good corrugation visibility
        uvArray[uvIndex + 1] = (y + length/2) / length * (length/3); // V coordinate - across width
      }
      
      // Rotate the geometry to align with the roof pitch
      geometry.rotateX(-Math.PI / 2); // Rotate to lie flat in XZ plane
      
      uvAttribute.needsUpdate = true;
      console.log(`${isLeftPanel ? 'Left' : 'Right'} panel: Visible corrugated texture applied to ExtrudeGeometry - RIDGES PRESERVED with selective skylight cutouts`);
      return geometry;
    };
    
    // Create geometries with SELECTIVE cutouts and PRESERVED visible ridges
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
      {/* Left roof panel with VISIBLE CORRUGATED TEXTURE AND MATTE FINISH */}
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
      
      {/* Right roof panel with VISIBLE CORRUGATED TEXTURE AND MATTE FINISH */}
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
      
      {/* Ridge cap with matte finish */}
      <mesh 
        position={[0, roofHeight, 0]} 
        castShadow 
        receiveShadow
      >
        <boxGeometry args={[0.4, 0.3, length]} />
        <meshStandardMaterial 
          color={color} 
          metalness={color === '#FFFFFF' ? 0.3 : 0.4} // LOW metalness for matte finish
          roughness={color === '#FFFFFF' ? 0.7 : 0.6} // HIGH roughness to reduce shine
          envMapIntensity={color === '#FFFFFF' ? 0.4 : 0.5} // LOW environment reflection
        />
      </mesh>
    </group>
  );
};

export default Roof;