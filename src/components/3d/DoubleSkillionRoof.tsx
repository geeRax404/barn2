import React, { useMemo } from 'react';
import * as THREE from 'three';
import type { Skylight } from '../../types';

interface DoubleSkillionRoofProps {
  width: number;
  length: number;
  height: number;
  pitch: number;
  color: string;
  skylights?: Skylight[];
  wallProfile?: string;
}

const DoubleSkillionRoof: React.FC<DoubleSkillionRoofProps> = ({ 
  width, 
  length, 
  height, 
  pitch, 
  color, 
  skylights = [], 
  wallProfile = 'trimdek'
}) => {
  const roofHeight = useMemo(() => {
    // For clerestory roof, calculate the rise
    return (width * 0.3) * (pitch / 12); // 30% of width for the rise section
  }, [width, pitch]);

  // Create roof materials and geometries for clerestory/monitor roof
  const { lowerRoofGeometry, upperRoofGeometry, roofMaterial } = useMemo(() => {
    // Create enhanced roof profile texture
    const createClerestoryRoofTexture = () => {
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
        
        // Profile-specific patterns
        let ribWidth: number;
        let ribSpacing: number;
        let profileType: string;
        
        switch (wallProfile) {
          case 'trimdek':
            ribWidth = textureWidth / 3;
            ribSpacing = ribWidth * 1.05;
            profileType = 'trapezoidal';
            break;
            
          case 'customorb':
            ribWidth = textureWidth / 6;
            ribSpacing = ribWidth * 1.1;
            profileType = 'curved';
            break;
            
          default:
            ribWidth = textureWidth / 3;
            ribSpacing = ribWidth * 1.05;
            profileType = 'trapezoidal';
        }
        
        // Enhanced contrast for better roof visibility
        const isWhite = color === '#FFFFFF';
        const isDark = ['#1F2937', '#374151', '#4B5563'].includes(color);
        
        const shadowOpacity = isWhite ? 0.5 : isDark ? 0.8 : 0.65;
        const highlightOpacity = isWhite ? 0.4 : isDark ? 1.0 : 0.6;
        const deepShadowOpacity = isWhite ? 0.7 : isDark ? 1.0 : 0.85;
        const brightHighlightOpacity = isWhite ? 0.6 : isDark ? 1.0 : 0.8;
        
        console.log(`🏗️ CREATING CLERESTORY ROOF ${wallProfile.toUpperCase()} PROFILE: ${profileType}`);
        
        // Create profile-specific patterns
        for (let x = 0; x < textureWidth; x += ribSpacing) {
          if (profileType === 'curved') {
            // CUSTOMORB - curved profile
            const curveGradient = ctx.createLinearGradient(x, 0, x + ribWidth, 0);
            curveGradient.addColorStop(0, `rgba(0,0,0,${deepShadowOpacity})`);
            curveGradient.addColorStop(0.15, `rgba(0,0,0,${shadowOpacity})`);
            curveGradient.addColorStop(0.35, `rgba(255,255,255,${highlightOpacity * 0.5})`);
            curveGradient.addColorStop(0.5, `rgba(255,255,255,${brightHighlightOpacity})`);
            curveGradient.addColorStop(0.65, `rgba(255,255,255,${highlightOpacity * 0.5})`);
            curveGradient.addColorStop(0.85, `rgba(0,0,0,${shadowOpacity})`);
            curveGradient.addColorStop(1, `rgba(0,0,0,${deepShadowOpacity})`);
            
            ctx.fillStyle = curveGradient;
            ctx.fillRect(x, 0, ribWidth, textureHeight);
            
          } else if (profileType === 'trapezoidal') {
            // TRIMDEK - trapezoidal profile
            ctx.fillStyle = `rgba(0,0,0,${deepShadowOpacity})`;
            ctx.fillRect(x, 0, ribWidth * 0.15, textureHeight);
            
            const riseGradient = ctx.createLinearGradient(x + ribWidth * 0.15, 0, x + ribWidth * 0.4, 0);
            riseGradient.addColorStop(0, `rgba(0,0,0,${shadowOpacity})`);
            riseGradient.addColorStop(0.5, `rgba(0,0,0,${shadowOpacity * 0.5})`);
            riseGradient.addColorStop(1, `rgba(255,255,255,${highlightOpacity})`);
            ctx.fillStyle = riseGradient;
            ctx.fillRect(x + ribWidth * 0.15, 0, ribWidth * 0.25, textureHeight);
            
            ctx.fillStyle = `rgba(255,255,255,${brightHighlightOpacity})`;
            ctx.fillRect(x + ribWidth * 0.4, 0, ribWidth * 0.2, textureHeight);
            
            const fallGradient = ctx.createLinearGradient(x + ribWidth * 0.6, 0, x + ribWidth * 0.85, 0);
            fallGradient.addColorStop(0, `rgba(255,255,255,${highlightOpacity})`);
            fallGradient.addColorStop(0.5, `rgba(0,0,0,${shadowOpacity * 0.5})`);
            fallGradient.addColorStop(1, `rgba(0,0,0,${shadowOpacity})`);
            ctx.fillStyle = fallGradient;
            ctx.fillRect(x + ribWidth * 0.6, 0, ribWidth * 0.25, textureHeight);
            
            ctx.fillStyle = `rgba(0,0,0,${deepShadowOpacity})`;
            ctx.fillRect(x + ribWidth * 0.85, 0, ribWidth * 0.15, textureHeight);
          }
          
          // Add definition lines
          ctx.fillStyle = `rgba(255,255,255,${brightHighlightOpacity * 1.8})`;
          ctx.fillRect(x + ribWidth * 0.48, 0, 6, textureHeight);
          
          ctx.fillStyle = `rgba(0,0,0,${deepShadowOpacity * 1.5})`;
          ctx.fillRect(x + ribWidth * 0.02, 0, 4, textureHeight);
          ctx.fillRect(x + ribWidth * 0.98, 0, 4, textureHeight);
        }
        
        // Add horizontal panel lines
        const panelHeight = textureHeight / 4;
        ctx.strokeStyle = `rgba(0,0,0,${shadowOpacity * 1.5})`;
        ctx.lineWidth = 5;
        for (let y = panelHeight; y < textureHeight; y += panelHeight) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(textureWidth, y);
          ctx.stroke();
          
          ctx.strokeStyle = `rgba(255,255,255,${highlightOpacity * 0.8})`;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(0, y - 3);
          ctx.lineTo(textureWidth, y - 3);
          ctx.stroke();
          ctx.strokeStyle = `rgba(0,0,0,${shadowOpacity * 1.5})`;
          ctx.lineWidth = 5;
        }
        
        // Enhanced weathering for non-white colors
        if (!isWhite) {
          ctx.globalAlpha = 0.12;
          for (let i = 0; i < 75; i++) {
            const wx = Math.random() * textureWidth;
            const wy = Math.random() * textureHeight;
            const wsize = Math.random() * 8 + 3;
            ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)';
            ctx.fillRect(wx, wy, wsize, wsize * 0.6);
          }
          ctx.globalAlpha = 1.0;
        }
        
        console.log(`✅ CLERESTORY ROOF ${wallProfile.toUpperCase()} PROFILE TEXTURE CREATED`);
      }
      
      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      
      // Texture scaling for clerestory roof
      let scaleX = width / 4;
      let scaleY = length / 3;
      
      if (wallProfile === 'customorb') {
        scaleX = width / 3;
        scaleY = length / 2;
      }
      
      texture.repeat.set(scaleX, scaleY);
      
      return texture;
    };

    const roofTexture = createClerestoryRoofTexture();
    
    // Material properties for matte finish
    const isWhite = color === '#FFFFFF';
    const isDark = ['#1F2937', '#374151', '#4B5563'].includes(color);
    
    const materialProps = isWhite ? {
      metalness: 0.1,
      roughness: 0.8,
      envMapIntensity: 0.3,
    } : isDark ? {
      metalness: 0.2,
      roughness: 0.7,
      envMapIntensity: 0.4,
    } : {
      metalness: 0.15,
      roughness: 0.75,
      envMapIntensity: 0.35,
    };
    
    const material = new THREE.MeshStandardMaterial({
      map: roofTexture,
      ...materialProps,
      side: THREE.DoubleSide,
    });

    // Create clerestory roof geometries - lower slope and upper slope
    console.log(`🏗️ Creating CLERESTORY ROOF: ${width}ft × ${length}ft, ${pitch}:12 pitch`);
    
    // Lower roof slope - slopes DOWN from center to left edge
    const lowerPlaneGeometry = new THREE.PlaneGeometry(width * 0.4, length, 32, 32);
    const lowerPositions = lowerPlaneGeometry.attributes.position.array as Float32Array;
    
    // Modify vertices for lower slope (HIGH at center, LOW at left edge)
    for (let i = 0; i < lowerPositions.length; i += 3) {
      const x = lowerPositions[i];     // X coordinate
      const y = lowerPositions[i + 1]; // Y coordinate (will become Z after rotation)
      const z = lowerPositions[i + 2]; // Z coordinate (will become Y after rotation)
      
      // Calculate height based on X position for lower slope
      // X ranges from -width*0.2 to 0 (left portion)
      // Height should be roofHeight at center (x=0) and 0 at left edge (x=-width*0.2)
      const normalizedX = (x + width * 0.2) / (width * 0.2); // 0 to 1
      const heightAtX = normalizedX * roofHeight;
      lowerPositions[i + 2] = heightAtX;
    }
    
    lowerPlaneGeometry.attributes.position.needsUpdate = true;
    lowerPlaneGeometry.computeVertexNormals();
    lowerPlaneGeometry.rotateX(-Math.PI / 2);
    
    // Upper roof slope - slopes DOWN from right edge to center
    const upperPlaneGeometry = new THREE.PlaneGeometry(width * 0.4, length, 32, 32);
    const upperPositions = upperPlaneGeometry.attributes.position.array as Float32Array;
    
    // Modify vertices for upper slope (LOW at center, HIGH at right edge)
    for (let i = 0; i < upperPositions.length; i += 3) {
      const x = upperPositions[i];     // X coordinate
      const y = upperPositions[i + 1]; // Y coordinate (will become Z after rotation)
      const z = upperPositions[i + 2]; // Z coordinate (will become Y after rotation)
      
      // Calculate height based on X position for upper slope
      // X ranges from 0 to width*0.2 (right portion)
      // Height should be roofHeight at center (x=0) and 0 at right edge (x=width*0.2)
      const normalizedX = 1 - (x / (width * 0.2)); // 1 to 0
      const heightAtX = normalizedX * roofHeight;
      upperPositions[i + 2] = heightAtX;
    }
    
    upperPlaneGeometry.attributes.position.needsUpdate = true;
    upperPlaneGeometry.computeVertexNormals();
    upperPlaneGeometry.rotateX(-Math.PI / 2);
    
    return { 
      lowerRoofGeometry: lowerPlaneGeometry,
      upperRoofGeometry: upperPlaneGeometry,
      roofMaterial: material 
    };
  }, [color, length, width, roofHeight, wallProfile, pitch]);

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

  const createSkylight = (skylight: Skylight, index: number) => {
    // Calculate position on the appropriate sloping plane
    const skylightX = skylight.xOffset;
    const skylightZ = skylight.yOffset;
    
    // Determine height based on position and which slope
    let heightAtX = 0;
    if (skylightX < 0) {
      // On lower slope
      const normalizedX = (skylightX + width * 0.2) / (width * 0.2);
      heightAtX = normalizedX * roofHeight;
    } else {
      // On upper slope
      const normalizedX = 1 - (skylightX / (width * 0.2));
      heightAtX = normalizedX * roofHeight;
    }
    
    const skylightY = heightAtX + 0.05; // Slightly above the roof surface
    
    return (
      <mesh
        key={`clerestory-skylight-${index}`}
        position={[skylightX, skylightY, skylightZ]}
        rotation={[0, 0, 0]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[skylight.width, 0.1, skylight.length]} />
        <primitive object={skylightMaterial} attach="material" />
      </mesh>
    );
  };
  
  return (
    <group position={[0, height, 0]}>
      {/* Lower sloping roof surface - slopes DOWN from center to left edge */}
      <mesh position={[-width * 0.2, 0, 0]} castShadow receiveShadow>
        <primitive object={lowerRoofGeometry} />
        <primitive object={roofMaterial} attach="material" />
      </mesh>
      
      {/* Upper sloping roof surface - slopes DOWN from right edge to center */}
      <mesh position={[width * 0.2, 0, 0]} castShadow receiveShadow>
        <primitive object={upperRoofGeometry} />
        <primitive object={roofMaterial} attach="material" />
      </mesh>
      
      {/* Vertical clerestory wall section in the middle */}
      <mesh 
        position={[0, roofHeight/2, 0]} 
        castShadow 
        receiveShadow
      >
        <boxGeometry args={[width * 0.2, roofHeight, length]} />
        <meshStandardMaterial 
          color={color} 
          metalness={0.15}
          roughness={0.75}
          envMapIntensity={0.35}
        />
      </mesh>
      
      {/* Skylights for clerestory roof */}
      {skylights.map((skylight, index) => createSkylight(skylight, index))}
      
      {/* Edge trim for both slopes */}
      <mesh 
        position={[-width * 0.4, 0, 0]} 
        castShadow 
        receiveShadow
      >
        <boxGeometry args={[0.2, 0.3, length]} />
        <meshStandardMaterial 
          color={color} 
          metalness={0.15}
          roughness={0.75}
          envMapIntensity={0.35}
        />
      </mesh>
      
      <mesh 
        position={[width * 0.4, 0, 0]} 
        castShadow 
        receiveShadow
      >
        <boxGeometry args={[0.2, 0.3, length]} />
        <meshStandardMaterial 
          color={color} 
          metalness={0.15}
          roughness={0.75}
          envMapIntensity={0.35}
        />
      </mesh>
      
      {/* Top edge trim for clerestory wall */}
      <mesh 
        position={[0, roofHeight, 0]} 
        castShadow 
        receiveShadow
      >
        <boxGeometry args={[width * 0.2, 0.3, length]} />
        <meshStandardMaterial 
          color={color} 
          metalness={0.15}
          roughness={0.75}
          envMapIntensity={0.35}
        />
      </mesh>
    </group>
  );
};

export default DoubleSkillionRoof;