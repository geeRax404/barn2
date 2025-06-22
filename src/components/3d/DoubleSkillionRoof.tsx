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
    // For clerestory roof, calculate the rise of the monitor section
    return (width * 0.15) * (pitch / 12); // 15% of width for the monitor rise
  }, [width, pitch]);

  // Create roof materials and geometries for clerestory/monitor roof
  const { leftRoofGeometry, rightRoofGeometry, monitorRoofLeftGeometry, monitorRoofRightGeometry, roofMaterial } = useMemo(() => {
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

    // Create clerestory roof geometries - main roof and monitor section
    console.log(`🏗️ Creating CLERESTORY ROOF: ${width}ft × ${length}ft, ${pitch}:12 pitch`);
    
    // Calculate dimensions
    const monitorWidth = width * 0.3; // Monitor section is 30% of total width
    const mainRoofWidth = (width - monitorWidth) / 2; // Each main roof section
    const pitchAngle = Math.atan2(roofHeight, mainRoofWidth);
    const roofPanelLength = Math.sqrt(Math.pow(mainRoofWidth, 2) + Math.pow(roofHeight, 2));
    
    // Left main roof - slopes UP from left edge to monitor
    const leftGeometry = new THREE.BoxGeometry(roofPanelLength, 0.2, length);
    
    // Right main roof - slopes UP from right edge to monitor  
    const rightGeometry = new THREE.BoxGeometry(roofPanelLength, 0.2, length);
    
    // Monitor roof left - slopes DOWN from monitor peak to left
    const monitorLeftGeometry = new THREE.BoxGeometry(monitorWidth/2, 0.2, length);
    
    // Monitor roof right - slopes DOWN from monitor peak to right
    const monitorRightGeometry = new THREE.BoxGeometry(monitorWidth/2, 0.2, length);
    
    return { 
      leftRoofGeometry: leftGeometry,
      rightRoofGeometry: rightGeometry,
      monitorRoofLeftGeometry: monitorLeftGeometry,
      monitorRoofRightGeometry: monitorRightGeometry,
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
    
    // Position skylight slightly above the roof surface
    const skylightY = roofHeight + 0.05;
    
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

  // Calculate positions and angles
  const monitorWidth = width * 0.3;
  const mainRoofWidth = (width - monitorWidth) / 2;
  const pitchAngle = Math.atan2(roofHeight, mainRoofWidth);
  const roofPanelLength = Math.sqrt(Math.pow(mainRoofWidth, 2) + Math.pow(roofHeight, 2));
  
  return (
    <group position={[0, height, 0]}>
      {/* Left main roof - slopes UP from left edge to monitor */}
      <group 
        position={[-width/2 + mainRoofWidth/2, roofHeight/2, 0]}
        rotation={[0, 0, pitchAngle]}
      >
        <mesh castShadow receiveShadow>
          <primitive object={leftRoofGeometry} />
          <primitive object={roofMaterial} attach="material" />
        </mesh>
      </group>
      
      {/* Right main roof - slopes UP from right edge to monitor */}
      <group 
        position={[width/2 - mainRoofWidth/2, roofHeight/2, 0]}
        rotation={[0, 0, -pitchAngle]}
      >
        <mesh castShadow receiveShadow>
          <primitive object={rightRoofGeometry} />
          <primitive object={roofMaterial} attach="material" />
        </mesh>
      </group>
      
      {/* Monitor section roof - left side slopes DOWN */}
      <group 
        position={[-monitorWidth/4, roofHeight + roofHeight/4, 0]}
        rotation={[0, 0, -pitchAngle/2]}
      >
        <mesh castShadow receiveShadow>
          <primitive object={monitorRoofLeftGeometry} />
          <primitive object={roofMaterial} attach="material" />
        </mesh>
      </group>
      
      {/* Monitor section roof - right side slopes DOWN */}
      <group 
        position={[monitorWidth/4, roofHeight + roofHeight/4, 0]}
        rotation={[0, 0, pitchAngle/2]}
      >
        <mesh castShadow receiveShadow>
          <primitive object={monitorRoofRightGeometry} />
          <primitive object={roofMaterial} attach="material" />
        </mesh>
      </group>
      
      {/* Vertical clerestory/monitor walls with windows */}
      <mesh 
        position={[-monitorWidth/2, roofHeight + roofHeight/2, 0]} 
        castShadow 
        receiveShadow
      >
        <boxGeometry args={[0.2, roofHeight, length]} />
        <meshStandardMaterial 
          color={color} 
          metalness={0.15}
          roughness={0.75}
          envMapIntensity={0.35}
        />
      </mesh>
      
      <mesh 
        position={[monitorWidth/2, roofHeight + roofHeight/2, 0]} 
        castShadow 
        receiveShadow
      >
        <boxGeometry args={[0.2, roofHeight, length]} />
        <meshStandardMaterial 
          color={color} 
          metalness={0.15}
          roughness={0.75}
          envMapIntensity={0.35}
        />
      </mesh>
      
      {/* Clerestory windows for natural lighting */}
      <mesh 
        position={[-monitorWidth/2 - 0.1, roofHeight + roofHeight/2, 0]} 
        castShadow 
        receiveShadow
      >
        <boxGeometry args={[0.05, roofHeight * 0.8, length * 0.8]} />
        <meshStandardMaterial 
          color="#87CEEB" 
          transparent 
          opacity={0.4} 
          metalness={0.2}
          roughness={0}
        />
      </mesh>
      
      <mesh 
        position={[monitorWidth/2 + 0.1, roofHeight + roofHeight/2, 0]} 
        castShadow 
        receiveShadow
      >
        <boxGeometry args={[0.05, roofHeight * 0.8, length * 0.8]} />
        <meshStandardMaterial 
          color="#87CEEB" 
          transparent 
          opacity={0.4} 
          metalness={0.2}
          roughness={0}
        />
      </mesh>
      
      {/* Skylights for clerestory roof */}
      {skylights.map((skylight, index) => createSkylight(skylight, index))}
      
      {/* Ridge caps and trim */}
      <mesh 
        position={[0, roofHeight + roofHeight/2, 0]} 
        castShadow 
        receiveShadow
      >
        <boxGeometry args={[0.4, 0.3, length]} />
        <meshStandardMaterial 
          color={color} 
          metalness={0.15}
          roughness={0.75}
          envMapIntensity={0.35}
        />
      </mesh>
      
      {/* Edge trim for main roof sections */}
      <mesh 
        position={[-width/2, 0, 0]} 
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
        position={[width/2, 0, 0]} 
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
    </group>
  );
};

export default DoubleSkillionRoof;