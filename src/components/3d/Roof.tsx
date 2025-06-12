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

  // Create roof materials and geometries with HIGHLY VISIBLE corrugated ridges
  const { leftRoofGeometry, rightRoofGeometry, leftRoofMaterial, rightRoofMaterial } = useMemo(() => {
    // 🎯 SUPER VISIBLE CORRUGATED METAL TEXTURE - DEEP RIDGES
    const createDeepCorrugatedTexture = (panelSide: 'left' | 'right') => {
      const textureWidth = 512;
      const textureHeight = 512;
      const canvas = document.createElement('canvas');
      canvas.width = textureWidth;
      canvas.height = textureHeight;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // Base color fill
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, textureWidth, textureHeight);
        
        // 🔥 SUPER WIDE CORRUGATIONS - EXTREMELY VISIBLE
        const corrugationWidth = textureWidth / 4; // VERY WIDE ridges for maximum visibility
        const corrugationSpacing = corrugationWidth;
        
        // 🔥 EXTREME CONTRAST VALUES - SUPER DRAMATIC
        const deepShadowOpacity = 0.8;     // VERY DARK shadows
        const lightShadowOpacity = 0.5;    // MEDIUM shadows
        const highlightOpacity = 0.6;      // BRIGHT highlights
        const brightHighlightOpacity = 0.9; // SUPER BRIGHT peaks
        
        console.log(`🔥 CREATING SUPER VISIBLE CORRUGATIONS: ${corrugationWidth}px wide, EXTREME contrast`);
        
        // 🔥 SUPER DRAMATIC CORRUGATED PATTERN - DEEP VALLEYS AND HIGH PEAKS
        for (let x = 0; x < textureWidth; x += corrugationSpacing) {
          // 1. SUPER DEEP valley shadow - VERY DARK
          ctx.fillStyle = `rgba(0,0,0,${deepShadowOpacity})`;
          ctx.fillRect(x, 0, corrugationWidth * 0.1, textureHeight);
          
          // 2. Deep shadow transition
          const shadowGradient = ctx.createLinearGradient(x + corrugationWidth * 0.1, 0, x + corrugationWidth * 0.3, 0);
          shadowGradient.addColorStop(0, `rgba(0,0,0,${deepShadowOpacity})`);
          shadowGradient.addColorStop(1, `rgba(0,0,0,${lightShadowOpacity})`);
          ctx.fillStyle = shadowGradient;
          ctx.fillRect(x + corrugationWidth * 0.1, 0, corrugationWidth * 0.2, textureHeight);
          
          // 3. Rising slope to peak
          const riseGradient = ctx.createLinearGradient(x + corrugationWidth * 0.3, 0, x + corrugationWidth * 0.45, 0);
          riseGradient.addColorStop(0, `rgba(0,0,0,${lightShadowOpacity})`);
          riseGradient.addColorStop(0.5, `rgba(0,0,0,0)`);
          riseGradient.addColorStop(1, `rgba(255,255,255,${highlightOpacity})`);
          ctx.fillStyle = riseGradient;
          ctx.fillRect(x + corrugationWidth * 0.3, 0, corrugationWidth * 0.15, textureHeight);
          
          // 4. SUPER BRIGHT peak - MAXIMUM HIGHLIGHT
          ctx.fillStyle = `rgba(255,255,255,${brightHighlightOpacity})`;
          ctx.fillRect(x + corrugationWidth * 0.45, 0, corrugationWidth * 0.1, textureHeight);
          
          // 5. Falling slope from peak
          const fallGradient = ctx.createLinearGradient(x + corrugationWidth * 0.55, 0, x + corrugationWidth * 0.7, 0);
          fallGradient.addColorStop(0, `rgba(255,255,255,${highlightOpacity})`);
          fallGradient.addColorStop(0.5, `rgba(0,0,0,0)`);
          fallGradient.addColorStop(1, `rgba(0,0,0,${lightShadowOpacity})`);
          ctx.fillStyle = fallGradient;
          ctx.fillRect(x + corrugationWidth * 0.55, 0, corrugationWidth * 0.15, textureHeight);
          
          // 6. Shadow transition to next valley
          const finalShadowGradient = ctx.createLinearGradient(x + corrugationWidth * 0.7, 0, x + corrugationWidth * 0.9, 0);
          finalShadowGradient.addColorStop(0, `rgba(0,0,0,${lightShadowOpacity})`);
          finalShadowGradient.addColorStop(1, `rgba(0,0,0,${deepShadowOpacity})`);
          ctx.fillStyle = finalShadowGradient;
          ctx.fillRect(x + corrugationWidth * 0.7, 0, corrugationWidth * 0.2, textureHeight);
          
          // 7. Final deep valley
          ctx.fillStyle = `rgba(0,0,0,${deepShadowOpacity})`;
          ctx.fillRect(x + corrugationWidth * 0.9, 0, corrugationWidth * 0.1, textureHeight);
          
          // 🔥 SUPER SHARP DEFINITION LINES - MAXIMUM VISIBILITY
          // Ultra bright peak line
          ctx.fillStyle = `rgba(255,255,255,1.0)`; // PURE WHITE
          ctx.fillRect(x + corrugationWidth * 0.49, 0, 6, textureHeight); // THICK line
          
          // Ultra dark valley lines
          ctx.fillStyle = `rgba(0,0,0,1.0)`; // PURE BLACK
          ctx.fillRect(x + corrugationWidth * 0.05, 0, 4, textureHeight); // THICK line
          ctx.fillRect(x + corrugationWidth * 0.95, 0, 4, textureHeight); // THICK line
          
          // Additional contrast lines
          ctx.fillStyle = `rgba(255,255,255,0.8)`;
          ctx.fillRect(x + corrugationWidth * 0.46, 0, 3, textureHeight);
          ctx.fillRect(x + corrugationWidth * 0.53, 0, 3, textureHeight);
        }
        
        // Add horizontal panel seams - VERY VISIBLE
        const seamSpacing = textureHeight / 2;
        ctx.strokeStyle = `rgba(0,0,0,0.7)`;
        ctx.lineWidth = 4;
        for (let y = seamSpacing; y < textureHeight; y += seamSpacing) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(textureWidth, y);
          ctx.stroke();
          
          // Bright highlight above seam
          ctx.strokeStyle = `rgba(255,255,255,0.5)`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(0, y - 3);
          ctx.lineTo(textureWidth, y - 3);
          ctx.stroke();
          ctx.strokeStyle = `rgba(0,0,0,0.7)`;
          ctx.lineWidth = 4;
        }
        
        console.log(`✅ SUPER VISIBLE CORRUGATED TEXTURE CREATED for ${panelSide} panel - DEEP RIDGES`);
      }
      
      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(3, length/4); // Fewer repeats for larger, more visible ridges
      
      return texture;
    };

    // 🎯 CREATE SUPER VISIBLE CORRUGATED TEXTURES
    console.log(`🔥 CREATING SUPER VISIBLE CORRUGATED TEXTURES - DEEP RIDGES`);
    const leftTexture = createDeepCorrugatedTexture('left');
    const rightTexture = createDeepCorrugatedTexture('right');
    
    // 🎯 MATERIAL PROPERTIES FOR MAXIMUM RIDGE VISIBILITY
    const materialProps = {
      metalness: 0.2,  // LOW metalness to reduce shine
      roughness: 0.8,  // HIGH roughness for matte finish
      envMapIntensity: 0.3, // LOW environment reflection
    };
    
    // 🎯 CREATE MATERIALS WITH SUPER VISIBLE RIDGES
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
    
    console.log(`🔥 SUPER VISIBLE ROOF MATERIALS CREATED: DEEP CORRUGATED RIDGES`);

    // Create roof geometries with skylight cutouts ONLY where needed
    const createRoofGeometryWithCutouts = (isLeftPanel: boolean) => {
      // Filter skylights for this specific panel only
      const panelSkylights = skylights.filter(s => 
        s.panel === (isLeftPanel ? 'left' : 'right')
      );

      console.log(`${isLeftPanel ? 'Left' : 'Right'} panel has ${panelSkylights.length} skylights`);

      if (panelSkylights.length === 0) {
        // 🎯 NO SKYLIGHTS: Use simple box geometry - SUPER VISIBLE RIDGES
        console.log(`${isLeftPanel ? 'Left' : 'Right'} panel: Using simple BoxGeometry - SUPER VISIBLE RIDGES`);
        const geometry = new THREE.BoxGeometry(panelLength, 0.2, length);
        
        // 🔧 Apply proper UV mapping for super visible corrugated texture
        const uvAttribute = geometry.attributes.uv;
        const positionAttribute = geometry.attributes.position;
        const uvArray = uvAttribute.array;
        const positionArray = positionAttribute.array;
        
        // Map UVs to show super visible corrugations running along the panel length
        for (let i = 0; i < positionArray.length; i += 3) {
          const x = positionArray[i];
          const y = positionArray[i + 1];
          const z = positionArray[i + 2];
          
          const uvIndex = (i / 3) * 2;
          
          // Calculate UV coordinates for super visible corrugated pattern
          uvArray[uvIndex] = (z + length/2) / length * 3; // U coordinate - fewer repeats for larger ridges
          uvArray[uvIndex + 1] = (x + panelLength/2) / panelLength * (length/4); // V coordinate - across width
        }
        
        uvAttribute.needsUpdate = true;
        console.log(`${isLeftPanel ? 'Left' : 'Right'} panel: Applied super visible corrugated UV mapping to BoxGeometry`);
        return geometry;
      }

      // 🎯 HAS SKYLIGHTS: Use extruded geometry with SELECTIVE cutouts - SUPER VISIBLE RIDGES PRESERVED
      console.log(`${isLeftPanel ? 'Left' : 'Right'} panel: Using ExtrudeGeometry with ${panelSkylights.length} skylight cutouts - SUPER VISIBLE RIDGES PRESERVED`);
      
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
        console.log(`  ✂️ Added SELECTIVE hole for skylight - super visible ridges preserved everywhere else`);
      });

      const extrudeSettings = {
        steps: 1,
        depth: 0.2,
        bevelEnabled: false
      };

      const geometry = new THREE.ExtrudeGeometry(roofShape, extrudeSettings);
      
      // 🔧 Apply proper UV mapping to extruded geometry for PRESERVED super visible corrugated texture
      const uvAttribute = geometry.attributes.uv;
      const positionAttribute = geometry.attributes.position;
      const uvArray = uvAttribute.array;
      const positionArray = positionAttribute.array;
      
      console.log(`${isLeftPanel ? 'Left' : 'Right'} panel: Applying super visible corrugated UV mapping to ExtrudeGeometry with selective cutouts`);
      
      // Apply UV mapping that preserves the super visible corrugated pattern EVERYWHERE except in the holes
      for (let i = 0; i < positionArray.length; i += 3) {
        const x = positionArray[i];
        const y = positionArray[i + 1];
        const z = positionArray[i + 2];
        
        const uvIndex = (i / 3) * 2;
        
        // 🎯 PRESERVE SUPER VISIBLE RIDGES: Map UV coordinates to show corrugations running along the panel length
        uvArray[uvIndex] = (x + panelLength/2) / panelLength * 3; // U coordinate - fewer repeats for larger ridges
        uvArray[uvIndex + 1] = (y + length/2) / length * (length/4); // V coordinate - across width
      }
      
      // Rotate the geometry to align with the roof pitch
      geometry.rotateX(-Math.PI / 2); // Rotate to lie flat in XZ plane
      
      uvAttribute.needsUpdate = true;
      console.log(`${isLeftPanel ? 'Left' : 'Right'} panel: Super visible corrugated texture applied to ExtrudeGeometry - RIDGES PRESERVED with selective skylight cutouts`);
      return geometry;
    };
    
    // Create geometries with SELECTIVE cutouts and PRESERVED super visible ridges
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
      {/* Left roof panel with SUPER VISIBLE CORRUGATED RIDGES */}
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
      
      {/* Right roof panel with SUPER VISIBLE CORRUGATED RIDGES */}
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
          metalness={0.2} // LOW metalness for matte finish
          roughness={0.8} // HIGH roughness to reduce shine
          envMapIntensity={0.3} // LOW environment reflection
        />
      </mesh>
    </group>
  );
};

export default Roof;