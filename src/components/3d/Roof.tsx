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

  // Create roof materials and geometries with cutouts for skylights
  const { leftRoofGeometry, rightRoofGeometry, leftRoofMaterial, rightRoofMaterial } = useMemo(() => {
    // 🎯 ENHANCED RIBBED TEXTURE - More defined ribs with stronger contrast
    const createRoofTexture = (panelSide: 'left' | 'right') => {
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
        
        // 🔧 ENHANCED RIBBED PATTERN - More defined with stronger contrast
        const ribWidth = textureWidth / 20; // Slightly wider ribs for better definition
        const ribSpacing = ribWidth * 1.2; // Add spacing between ribs
        
        // Special handling for pure white to maintain brightness
        const isWhite = color === '#FFFFFF';
        
        // 🎯 ENHANCED CONTRAST VALUES - Much stronger definition
        const deepShadowOpacity = isWhite ? 0.15 : 0.4; // Deeper shadows
        const lightShadowOpacity = isWhite ? 0.08 : 0.25; // Medium shadows
        const highlightOpacity = isWhite ? 0.12 : 0.3; // Brighter highlights
        const brightHighlightOpacity = isWhite ? 0.18 : 0.4; // Very bright highlights
        
        // 🎯 ENHANCED RIB PATTERN - Create more defined metal roofing ribs
        for (let x = 0; x < textureWidth; x += ribSpacing) {
          // Create a more complex rib profile with multiple gradients
          
          // 1. Deep shadow at the base of the rib (valley)
          const valleyGradient = ctx.createLinearGradient(x, 0, x + ribWidth * 0.2, 0);
          valleyGradient.addColorStop(0, `rgba(0,0,0,${deepShadowOpacity})`);
          valleyGradient.addColorStop(1, `rgba(0,0,0,${lightShadowOpacity})`);
          ctx.fillStyle = valleyGradient;
          ctx.fillRect(x, 0, ribWidth * 0.2, textureHeight);
          
          // 2. Rising slope with gradient from shadow to highlight
          const riseGradient = ctx.createLinearGradient(x + ribWidth * 0.2, 0, x + ribWidth * 0.6, 0);
          riseGradient.addColorStop(0, `rgba(0,0,0,${lightShadowOpacity})`);
          riseGradient.addColorStop(0.3, `rgba(0,0,0,0)`); // Neutral
          riseGradient.addColorStop(0.7, `rgba(255,255,255,${highlightOpacity * 0.3})`);
          riseGradient.addColorStop(1, `rgba(255,255,255,${highlightOpacity})`);
          ctx.fillStyle = riseGradient;
          ctx.fillRect(x + ribWidth * 0.2, 0, ribWidth * 0.4, textureHeight);
          
          // 3. Bright highlight at the peak of the rib
          const peakGradient = ctx.createLinearGradient(x + ribWidth * 0.6, 0, x + ribWidth * 0.8, 0);
          peakGradient.addColorStop(0, `rgba(255,255,255,${highlightOpacity})`);
          peakGradient.addColorStop(0.5, `rgba(255,255,255,${brightHighlightOpacity})`); // Peak highlight
          peakGradient.addColorStop(1, `rgba(255,255,255,${highlightOpacity})`);
          ctx.fillStyle = peakGradient;
          ctx.fillRect(x + ribWidth * 0.6, 0, ribWidth * 0.2, textureHeight);
          
          // 4. Falling slope back to shadow
          const fallGradient = ctx.createLinearGradient(x + ribWidth * 0.8, 0, x + ribWidth, 0);
          fallGradient.addColorStop(0, `rgba(255,255,255,${highlightOpacity})`);
          fallGradient.addColorStop(0.3, `rgba(255,255,255,${highlightOpacity * 0.3})`);
          fallGradient.addColorStop(0.7, `rgba(0,0,0,0)`); // Neutral
          fallGradient.addColorStop(1, `rgba(0,0,0,${lightShadowOpacity})`);
          ctx.fillStyle = fallGradient;
          ctx.fillRect(x + ribWidth * 0.8, 0, ribWidth * 0.2, textureHeight);
          
          // 5. Add subtle secondary highlights for more realism
          if (ribWidth > 15) { // Only for larger ribs
            // Thin bright line at the very peak
            ctx.fillStyle = `rgba(255,255,255,${brightHighlightOpacity * 1.2})`;
            ctx.fillRect(x + ribWidth * 0.68, 0, 2, textureHeight);
            
            // Thin shadow line in the valley
            ctx.fillStyle = `rgba(0,0,0,${deepShadowOpacity * 1.2})`;
            ctx.fillRect(x + ribWidth * 0.05, 0, 1, textureHeight);
          }
        }
        
        // 🎯 ADD SUBTLE WEATHERING PATTERN for more realism
        if (!isWhite) {
          // Add very subtle random weathering marks
          ctx.globalAlpha = 0.05;
          for (let i = 0; i < 50; i++) {
            const wx = Math.random() * textureWidth;
            const wy = Math.random() * textureHeight;
            const wsize = Math.random() * 3 + 1;
            ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)';
            ctx.fillRect(wx, wy, wsize, wsize * 0.3);
          }
          ctx.globalAlpha = 1.0;
        }
        
        console.log(`✅ ENHANCED RIBBED TEXTURE CREATED for ${panelSide} panel - HIGHLY DEFINED RIBS with stronger contrast`);
      }
      
      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(6, length/2); // Increased repeat for more ribs
      
      return texture;
    };

    // Create roof geometries with skylight cutouts ONLY where needed
    const createRoofGeometryWithCutouts = (isLeftPanel: boolean) => {
      // Filter skylights for this specific panel only
      const panelSkylights = skylights.filter(s => 
        s.panel === (isLeftPanel ? 'left' : 'right')
      );

      console.log(`${isLeftPanel ? 'Left' : 'Right'} panel has ${panelSkylights.length} skylights`);

      if (panelSkylights.length === 0) {
        // 🎯 NO SKYLIGHTS: Use simple box geometry with PRESERVED enhanced ribbed texture
        console.log(`${isLeftPanel ? 'Left' : 'Right'} panel: Using simple BoxGeometry - ENHANCED RIBS ALWAYS VISIBLE`);
        const geometry = new THREE.BoxGeometry(panelLength, 0.2, length);
        
        // 🔧 CRITICAL: Apply proper UV mapping for enhanced ribbed texture on simple geometry
        const uvAttribute = geometry.attributes.uv;
        const positionAttribute = geometry.attributes.position;
        const uvArray = uvAttribute.array;
        const positionArray = positionAttribute.array;
        
        // Map UVs to show enhanced ribs running along the panel length
        for (let i = 0; i < positionArray.length; i += 3) {
          const x = positionArray[i];
          const y = positionArray[i + 1];
          const z = positionArray[i + 2];
          
          const uvIndex = (i / 3) * 2;
          
          // Calculate UV coordinates for enhanced ribbed pattern
          // Ribs run along the length (Z direction), so use Z for the ribbed axis
          uvArray[uvIndex] = (z + length/2) / length * 6; // U coordinate - more ribs along length
          uvArray[uvIndex + 1] = (x + panelLength/2) / panelLength * (length/2); // V coordinate - across width
        }
        
        uvAttribute.needsUpdate = true;
        console.log(`${isLeftPanel ? 'Left' : 'Right'} panel: Applied enhanced ribbed UV mapping to BoxGeometry - ENHANCED RIBS ALWAYS VISIBLE`);
        return geometry;
      }

      // 🎯 HAS SKYLIGHTS: Use extruded geometry with SELECTIVE cutouts and PRESERVED enhanced ribs
      console.log(`${isLeftPanel ? 'Left' : 'Right'} panel: Using ExtrudeGeometry with ${panelSkylights.length} skylight cutouts - ENHANCED RIBS PRESERVED EXCEPT IN CUTOUTS`);
      
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
        console.log(`  ✂️ Added SELECTIVE hole for skylight - enhanced ribs preserved everywhere else`);
      });

      const extrudeSettings = {
        steps: 1,
        depth: 0.2,
        bevelEnabled: false
      };

      const geometry = new THREE.ExtrudeGeometry(roofShape, extrudeSettings);
      
      // 🔧 CRITICAL: Apply proper UV mapping to extruded geometry for PRESERVED enhanced ribbed texture
      const uvAttribute = geometry.attributes.uv;
      const positionAttribute = geometry.attributes.position;
      const uvArray = uvAttribute.array;
      const positionArray = positionAttribute.array;
      
      console.log(`${isLeftPanel ? 'Left' : 'Right'} panel: Applying enhanced ribbed UV mapping to ExtrudeGeometry with selective cutouts`);
      
      // Apply UV mapping that preserves the enhanced ribbed pattern EVERYWHERE except in the holes
      for (let i = 0; i < positionArray.length; i += 3) {
        const x = positionArray[i];
        const y = positionArray[i + 1];
        const z = positionArray[i + 2];
        
        const uvIndex = (i / 3) * 2;
        
        // 🎯 PRESERVE ENHANCED RIBS: Map UV coordinates to show enhanced ribs running along the panel length
        // The extruded geometry is in XY plane, so:
        // - X corresponds to the panel length direction (where ribs run)
        // - Y corresponds to the panel width direction (across ribs)
        uvArray[uvIndex] = (x + panelLength/2) / panelLength * 6; // U coordinate - more enhanced ribs along length
        uvArray[uvIndex + 1] = (y + length/2) / length * (length/2); // V coordinate - across width
      }
      
      // Rotate the geometry to align with the roof pitch
      // The extruded geometry is created in XY plane, we need to rotate it to XZ plane
      geometry.rotateX(-Math.PI / 2); // Rotate to lie flat in XZ plane
      
      uvAttribute.needsUpdate = true;
      console.log(`${isLeftPanel ? 'Left' : 'Right'} panel: Enhanced ribbed texture applied to ExtrudeGeometry - ENHANCED RIBS PRESERVED with selective skylight cutouts`);
      return geometry;
    };

    // 🎯 ALWAYS CREATE ENHANCED RIBBED TEXTURES - regardless of skylights
    const leftTexture = createRoofTexture('left');
    const rightTexture = createRoofTexture('right');
    
    // 🎯 ENHANCED MATERIAL PROPERTIES for better rib definition
    const isWhite = color === '#FFFFFF';
    const materialProps = isWhite ? {
      metalness: 0.4, // Increased metalness for better reflection
      roughness: 0.5, // Reduced roughness for more defined highlights
      envMapIntensity: 1.0, // Increased environment reflection
    } : {
      metalness: 0.8, // High metalness for metal roofing
      roughness: 0.2, // Low roughness for sharp highlights
      envMapIntensity: 0.7, // Good environment reflection
    };
    
    // Create geometries with SELECTIVE cutouts and PRESERVED enhanced ribs
    const leftGeometry = createRoofGeometryWithCutouts(true);
    const rightGeometry = createRoofGeometryWithCutouts(false);
    
    // 🎯 ALWAYS CREATE MATERIALS WITH ENHANCED RIBBED TEXTURES
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
    
    console.log(`🎯 ENHANCED ROOF MATERIALS CREATED: Both panels have HIGHLY DEFINED RIBBED TEXTURES ALWAYS VISIBLE (with or without skylights)`);
    
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
      {/* Left roof panel with ENHANCED RIBBED TEXTURE ALWAYS VISIBLE */}
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
      
      {/* Right roof panel with ENHANCED RIBBED TEXTURE ALWAYS VISIBLE */}
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
      
      {/* Ridge cap with enhanced ribbed texture */}
      <mesh 
        position={[0, roofHeight, 0]} 
        castShadow 
        receiveShadow
      >
        <boxGeometry args={[0.4, 0.3, length]} />
        <meshStandardMaterial 
          color={color} 
          metalness={color === '#FFFFFF' ? 0.3 : 0.9} 
          roughness={color === '#FFFFFF' ? 0.6 : 0.1}
          envMapIntensity={color === '#FFFFFF' ? 0.8 : 1.2}
        />
      </mesh>
    </group>
  );
};

export default Roof;