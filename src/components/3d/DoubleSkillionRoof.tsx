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
    // For double skillion (butterfly) roof, calculate the rise following construction plan
    return (width / 4) * (pitch / 12); // Quarter width for each slope as per construction plan
  }, [width, pitch]);

  // Create roof materials and geometries for double skillion (butterfly) roof following construction plan
  const { leftRoofGeometry, rightRoofGeometry, valleyBeamGeometry, roofMaterial } = useMemo(() => {
    // Create enhanced roof profile texture following construction specifications
    const createDoubleSkillionRoofTexture = () => {
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
        
        // Profile-specific patterns following construction plan specifications
        let ribWidth: number;
        let ribSpacing: number;
        let profileType: string;
        
        switch (wallProfile) {
          case 'trimdek':
            // Trimdek profile as specified in construction plan
            ribWidth = textureWidth / 3;
            ribSpacing = ribWidth * 1.05;
            profileType = 'trapezoidal';
            break;
            
          case 'customorb':
            // Custom Orb profile as alternative in construction plan
            ribWidth = textureWidth / 6;
            ribSpacing = ribWidth * 1.1;
            profileType = 'curved';
            break;
            
          default:
            ribWidth = textureWidth / 3;
            ribSpacing = ribWidth * 1.05;
            profileType = 'trapezoidal';
        }
        
        // Enhanced contrast for better roof visibility following construction standards
        const isWhite = color === '#FFFFFF';
        const isDark = ['#1F2937', '#374151', '#4B5563'].includes(color);
        
        const shadowOpacity = isWhite ? 0.5 : isDark ? 0.8 : 0.65;
        const highlightOpacity = isWhite ? 0.4 : isDark ? 1.0 : 0.6;
        const deepShadowOpacity = isWhite ? 0.7 : isDark ? 1.0 : 0.85;
        const brightHighlightOpacity = isWhite ? 0.6 : isDark ? 1.0 : 0.8;
        
        console.log(`🏗️ CREATING DOUBLE SKILLION ROOF ${wallProfile.toUpperCase()} PROFILE: ${profileType} (Construction Plan Applied)`);
        
        // Create profile-specific patterns for butterfly roof
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
            // TRIMDEK - trapezoidal profile as per construction specifications
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
          
          // Add definition lines for construction detail accuracy
          ctx.fillStyle = `rgba(255,255,255,${brightHighlightOpacity * 1.8})`;
          ctx.fillRect(x + ribWidth * 0.48, 0, 6, textureHeight);
          
          ctx.fillStyle = `rgba(0,0,0,${deepShadowOpacity * 1.5})`;
          ctx.fillRect(x + ribWidth * 0.02, 0, 4, textureHeight);
          ctx.fillRect(x + ribWidth * 0.98, 0, 4, textureHeight);
        }
        
        // Add horizontal panel lines representing construction joints
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
        
        // Enhanced weathering for construction realism
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
        
        console.log(`✅ DOUBLE SKILLION ROOF ${wallProfile.toUpperCase()} PROFILE TEXTURE CREATED (Construction Standards Applied)`);
      }
      
      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      
      // Texture scaling for double skillion roof based on construction dimensions
      let scaleX = width / 4;
      let scaleY = length / 3;
      
      if (wallProfile === 'customorb') {
        scaleX = width / 3;
        scaleY = length / 2;
      }
      
      texture.repeat.set(scaleX, scaleY);
      
      return texture;
    };

    const roofTexture = createDoubleSkillionRoofTexture();
    
    // Material properties for matte finish following construction specifications
    const isWhite = color === '#FFFFFF';
    const isDark = ['#1F2937', '#374151', '#4B5563'].includes(color);
    
    // Construction plan material properties (0.48mm BMT Colorbond steel equivalent)
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

    // Create double skillion roof geometries following construction plan specifications
    console.log(`🏗️ Creating DOUBLE SKILLION ROOF: ${width}ft × ${length}ft, ${pitch}:12 pitch (Construction Plan Applied)`);
    console.log(`📐 Roof specifications: 3:12 pitch (14.0°) each slope, butterfly valley design`);
    
    // Calculate dimensions following construction plan
    const valleyWidth = width * 0.3; // Valley section width
    const slopeWidth = (width - valleyWidth) / 2; // Each slope width
    const pitchAngle = Math.atan2(roofHeight, slopeWidth);
    const roofPanelLength = Math.sqrt(Math.pow(slopeWidth, 2) + Math.pow(roofHeight, 2));
    
    // Left slope - slopes DOWN from perimeter to valley
    const leftGeometry = new THREE.BoxGeometry(roofPanelLength, 0.2, length);
    
    // Right slope - slopes DOWN from perimeter to valley
    const rightGeometry = new THREE.BoxGeometry(roofPanelLength, 0.2, length);
    
    // Valley beam geometry (600mm x 90mm LVL equivalent)
    const valleyBeam = new THREE.BoxGeometry(2.0, 0.3, length);
    
    return { 
      leftRoofGeometry: leftGeometry,
      rightRoofGeometry: rightGeometry,
      valleyBeamGeometry: valleyBeam,
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
    // Calculate position on the appropriate sloping plane following construction guidelines
    const skylightX = skylight.xOffset;
    const skylightZ = skylight.yOffset;
    
    // Position skylight slightly above the roof surface
    const skylightY = roofHeight + 0.05;
    
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

  // Calculate positions and angles following construction plan
  const valleyWidth = width * 0.3;
  const slopeWidth = (width - valleyWidth) / 2;
  const pitchAngle = Math.atan2(roofHeight, slopeWidth);
  const roofPanelLength = Math.sqrt(Math.pow(slopeWidth, 2) + Math.pow(roofHeight, 2));
  
  return (
    <group position={[0, height, 0]}>
      {/* Left slope - slopes DOWN from perimeter to valley (Construction Plan Applied) */}
      <group 
        position={[-width/2 + slopeWidth/2, roofHeight/2, 0]}
        rotation={[0, 0, -pitchAngle]}
      >
        <mesh castShadow receiveShadow>
          <primitive object={leftRoofGeometry} />
          <primitive object={roofMaterial} attach="material" />
        </mesh>
      </group>
      
      {/* Right slope - slopes DOWN from perimeter to valley (Construction Plan Applied) */}
      <group 
        position={[width/2 - slopeWidth/2, roofHeight/2, 0]}
        rotation={[0, 0, pitchAngle]}
      >
        <mesh castShadow receiveShadow>
          <primitive object={rightRoofGeometry} />
          <primitive object={roofMaterial} attach="material" />
        </mesh>
      </group>
      
      {/* Valley beam (600mm x 90mm LVL as per construction plan) */}
      <mesh 
        position={[0, -roofHeight, 0]} 
        castShadow 
        receiveShadow
      >
        <primitive object={valleyBeamGeometry} />
        <meshStandardMaterial 
          color="#8B7355" 
          metalness={0.1}
          roughness={0.9}
          envMapIntensity={0.2}
        />
      </mesh>
      
      {/* Valley drainage system (200mm wide custom fabricated as per plan) */}
      <mesh 
        position={[0, -roofHeight - 0.2, 0]} 
        castShadow 
        receiveShadow
      >
        <boxGeometry args={[0.7, 0.3, length]} />
        <meshStandardMaterial 
          color="#B8B8B8" 
          metalness={0.8}
          roughness={0.3}
          envMapIntensity={1.0}
        />
      </mesh>
      
      {/* Support posts (200mm x 200mm F17 Hardwood as per construction plan) */}
      {Array.from({ length: Math.ceil(length / 16) }).map((_, i) => {
        const postZ = -length/2 + (i + 1) * 16;
        if (postZ >= length/2) return null;
        
        return (
          <mesh 
            key={`valley-support-post-${i}`}
            position={[0, -roofHeight/2, postZ]} 
            castShadow 
            receiveShadow
          >
            <boxGeometry args={[0.7, roofHeight, 0.7]} />
            <meshStandardMaterial 
              color="#8B7355" 
              metalness={0.1}
              roughness={0.9}
              envMapIntensity={0.2}
            />
          </mesh>
        );
      })}
      
      {/* Perimeter gutters (125mm PVC standard profile as per plan) */}
      <mesh 
        position={[-width/2 - 0.25, roofHeight - 0.1, 0]} 
        castShadow 
        receiveShadow
      >
        <boxGeometry args={[0.4, 0.3, length]} />
        <meshStandardMaterial 
          color="#B8B8B8" 
          metalness={0.8}
          roughness={0.3}
          envMapIntensity={1.0}
        />
      </mesh>
      
      <mesh 
        position={[width/2 + 0.25, roofHeight - 0.1, 0]} 
        castShadow 
        receiveShadow
      >
        <boxGeometry args={[0.4, 0.3, length]} />
        <meshStandardMaterial 
          color="#B8B8B8" 
          metalness={0.8}
          roughness={0.3}
          envMapIntensity={1.0}
        />
      </mesh>
      
      {/* Skylights for double skillion roof */}
      {skylights.map((skylight, index) => createSkylight(skylight, index))}
      
      {/* Valley flashing (400mm wide with 150mm upstands as per construction plan) */}
      <mesh 
        position={[0, -roofHeight + 0.05, 0]} 
        castShadow 
        receiveShadow
      >
        <boxGeometry args={[1.3, 0.05, length]} />
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