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
    return (width / 4) * (pitch / 12); // Quarter width for each slope
  }, [width, pitch]);

  // Create roof materials and geometries for double skillion roof
  const { leftRoofGeometry, rightRoofGeometry, leftRoofMaterial, rightRoofMaterial } = useMemo(() => {
    // Create enhanced roof profile texture for double skillion roof
    const createDoubleSkillionRoofTexture = (side: 'left' | 'right') => {
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
        
        // Profile-specific patterns for double skillion roof
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
        
        console.log(`🏗️ CREATING DOUBLE SKILLION ROOF ${wallProfile.toUpperCase()} PROFILE: ${profileType} for ${side} side`);
        
        // Create profile-specific patterns running along the slope
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
        
        console.log(`✅ DOUBLE SKILLION ROOF ${wallProfile.toUpperCase()} PROFILE TEXTURE CREATED for ${side} side`);
      }
      
      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      
      // Texture scaling for double skillion roof
      let scaleX = width / 4; // Quarter width for each slope
      let scaleY = length / 3;
      
      if (wallProfile === 'customorb') {
        scaleX = width / 3;
        scaleY = length / 2;
      }
      
      texture.repeat.set(scaleX, scaleY);
      
      return texture;
    };

    const leftTexture = createDoubleSkillionRoofTexture('left');
    const rightTexture = createDoubleSkillionRoofTexture('right');
    
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

    // Create double skillion roof geometries - butterfly/inverted V shape
    console.log(`🏗️ Creating DOUBLE SKILLION roof: ${width}ft × ${length}ft, ${pitch}:12 pitch`);
    
    // Left slope - slopes down from center to left edge
    const leftPlaneGeometry = new THREE.PlaneGeometry(width/2, length, 16, 16);
    const leftPositions = leftPlaneGeometry.attributes.position.array as Float32Array;
    
    // Modify vertices for left slope (high at center, low at left edge)
    for (let i = 0; i < leftPositions.length; i += 3) {
      const x = leftPositions[i];     // X coordinate
      const y = leftPositions[i + 1]; // Y coordinate (will become Z after rotation)
      const z = leftPositions[i + 2]; // Z coordinate (will become Y after rotation)
      
      // Calculate height based on X position for left slope
      // X ranges from -width/4 to 0 (left half)
      // Height should be roofHeight at center (x=0) and 0 at left edge (x=-width/4)
      const heightAtX = ((x + width/4) / (width/4)) * roofHeight;
      leftPositions[i + 2] = heightAtX;
    }
    
    leftPlaneGeometry.attributes.position.needsUpdate = true;
    leftPlaneGeometry.computeVertexNormals();
    leftPlaneGeometry.rotateX(-Math.PI / 2);
    
    // Right slope - slopes down from center to right edge
    const rightPlaneGeometry = new THREE.PlaneGeometry(width/2, length, 16, 16);
    const rightPositions = rightPlaneGeometry.attributes.position.array as Float32Array;
    
    // Modify vertices for right slope (high at center, low at right edge)
    for (let i = 0; i < rightPositions.length; i += 3) {
      const x = rightPositions[i];     // X coordinate
      const y = rightPositions[i + 1]; // Y coordinate (will become Z after rotation)
      const z = rightPositions[i + 2]; // Z coordinate (will become Y after rotation)
      
      // Calculate height based on X position for right slope
      // X ranges from 0 to width/4 (right half)
      // Height should be roofHeight at center (x=0) and 0 at right edge (x=width/4)
      const heightAtX = ((width/4 - x) / (width/4)) * roofHeight;
      rightPositions[i + 2] = heightAtX;
    }
    
    rightPlaneGeometry.attributes.position.needsUpdate = true;
    rightPlaneGeometry.computeVertexNormals();
    rightPlaneGeometry.rotateX(-Math.PI / 2);
    
    return { 
      leftRoofGeometry: leftPlaneGeometry,
      rightRoofGeometry: rightPlaneGeometry,
      leftRoofMaterial: leftMaterial, 
      rightRoofMaterial: rightMaterial 
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
    
    // Determine which slope this skylight is on and calculate height
    let heightAtX: number;
    if (skylightX < 0) {
      // Left slope
      heightAtX = ((skylightX + width/4) / (width/4)) * roofHeight;
    } else {
      // Right slope
      heightAtX = ((width/4 - skylightX) / (width/4)) * roofHeight;
    }
    
    const skylightY = heightAtX + 0.05; // Slightly above the roof surface
    
    return (
      <mesh
        key={`double-skillion-skylight-${index}`}
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
      {/* Left sloping roof surface */}
      <mesh position={[-width/4, 0, 0]} castShadow receiveShadow>
        <primitive object={leftRoofGeometry} />
        <primitive object={leftRoofMaterial} attach="material" />
      </mesh>
      
      {/* Right sloping roof surface */}
      <mesh position={[width/4, 0, 0]} castShadow receiveShadow>
        <primitive object={rightRoofGeometry} />
        <primitive object={rightRoofMaterial} attach="material" />
      </mesh>
      
      {/* Skylights for double skillion roof */}
      {skylights.map((skylight, index) => createSkylight(skylight, index))}
      
      {/* Valley gutter at the center where the two slopes meet */}
      <mesh 
        position={[0, roofHeight/2, 0]} 
        castShadow 
        receiveShadow
      >
        <boxGeometry args={[0.3, 0.2, length]} />
        <meshStandardMaterial 
          color="#B8B8B8" // Galvanized steel color for gutter
          metalness={0.8}
          roughness={0.3}
          envMapIntensity={1.0}
        />
      </mesh>
      
      {/* Edge trim for both slopes */}
      <mesh 
        position={[-width/2, roofHeight/4, 0]} 
        castShadow 
        receiveShadow
      >
        <boxGeometry args={[0.2, 0.3, length]} />
        <meshStandardMaterial 
          color={color} 
          metalness={materialProps.metalness}
          roughness={materialProps.roughness}
          envMapIntensity={materialProps.envMapIntensity}
        />
      </mesh>
      
      <mesh 
        position={[width/2, roofHeight/4, 0]} 
        castShadow 
        receiveShadow
      >
        <boxGeometry args={[0.2, 0.3, length]} />
        <meshStandardMaterial 
          color={color} 
          metalness={materialProps.metalness}
          roughness={materialProps.roughness}
          envMapIntensity={materialProps.envMapIntensity}
        />
      </mesh>
    </group>
  );
};

export default DoubleSkillionRoof;