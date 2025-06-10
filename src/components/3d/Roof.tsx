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

  // Create roof materials and geometries with ALWAYS PRESERVED ribbed texture
  const { leftRoofGeometry, rightRoofGeometry, leftRoofMaterial, rightRoofMaterial } = useMemo(() => {
    const createRoofTexture = (panelSide: 'left' | 'right') => {
      const textureWidth = 512;
      const textureHeight = 512;
      const canvas = document.createElement('canvas');
      canvas.width = textureWidth;
      canvas.height = textureHeight;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // Fill base color
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, textureWidth, textureHeight);
        
        // 🎯 ENHANCED RIBBED PATTERN - More visible ribs
        const ribWidth = textureWidth / 16; // Wider ribs for better visibility
        
        // Special handling for pure white to maintain brightness
        const isWhite = color === '#FFFFFF';
        const shadowOpacity = isWhite ? 0.15 : 0.3; // Increased contrast
        const highlightOpacity = isWhite ? 0.1 : 0.2; // Increased contrast
        
        // Create more pronounced ribbed pattern
        for (let x = 0; x < textureWidth; x += ribWidth) {
          // Create gradient for each rib
          const gradient = ctx.createLinearGradient(x, 0, x + ribWidth, 0);
          gradient.addColorStop(0, `rgba(255,255,255,${highlightOpacity})`);
          gradient.addColorStop(0.3, `rgba(255,255,255,${highlightOpacity * 0.5})`);
          gradient.addColorStop(0.5, `rgba(0,0,0,${shadowOpacity})`);
          gradient.addColorStop(0.7, `rgba(255,255,255,${highlightOpacity * 0.5})`);
          gradient.addColorStop(1, `rgba(255,255,255,${highlightOpacity})`);
          
          ctx.fillStyle = gradient;
          ctx.fillRect(x, 0, ribWidth, textureHeight);
        }
        
        console.log(`🎨 Created enhanced ribbed texture for ${panelSide} panel with ${Math.floor(textureWidth / ribWidth)} ribs`);
      }
      
      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      // 🔧 CRITICAL: Proper texture repeat for visible ribs
      texture.repeat.set(6, length/4); // Increased repeat for more visible ribs
      
      return texture;
    };

    // 🎯 ALWAYS USE SIMPLE GEOMETRY WITH CORRECTED UV MAPPING
    const createRoofGeometry = (isLeftPanel: boolean) => {
      console.log(`${isLeftPanel ? 'Left' : 'Right'} panel: Creating geometry with CORRECTED UV mapping for visible ribs`);
      const geometry = new THREE.BoxGeometry(panelLength, 0.2, length);
      
      // 🔧 CRITICAL FIX: Proper UV mapping for ribbed texture visibility
      const uvAttribute = geometry.attributes.uv;
      const positionAttribute = geometry.attributes.position;
      
      if (uvAttribute && positionAttribute) {
        const uvArray = uvAttribute.array as Float32Array;
        const positionArray = positionAttribute.array as Float32Array;
        
        console.log(`Applying UV mapping to ${uvArray.length / 2} vertices`);
        
        // 🎯 ENHANCED UV MAPPING: Map UVs correctly for ribbed pattern visibility
        for (let i = 0; i < positionArray.length; i += 3) {
          const x = positionArray[i];     // Along panel length (ribs run this way)
          const y = positionArray[i + 1]; // Panel thickness
          const z = positionArray[i + 2]; // Across roof width
          
          const uvIndex = (i / 3) * 2;
          
          // 🔧 CORRECTED UV COORDINATES for visible ribs
          // U coordinate: ribs run along the panel length (X direction)
          uvArray[uvIndex] = (x + panelLength/2) / panelLength * 6; // Scale for rib visibility
          
          // V coordinate: across the roof width (Z direction)  
          uvArray[uvIndex + 1] = (z + length/2) / length * (length/4); // Scale for proper tiling
        }
        
        uvAttribute.needsUpdate = true;
        console.log(`✅ Applied corrected UV mapping for ${isLeftPanel ? 'left' : 'right'} panel - RIBS SHOULD BE VISIBLE`);
      } else {
        console.error(`❌ Failed to get UV or position attributes for ${isLeftPanel ? 'left' : 'right'} panel`);
      }
      
      return geometry;
    };

    // Create separate textures for each panel
    const leftTexture = createRoofTexture('left');
    const rightTexture = createRoofTexture('right');
    
    // Special material properties for white vs other colors
    const isWhite = color === '#FFFFFF';
    const materialProps = isWhite ? {
      metalness: 0.3,
      roughness: 0.6,
      envMapIntensity: 0.8,
    } : {
      metalness: 0.7,
      roughness: 0.3,
      envMapIntensity: 0.5,
    };
    
    // 🎯 CREATE GEOMETRIES WITH CORRECTED UV MAPPING
    const leftGeometry = createRoofGeometry(true);
    const rightGeometry = createRoofGeometry(false);
    
    // Create separate materials with ENHANCED ribbed texture
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
    
    console.log(`🎯 ROOF MATERIALS CREATED: Both panels have ENHANCED ribbed textures with corrected UV mapping`);
    
    return { 
      leftRoofGeometry: leftGeometry,
      rightRoofGeometry: rightGeometry,
      leftRoofMaterial: leftMaterial, 
      rightRoofMaterial: rightMaterial 
    };
  }, [color, length, width, panelLength]); // Removed skylights dependency - ribs are always preserved

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
    
    // Position the skylight to sit ON TOP of the ribbed roof surface
    const skylightX = localX;
    const skylightY = 0.15; // Position ABOVE the roof surface to show as overlay
    const skylightZ = localY;
    
    console.log(`🪟 Creating skylight overlay on ${isLeftPanel ? 'left' : 'right'} panel at (${skylightX.toFixed(2)}, ${skylightY}, ${skylightZ.toFixed(2)}) - RIBS PRESERVED UNDERNEATH`);
    
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
      {/* Left roof panel with ALWAYS PRESERVED ribbed texture */}
      <group 
        position={[-width / 4, roofHeight / 2, 0]}
        rotation={[0, 0, pitchAngle]}
      >
        <mesh castShadow receiveShadow>
          <primitive object={leftRoofGeometry} />
          <primitive object={leftRoofMaterial} attach="material" />
        </mesh>
        
        {/* Skylights positioned as OVERLAYS on top of ribbed surface */}
        {skylights
          .filter(s => s.panel === 'left')
          .map(s => createSkylight(s, true))
          .filter(Boolean) // Remove null skylights
        }
      </group>
      
      {/* Right roof panel with ALWAYS PRESERVED ribbed texture */}
      <group
        position={[width / 4, roofHeight / 2, 0]}
        rotation={[0, 0, -pitchAngle]}
      >
        <mesh castShadow receiveShadow>
          <primitive object={rightRoofGeometry} />
          <primitive object={rightRoofMaterial} attach="material" />
        </mesh>
        
        {/* Skylights positioned as OVERLAYS on top of ribbed surface */}
        {skylights
          .filter(s => s.panel === 'right')
          .map(s => createSkylight(s, false))
          .filter(Boolean) // Remove null skylights
        }
      </group>
      
      {/* Ridge cap with special white handling and ribbed texture */}
      <mesh 
        position={[0, roofHeight, 0]} 
        castShadow 
        receiveShadow
      >
        <boxGeometry args={[0.4, 0.3, length]} />
        <meshStandardMaterial 
          color={color} 
          metalness={color === '#FFFFFF' ? 0.2 : 0.8} 
          roughness={color === '#FFFFFF' ? 0.7 : 0.2}
          envMapIntensity={color === '#FFFFFF' ? 0.6 : 1.0}
        />
      </mesh>
    </group>
  );
};

export default Roof;