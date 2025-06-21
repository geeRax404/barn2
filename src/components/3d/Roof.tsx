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
  wallProfile?: string;
  roofType?: 'gable' | 'skillion';
}

const Roof: React.FC<RoofProps> = ({ 
  width, 
  length, 
  height, 
  pitch, 
  color, 
  skylights = [], 
  wallProfile = 'trimdek',
  roofType = 'gable'
}) => {
  const roofHeight = useMemo(() => {
    return (width / 2) * (pitch / 12);
  }, [width, pitch]);
  
  const pitchAngle = Math.atan2(roofHeight, width / 2);

  // Create roof materials and geometries with ENHANCED PROFILE-SPECIFIC TEXTURES
  const { roofGeometry, roofMaterial } = useMemo(() => {
    // 🎯 ENHANCED ROOF PROFILE-SPECIFIC TEXTURE GENERATION
    const createEnhancedRoofProfileTexture = () => {
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
        
        // 🏗️ ENHANCED ROOF PROFILE-SPECIFIC PATTERNS
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
        
        // ENHANCED contrast for better roof visibility
        const isWhite = color === '#FFFFFF';
        const isDark = ['#1F2937', '#374151', '#4B5563'].includes(color);
        
        const shadowOpacity = isWhite ? 0.5 : isDark ? 0.8 : 0.65;
        const highlightOpacity = isWhite ? 0.4 : isDark ? 1.0 : 0.6;
        const deepShadowOpacity = isWhite ? 0.7 : isDark ? 1.0 : 0.85;
        const brightHighlightOpacity = isWhite ? 0.6 : isDark ? 1.0 : 0.8;
        
        console.log(`🏗️ CREATING ENHANCED ${wallProfile.toUpperCase()} ROOF PROFILE: ${profileType}`);
        
        // Create ENHANCED profile-specific patterns
        for (let x = 0; x < textureWidth; x += ribSpacing) {
          if (profileType === 'curved') {
            // CUSTOMORB - ENHANCED curved profile
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
            // TRIMDEK - ENHANCED trapezoidal profile
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
          
          // Add ENHANCED definition lines
          ctx.fillStyle = `rgba(255,255,255,${brightHighlightOpacity * 1.8})`;
          ctx.fillRect(x + ribWidth * 0.48, 0, 6, textureHeight);
          
          ctx.fillStyle = `rgba(0,0,0,${deepShadowOpacity * 1.5})`;
          ctx.fillRect(x + ribWidth * 0.02, 0, 4, textureHeight);
          ctx.fillRect(x + ribWidth * 0.98, 0, 4, textureHeight);
        }
        
        // Add horizontal panel lines
        const panelHeight = textureHeight / 3;
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
        
        console.log(`✅ ENHANCED ${wallProfile.toUpperCase()} ROOF PROFILE TEXTURE CREATED`);
      }
      
      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      
      // Texture scaling based on roof type
      let scaleX: number;
      let scaleY: number;
      
      if (roofType === 'skillion') {
        // For skillion roofs, scale across the full width
        scaleX = width / 3;
        scaleY = length / 3;
      } else {
        // For gable roofs, scale per panel
        const panelLength = Math.sqrt(Math.pow(width/2, 2) + Math.pow(roofHeight, 2));
        scaleX = panelLength / 3;
        scaleY = length / 3;
      }
      
      texture.repeat.set(scaleX, scaleY);
      
      return texture;
    };

    const roofTexture = createEnhancedRoofProfileTexture();
    
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

    // Create geometry based on roof type
    let geometry: THREE.BufferGeometry;
    
    if (roofType === 'skillion') {
      // SKILLION ROOF: Single sloping plane
      console.log(`🏗️ Creating SKILLION roof: ${width}ft × ${length}ft, ${pitch}:12 pitch`);
      
      // Create a single sloping plane
      const planeGeometry = new THREE.PlaneGeometry(width, length);
      
      // Get the position array to modify vertices
      const positions = planeGeometry.attributes.position.array as Float32Array;
      
      // Modify vertices to create the slope
      // The plane is initially flat in XY plane, we need to slope it along X-axis
      for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i];     // X coordinate
        const y = positions[i + 1]; // Y coordinate (will become Z after rotation)
        const z = positions[i + 2]; // Z coordinate (will become Y after rotation)
        
        // Calculate height based on X position and pitch
        // X ranges from -width/2 to +width/2
        // Height should be 0 at -width/2 (low side) and roofHeight at +width/2 (high side)
        const heightAtX = ((x + width/2) / width) * roofHeight;
        positions[i + 2] = heightAtX; // Set Z (height) based on X position
      }
      
      // Update the geometry
      planeGeometry.attributes.position.needsUpdate = true;
      planeGeometry.computeVertexNormals();
      
      // Rotate to align with roof orientation (XZ plane)
      planeGeometry.rotateX(-Math.PI / 2);
      
      geometry = planeGeometry;
      
    } else {
      // GABLE ROOF: Two sloping panels (existing implementation)
      console.log(`🏗️ Creating GABLE roof: ${width}ft × ${length}ft, ${pitch}:12 pitch`);
      
      // Create combined geometry for both panels
      const leftPanelGeometry = new THREE.BoxGeometry(
        Math.sqrt(Math.pow(width/2, 2) + Math.pow(roofHeight, 2)), 
        0.2, 
        length
      );
      const rightPanelGeometry = new THREE.BoxGeometry(
        Math.sqrt(Math.pow(width/2, 2) + Math.pow(roofHeight, 2)), 
        0.2, 
        length
      );
      
      // Position and rotate panels
      leftPanelGeometry.translate(-width/4, roofHeight/2, 0);
      leftPanelGeometry.rotateZ(pitchAngle);
      
      rightPanelGeometry.translate(width/4, roofHeight/2, 0);
      rightPanelGeometry.rotateZ(-pitchAngle);
      
      // Merge geometries
      const mergedGeometry = new THREE.BufferGeometry();
      const leftPositions = leftPanelGeometry.attributes.position.array;
      const rightPositions = rightPanelGeometry.attributes.position.array;
      
      const combinedPositions = new Float32Array(leftPositions.length + rightPositions.length);
      combinedPositions.set(leftPositions, 0);
      combinedPositions.set(rightPositions, leftPositions.length);
      
      mergedGeometry.setAttribute('position', new THREE.BufferAttribute(combinedPositions, 3));
      mergedGeometry.computeVertexNormals();
      
      geometry = mergedGeometry;
    }
    
    return { 
      roofGeometry: geometry,
      roofMaterial: material 
    };
  }, [color, length, width, roofHeight, skylights, wallProfile, roofType, pitch]);

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
    // For skillion roofs, position skylights on the single plane
    if (roofType === 'skillion') {
      // Calculate position on the sloping plane
      const skylightX = skylight.xOffset;
      const skylightZ = skylight.yOffset;
      
      // Calculate height at this X position
      const heightAtX = ((skylightX + width/2) / width) * roofHeight;
      const skylightY = heightAtX + 0.05; // Slightly above the roof surface
      
      return (
        <mesh
          key={`skillion-skylight-${index}`}
          position={[skylightX, skylightY, skylightZ]}
          rotation={[0, 0, 0]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[skylight.width, 0.1, skylight.length]} />
          <primitive object={skylightMaterial} attach="material" />
        </mesh>
      );
    } else {
      // Existing gable roof skylight logic
      if (skylight.panel !== 'left' && skylight.panel !== 'right') {
        return null;
      }

      const panelLength = Math.sqrt(Math.pow(width/2, 2) + Math.pow(roofHeight, 2));
      const localX = skylight.xOffset * (panelLength / (width/2));
      const localY = skylight.yOffset;
      
      const skylightX = localX;
      const skylightY = 0.05;
      const skylightZ = localY;
      
      return (
        <mesh
          key={`${skylight.panel}-skylight-${index}`}
          position={[skylightX, skylightY, skylightZ]}
          rotation={[0, 0, 0]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[skylight.width * (panelLength / (width/2)), 0.1, skylight.length]} />
          <primitive object={skylightMaterial} attach="material" />
        </mesh>
      );
    }
  };
  
  return (
    <group position={[0, height, 0]}>
      {roofType === 'skillion' ? (
        // SKILLION ROOF: Single sloping surface
        <group position={[0, 0, 0]}>
          <mesh castShadow receiveShadow>
            <primitive object={roofGeometry} />
            <primitive object={roofMaterial} attach="material" />
          </mesh>
          
          {/* Skylights for skillion roof */}
          {skylights.map((skylight, index) => createSkylight(skylight, index))}
        </group>
      ) : (
        // GABLE ROOF: Two sloping panels (existing implementation)
        <>
          <mesh castShadow receiveShadow>
            <primitive object={roofGeometry} />
            <primitive object={roofMaterial} attach="material" />
          </mesh>
          
          {/* Skylights for gable roof */}
          {skylights.map((skylight, index) => createSkylight(skylight, index))}
          
          {/* Ridge cap for gable roof */}
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
        </>
      )}
    </group>
  );
};

export default Roof;