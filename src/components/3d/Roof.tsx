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

  // Create roof materials and geometries with MATTE FINISH - NO METALLIC SHINE
  const { leftRoofGeometry, rightRoofGeometry, leftRoofMaterial, rightRoofMaterial } = useMemo(() => {
    // 🎯 IDENTICAL WALL TEXTURE - Same ribbed pattern as walls
    const createWallStyleRibbedTexture = (panelSide: 'left' | 'right') => {
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
        
        // 🔥 IDENTICAL WALL RIBBED PATTERN - EXACT SAME AS WALLS
        const ribWidth = textureWidth / 6; // SAME as walls - MUCH WIDER ribs
        const ribSpacing = ribWidth * 1.05; // SAME as walls - Tight spacing
        
        // Special handling for different colors - IDENTICAL TO WALLS
        const isWhite = color === '#FFFFFF';
        const isDark = ['#1F2937', '#374151', '#4B5563'].includes(color);
        
        // 🔥 IDENTICAL CONTRAST VALUES - SAME AS WALLS
        const shadowOpacity = isWhite ? 0.35 : isDark ? 0.6 : 0.45;
        const highlightOpacity = isWhite ? 0.25 : isDark ? 0.8 : 0.4;
        const deepShadowOpacity = isWhite ? 0.5 : isDark ? 0.9 : 0.65;
        const brightHighlightOpacity = isWhite ? 0.4 : isDark ? 1.0 : 0.6;
        
        console.log(`🎯 CREATING IDENTICAL WALL-STYLE RIBS for roof ${panelSide} panel`);
        
        // 🎯 IDENTICAL RIBBED PATTERN - Create SAME ribs as walls
        for (let x = 0; x < textureWidth; x += ribSpacing) {
          // 🔥 IDENTICAL to walls - SUPER DEEP shadow valley
          const valleyGradient = ctx.createLinearGradient(x, 0, x + ribWidth * 0.2, 0);
          valleyGradient.addColorStop(0, `rgba(0,0,0,${deepShadowOpacity})`);
          valleyGradient.addColorStop(0.5, `rgba(0,0,0,${deepShadowOpacity * 0.8})`);
          valleyGradient.addColorStop(1, `rgba(0,0,0,${shadowOpacity})`);
          ctx.fillStyle = valleyGradient;
          ctx.fillRect(x, 0, ribWidth * 0.2, textureHeight);
          
          // 🔥 IDENTICAL to walls - DRAMATIC rising slope
          const riseGradient = ctx.createLinearGradient(x + ribWidth * 0.2, 0, x + ribWidth * 0.45, 0);
          riseGradient.addColorStop(0, `rgba(0,0,0,${shadowOpacity})`);
          riseGradient.addColorStop(0.3, `rgba(0,0,0,${shadowOpacity * 0.5})`);
          riseGradient.addColorStop(0.7, `rgba(255,255,255,${highlightOpacity * 0.3})`);
          riseGradient.addColorStop(1, `rgba(255,255,255,${highlightOpacity})`);
          ctx.fillStyle = riseGradient;
          ctx.fillRect(x + ribWidth * 0.2, 0, ribWidth * 0.25, textureHeight);
          
          // 🔥 IDENTICAL to walls - SUPER BRIGHT peak highlight
          const peakGradient = ctx.createLinearGradient(x + ribWidth * 0.45, 0, x + ribWidth * 0.55, 0);
          peakGradient.addColorStop(0, `rgba(255,255,255,${highlightOpacity})`);
          peakGradient.addColorStop(0.5, `rgba(255,255,255,${brightHighlightOpacity})`);
          peakGradient.addColorStop(1, `rgba(255,255,255,${highlightOpacity})`);
          ctx.fillStyle = peakGradient;
          ctx.fillRect(x + ribWidth * 0.45, 0, ribWidth * 0.1, textureHeight);
          
          // 🔥 IDENTICAL to walls - DRAMATIC falling slope
          const fallGradient = ctx.createLinearGradient(x + ribWidth * 0.55, 0, x + ribWidth * 0.8, 0);
          fallGradient.addColorStop(0, `rgba(255,255,255,${highlightOpacity})`);
          fallGradient.addColorStop(0.3, `rgba(255,255,255,${highlightOpacity * 0.3})`);
          fallGradient.addColorStop(0.7, `rgba(0,0,0,${shadowOpacity * 0.5})`);
          fallGradient.addColorStop(1, `rgba(0,0,0,${shadowOpacity})`);
          ctx.fillStyle = fallGradient;
          ctx.fillRect(x + ribWidth * 0.55, 0, ribWidth * 0.25, textureHeight);
          
          // 🔥 IDENTICAL to walls - FINAL valley approach
          const finalGradient = ctx.createLinearGradient(x + ribWidth * 0.8, 0, x + ribWidth, 0);
          finalGradient.addColorStop(0, `rgba(0,0,0,${shadowOpacity})`);
          finalGradient.addColorStop(0.5, `rgba(0,0,0,${shadowOpacity * 1.2})`);
          finalGradient.addColorStop(1, `rgba(0,0,0,${deepShadowOpacity})`);
          ctx.fillStyle = finalGradient;
          ctx.fillRect(x + ribWidth * 0.8, 0, ribWidth * 0.2, textureHeight);
          
          // 🔥 IDENTICAL to walls - SUPER SHARP definition lines
          // ULTRA BRIGHT highlight line at the very peak
          ctx.fillStyle = `rgba(255,255,255,${brightHighlightOpacity * 1.5})`;
          ctx.fillRect(x + ribWidth * 0.49, 0, 4, textureHeight);
          
          // ULTRA DARK shadow lines in the valleys
          ctx.fillStyle = `rgba(0,0,0,${deepShadowOpacity * 1.3})`;
          ctx.fillRect(x + ribWidth * 0.02, 0, 3, textureHeight);
          ctx.fillRect(x + ribWidth * 0.98, 0, 3, textureHeight);
          
          // 🔥 IDENTICAL to walls - ADDITIONAL DEFINITION
          ctx.fillStyle = `rgba(255,255,255,${highlightOpacity * 0.8})`;
          ctx.fillRect(x + ribWidth * 0.46, 0, 2, textureHeight);
          ctx.fillRect(x + ribWidth * 0.52, 0, 2, textureHeight);
          
          ctx.fillStyle = `rgba(0,0,0,${shadowOpacity * 1.1})`;
          ctx.fillRect(x + ribWidth * 0.1, 0, 2, textureHeight);
          ctx.fillRect(x + ribWidth * 0.9, 0, 2, textureHeight);
        }
        
        // 🔥 IDENTICAL to walls - ENHANCED horizontal panel lines
        const panelHeight = textureHeight / 3;
        ctx.strokeStyle = `rgba(0,0,0,${shadowOpacity * 1.2})`;
        ctx.lineWidth = 3;
        for (let y = panelHeight; y < textureHeight; y += panelHeight) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(textureWidth, y);
          ctx.stroke();
          
          // Add BRIGHT highlight above each panel line
          ctx.strokeStyle = `rgba(255,255,255,${highlightOpacity * 0.6})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(0, y - 2);
          ctx.lineTo(textureWidth, y - 2);
          ctx.stroke();
          ctx.strokeStyle = `rgba(0,0,0,${shadowOpacity * 1.2})`;
          ctx.lineWidth = 3;
        }
        
        // 🔥 IDENTICAL to walls - ENHANCED weathering
        if (!isWhite) {
          ctx.globalAlpha = 0.08;
          for (let i = 0; i < 50; i++) {
            const wx = Math.random() * textureWidth;
            const wy = Math.random() * textureHeight;
            const wsize = Math.random() * 6 + 2;
            ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)';
            ctx.fillRect(wx, wy, wsize, wsize * 0.5);
          }
          ctx.globalAlpha = 1.0;
        }
        
        console.log(`✅ IDENTICAL WALL-STYLE TEXTURE CREATED for roof ${panelSide} panel`);
      }
      
      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      // 🎯 IDENTICAL to walls - SAME scale for consistent appearance
      texture.repeat.set(length/3, panelLength/3); // Same scaling as walls
      
      return texture;
    };

    // 🎯 CREATE IDENTICAL WALL-STYLE TEXTURES for both roof panels
    console.log(`🎯 CREATING IDENTICAL WALL-STYLE TEXTURES for both roof panels`);
    const leftTexture = createWallStyleRibbedTexture('left');
    const rightTexture = createWallStyleRibbedTexture('right');
    
    // 🎯 MATTE FINISH MATERIAL PROPERTIES - NO METALLIC SHINE
    const isWhite = color === '#FFFFFF';
    const isDark = ['#1F2937', '#374151', '#4B5563'].includes(color);
    
    const materialProps = isWhite ? {
      metalness: 0.1, // VERY LOW metalness - almost no shine
      roughness: 0.8, // HIGH roughness - matte finish
      envMapIntensity: 0.3, // LOW environment reflection
    } : isDark ? {
      metalness: 0.2, // LOW metalness - minimal shine
      roughness: 0.7, // HIGH roughness - matte finish
      envMapIntensity: 0.4, // LOW environment reflection
    } : {
      metalness: 0.15, // VERY LOW metalness - almost no shine
      roughness: 0.75, // HIGH roughness - matte finish
      envMapIntensity: 0.35, // LOW environment reflection
    };
    
    // 🎯 CREATE MATERIALS WITH MATTE FINISH - NO METALLIC SHINE
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
    
    console.log(`🎯 ROOF MATERIALS CREATED: MATTE FINISH - NO METALLIC SHINE`);

    // Create roof geometries with skylight cutouts ONLY where needed
    const createRoofGeometryWithCutouts = (isLeftPanel: boolean) => {
      // Filter skylights for this specific panel only
      const panelSkylights = skylights.filter(s => 
        s.panel === (isLeftPanel ? 'left' : 'right')
      );

      console.log(`${isLeftPanel ? 'Left' : 'Right'} panel has ${panelSkylights.length} skylights`);

      if (panelSkylights.length === 0) {
        // 🎯 NO SKYLIGHTS: Use simple box geometry - WALL-STYLE TEXTURE ALWAYS VISIBLE
        console.log(`${isLeftPanel ? 'Left' : 'Right'} panel: Using simple BoxGeometry - WALL-STYLE TEXTURE ALWAYS VISIBLE`);
        const geometry = new THREE.BoxGeometry(panelLength, 0.2, length);
        
        // 🔧 CRITICAL: Apply proper UV mapping for wall-style texture on simple geometry
        const uvAttribute = geometry.attributes.uv;
        const positionAttribute = geometry.attributes.position;
        const uvArray = uvAttribute.array;
        const positionArray = positionAttribute.array;
        
        // Map UVs to show wall-style ribbed texture
        for (let i = 0; i < positionArray.length; i += 3) {
          const x = positionArray[i];
          const y = positionArray[i + 1];
          const z = positionArray[i + 2];
          
          const uvIndex = (i / 3) * 2;
          
          // 🎯 WALL-STYLE TEXTURE: Map UV coordinates same as walls
          uvArray[uvIndex] = (z + length/2) / length * (length/3);
          uvArray[uvIndex + 1] = (x + panelLength/2) / panelLength * (panelLength/3);
        }
        
        uvAttribute.needsUpdate = true;
        console.log(`${isLeftPanel ? 'Left' : 'Right'} panel: Applied wall-style UV mapping to BoxGeometry`);
        return geometry;
      }

      // 🎯 HAS SKYLIGHTS: Use extruded geometry with SELECTIVE cutouts - WALL-STYLE TEXTURE PRESERVED
      console.log(`${isLeftPanel ? 'Left' : 'Right'} panel: Using ExtrudeGeometry with ${panelSkylights.length} skylight cutouts - WALL-STYLE TEXTURE PRESERVED EXCEPT IN CUTOUTS`);
      
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
        console.log(`  ✂️ Added SELECTIVE hole for skylight - wall-style texture preserved everywhere else`);
      });

      const extrudeSettings = {
        steps: 1,
        depth: 0.2,
        bevelEnabled: false
      };

      const geometry = new THREE.ExtrudeGeometry(roofShape, extrudeSettings);
      
      // 🔧 CRITICAL: Apply proper UV mapping to extruded geometry for PRESERVED wall-style texture
      const uvAttribute = geometry.attributes.uv;
      const positionAttribute = geometry.attributes.position;
      const uvArray = uvAttribute.array;
      const positionArray = positionAttribute.array;
      
      console.log(`${isLeftPanel ? 'Left' : 'Right'} panel: Applying wall-style UV mapping to ExtrudeGeometry with selective cutouts`);
      
      // Apply UV mapping that preserves the wall-style texture EVERYWHERE except in the holes
      for (let i = 0; i < positionArray.length; i += 3) {
        const x = positionArray[i];
        const y = positionArray[i + 1];
        const z = positionArray[i + 2];
        
        const uvIndex = (i / 3) * 2;
        
        // 🎯 PRESERVE WALL-STYLE TEXTURE: Map UV coordinates same as walls
        uvArray[uvIndex] = (y + length/2) / length * (length/3);
        uvArray[uvIndex + 1] = (x + panelLength/2) / panelLength * (panelLength/3);
      }
      
      // Rotate the geometry to align with the roof pitch
      geometry.rotateX(-Math.PI / 2);
      
      uvAttribute.needsUpdate = true;
      console.log(`${isLeftPanel ? 'Left' : 'Right'} panel: Wall-style texture applied to ExtrudeGeometry with selective skylight cutouts`);
      return geometry;
    };
    
    // Create geometries with SELECTIVE cutouts and PRESERVED wall-style texture
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
      {/* Left roof panel with MATTE FINISH - NO METALLIC SHINE */}
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
          .filter(Boolean)
        }
      </group>
      
      {/* Right roof panel with MATTE FINISH - NO METALLIC SHINE */}
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
          .filter(Boolean)
        }
      </group>
      
      {/* Ridge cap with MATTE FINISH - NO METALLIC SHINE */}
      <mesh 
        position={[0, roofHeight, 0]} 
        castShadow 
        receiveShadow
      >
        <boxGeometry args={[0.4, 0.3, length]} />
        <meshStandardMaterial 
          color={color} 
          metalness={color === '#FFFFFF' ? 0.1 : ['#1F2937', '#374151', '#4B5563'].includes(color) ? 0.2 : 0.15}
          roughness={color === '#FFFFFF' ? 0.8 : ['#1F2937', '#374151', '#4B5563'].includes(color) ? 0.7 : 0.75}
          envMapIntensity={color === '#FFFFFF' ? 0.3 : ['#1F2937', '#374151', '#4B5563'].includes(color) ? 0.4 : 0.35}
        />
      </mesh>
    </group>
  );
};

export default Roof;