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

  // Create roof materials and geometries with VERTICAL RIBS running down the slope
  const { leftRoofGeometry, rightRoofGeometry, leftRoofMaterial, rightRoofMaterial } = useMemo(() => {
    // 🎯 VERTICAL CORRUGATED TEXTURE - Ribs run DOWN the roof slope
    const createVerticalCorrugatedTexture = (panelSide: 'left' | 'right') => {
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
        
        // 🔥 VERTICAL CORRUGATED PATTERN - Ribs run DOWN the slope (Y direction)
        const ribWidth = textureHeight / 8; // Ribs along the Y-axis (down the slope)
        const ribSpacing = ribWidth * 1.05; // Tight spacing
        
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
        
        console.log(`🎯 CREATING VERTICAL CORRUGATED RIBS running DOWN the slope - ${panelSide} panel`);
        
        // 🎯 VERTICAL CORRUGATED PATTERN - Create ribs that run DOWN the roof slope
        for (let y = 0; y < textureHeight; y += ribSpacing) {
          // Create a corrugation profile running vertically (down the slope)
          
          // 1. Deep valley shadow
          const valleyGradient = ctx.createLinearGradient(0, y, 0, y + ribWidth * 0.2);
          valleyGradient.addColorStop(0, `rgba(0,0,0,${deepShadowOpacity})`);
          valleyGradient.addColorStop(1, `rgba(0,0,0,${lightShadowOpacity})`);
          ctx.fillStyle = valleyGradient;
          ctx.fillRect(0, y, textureWidth, ribWidth * 0.2);
          
          // 2. Rising slope with gradient from shadow to highlight
          const riseGradient = ctx.createLinearGradient(0, y + ribWidth * 0.2, 0, y + ribWidth * 0.45);
          riseGradient.addColorStop(0, `rgba(0,0,0,${lightShadowOpacity})`);
          riseGradient.addColorStop(0.3, `rgba(0,0,0,0)`); // Neutral
          riseGradient.addColorStop(0.7, `rgba(255,255,255,${highlightOpacity * 0.4})`);
          riseGradient.addColorStop(1, `rgba(255,255,255,${highlightOpacity})`);
          ctx.fillStyle = riseGradient;
          ctx.fillRect(0, y + ribWidth * 0.2, textureWidth, ribWidth * 0.25);
          
          // 3. Peak plateau with bright highlight
          const peakGradient = ctx.createLinearGradient(0, y + ribWidth * 0.45, 0, y + ribWidth * 0.55);
          peakGradient.addColorStop(0, `rgba(255,255,255,${highlightOpacity})`);
          peakGradient.addColorStop(0.5, `rgba(255,255,255,${brightHighlightOpacity})`); // Peak highlight
          peakGradient.addColorStop(1, `rgba(255,255,255,${highlightOpacity})`);
          ctx.fillStyle = peakGradient;
          ctx.fillRect(0, y + ribWidth * 0.45, textureWidth, ribWidth * 0.1);
          
          // 4. Falling slope back to shadow
          const fallGradient = ctx.createLinearGradient(0, y + ribWidth * 0.55, 0, y + ribWidth * 0.8);
          fallGradient.addColorStop(0, `rgba(255,255,255,${highlightOpacity})`);
          fallGradient.addColorStop(0.3, `rgba(255,255,255,${highlightOpacity * 0.4})`);
          fallGradient.addColorStop(0.7, `rgba(0,0,0,0)`); // Neutral
          fallGradient.addColorStop(1, `rgba(0,0,0,${lightShadowOpacity})`);
          ctx.fillStyle = fallGradient;
          ctx.fillRect(0, y + ribWidth * 0.55, textureWidth, ribWidth * 0.25);
          
          // 5. Final valley approach
          const finalGradient = ctx.createLinearGradient(0, y + ribWidth * 0.8, 0, y + ribWidth);
          finalGradient.addColorStop(0, `rgba(0,0,0,${lightShadowOpacity})`);
          finalGradient.addColorStop(1, `rgba(0,0,0,${deepShadowOpacity})`);
          ctx.fillStyle = finalGradient;
          ctx.fillRect(0, y + ribWidth * 0.8, textureWidth, ribWidth * 0.2);
          
          // 6. Add sharp definition lines for more realism
          if (ribWidth > 20) { // Only for larger corrugations
            // Thin bright line at the very peak
            ctx.fillStyle = `rgba(255,255,255,${brightHighlightOpacity * 1.3})`;
            ctx.fillRect(0, y + ribWidth * 0.49, textureWidth, 2);
            
            // Thin shadow line in the valley
            ctx.fillStyle = `rgba(0,0,0,${deepShadowOpacity * 1.2})`;
            ctx.fillRect(0, y + ribWidth * 0.05, textureWidth, 1);
            ctx.fillRect(0, y + ribWidth * 0.95, textureWidth, 1);
          }
        }
        
        // Add horizontal panel seams every 8 feet equivalent (across the ribs)
        const seamSpacing = textureWidth / 4;
        ctx.strokeStyle = `rgba(0,0,0,${lightShadowOpacity * 0.8})`;
        ctx.lineWidth = 2;
        for (let x = seamSpacing; x < textureWidth; x += seamSpacing) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, textureHeight);
          ctx.stroke();
          
          // Add slight highlight beside seam
          ctx.strokeStyle = `rgba(255,255,255,${highlightOpacity * 0.3})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(x - 1, 0);
          ctx.lineTo(x - 1, textureHeight);
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
            ctx.fillRect(wx, wy, wsize * 0.4, wsize);
          }
          ctx.globalAlpha = 1.0;
        }
        
        console.log(`✅ VERTICAL CORRUGATED TEXTURE CREATED for ${panelSide} panel - RIBS RUN DOWN THE SLOPE`);
      }
      
      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      // 🎯 CRITICAL: Adjust repeat to make ribs run DOWN the slope
      texture.repeat.set(length/3, 8); // X = panels along length, Y = ribs down the slope
      
      return texture;
    };

    // 🎯 ALWAYS CREATE VERTICAL CORRUGATED TEXTURES - ribs run down the slope
    console.log(`🎯 CREATING VERTICAL CORRUGATED TEXTURES for both roof panels - RIBS RUN DOWN THE SLOPE`);
    const leftTexture = createVerticalCorrugatedTexture('left');
    const rightTexture = createVerticalCorrugatedTexture('right');
    
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
    
    // 🎯 ALWAYS CREATE MATERIALS WITH VERTICAL CORRUGATED TEXTURES
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
    
    console.log(`🎯 VERTICAL ROOF MATERIALS CREATED: Both panels have RIBS RUNNING DOWN THE SLOPE`);

    // Create roof geometries with skylight cutouts ONLY where needed
    const createRoofGeometryWithCutouts = (isLeftPanel: boolean) => {
      // Filter skylights for this specific panel only
      const panelSkylights = skylights.filter(s => 
        s.panel === (isLeftPanel ? 'left' : 'right')
      );

      console.log(`${isLeftPanel ? 'Left' : 'Right'} panel has ${panelSkylights.length} skylights`);

      if (panelSkylights.length === 0) {
        // 🎯 NO SKYLIGHTS: Use simple box geometry - VERTICAL CORRUGATIONS ALWAYS VISIBLE
        console.log(`${isLeftPanel ? 'Left' : 'Right'} panel: Using simple BoxGeometry - VERTICAL CORRUGATIONS ALWAYS VISIBLE`);
        const geometry = new THREE.BoxGeometry(panelLength, 0.2, length);
        
        // 🔧 CRITICAL: Apply proper UV mapping for vertical corrugated texture on simple geometry
        const uvAttribute = geometry.attributes.uv;
        const positionAttribute = geometry.attributes.position;
        const uvArray = uvAttribute.array;
        const positionArray = positionAttribute.array;
        
        // Map UVs to show vertical corrugations running down the slope
        for (let i = 0; i < positionArray.length; i += 3) {
          const x = positionArray[i];
          const y = positionArray[i + 1];
          const z = positionArray[i + 2];
          
          const uvIndex = (i / 3) * 2;
          
          // 🎯 VERTICAL CORRUGATIONS: Map UV coordinates so ribs run down the slope
          // U coordinate - across the panel width (for panel seams)
          uvArray[uvIndex] = (z + length/2) / length * (length/3);
          // V coordinate - down the slope (for vertical ribs)
          uvArray[uvIndex + 1] = (x + panelLength/2) / panelLength * 8;
        }
        
        uvAttribute.needsUpdate = true;
        console.log(`${isLeftPanel ? 'Left' : 'Right'} panel: Applied vertical corrugated UV mapping to BoxGeometry - RIBS RUN DOWN THE SLOPE`);
        return geometry;
      }

      // 🎯 HAS SKYLIGHTS: Use extruded geometry with SELECTIVE cutouts - VERTICAL CORRUGATIONS PRESERVED
      console.log(`${isLeftPanel ? 'Left' : 'Right'} panel: Using ExtrudeGeometry with ${panelSkylights.length} skylight cutouts - VERTICAL CORRUGATIONS PRESERVED EXCEPT IN CUTOUTS`);
      
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
        console.log(`  ✂️ Added SELECTIVE hole for skylight - vertical corrugations preserved everywhere else`);
      });

      const extrudeSettings = {
        steps: 1,
        depth: 0.2,
        bevelEnabled: false
      };

      const geometry = new THREE.ExtrudeGeometry(roofShape, extrudeSettings);
      
      // 🔧 CRITICAL: Apply proper UV mapping to extruded geometry for PRESERVED vertical corrugated texture
      const uvAttribute = geometry.attributes.uv;
      const positionAttribute = geometry.attributes.position;
      const uvArray = uvAttribute.array;
      const positionArray = positionAttribute.array;
      
      console.log(`${isLeftPanel ? 'Left' : 'Right'} panel: Applying vertical corrugated UV mapping to ExtrudeGeometry with selective cutouts`);
      
      // Apply UV mapping that preserves the vertical corrugated pattern EVERYWHERE except in the holes
      for (let i = 0; i < positionArray.length; i += 3) {
        const x = positionArray[i];
        const y = positionArray[i + 1];
        const z = positionArray[i + 2];
        
        const uvIndex = (i / 3) * 2;
        
        // 🎯 PRESERVE VERTICAL CORRUGATIONS: Map UV coordinates to show vertical corrugations running down the slope
        // The extruded geometry is in XY plane, so:
        // - Y corresponds to the panel length direction (across the ribs)
        // - X corresponds to the panel width direction (down the slope - where ribs run)
        uvArray[uvIndex] = (y + length/2) / length * (length/3); // U coordinate - across the panel
        uvArray[uvIndex + 1] = (x + panelLength/2) / panelLength * 8; // V coordinate - down the slope (vertical ribs)
      }
      
      // Rotate the geometry to align with the roof pitch
      // The extruded geometry is created in XY plane, we need to rotate it to XZ plane
      geometry.rotateX(-Math.PI / 2); // Rotate to lie flat in XZ plane
      
      uvAttribute.needsUpdate = true;
      console.log(`${isLeftPanel ? 'Left' : 'Right'} panel: Vertical corrugated texture applied to ExtrudeGeometry - RIBS RUN DOWN THE SLOPE with selective skylight cutouts`);
      return geometry;
    };
    
    // Create geometries with SELECTIVE cutouts and PRESERVED vertical corrugations
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
      {/* Left roof panel with VERTICAL CORRUGATED TEXTURE - RIBS RUN DOWN THE SLOPE */}
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
      
      {/* Right roof panel with VERTICAL CORRUGATED TEXTURE - RIBS RUN DOWN THE SLOPE */}
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