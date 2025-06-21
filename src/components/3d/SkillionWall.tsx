import React, { useMemo } from 'react';
import * as THREE from 'three';
import type { WallPosition, WallFeature, BeamSegment, WallProfile } from '../../types';
import { generateBeamPositions, generateHorizontalBeamPositions } from '../../utils/collisionDetection';

interface SkillionWallProps {
  position: [number, number, number];
  width: number;
  height: number;
  color: string;
  wallPosition: WallPosition;
  rotation?: [number, number, number];
  roofPitch?: number;
  wallFeatures?: WallFeature[];
  wallProfile?: WallProfile;
  buildingWidth: number; // Need this to calculate roof slope
}

const SkillionWall: React.FC<SkillionWallProps> = ({ 
  position, 
  width, 
  height, 
  color, 
  wallPosition, 
  rotation = [0, 0, 0],
  roofPitch = 0,
  wallFeatures = [],
  wallProfile = 'trimdek',
  buildingWidth
}) => {
  // Create profile-specific textured material (same as gable wall)
  const wallMaterial = useMemo(() => {
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
      
      // 🏗️ LYSAGHT PROFILE-SPECIFIC PATTERNS (same as gable wall)
      let ribWidth: number;
      let ribSpacing: number;
      let profileType: string;
      
      switch (wallProfile) {
        case 'multiclad':
          ribWidth = textureWidth / 5;
          ribSpacing = ribWidth * 1.1;
          profileType = 'deep-corrugated';
          break;
          
        case 'trimdek':
          ribWidth = textureWidth / 6;
          ribSpacing = ribWidth * 1.05;
          profileType = 'trapezoidal';
          break;
          
        case 'customorb':
          ribWidth = textureWidth / 12;
          ribSpacing = ribWidth * 1.1;
          profileType = 'curved';
          break;
          
        case 'horizontal-customorb':
          ribWidth = textureHeight / 12;
          ribSpacing = ribWidth * 1.1;
          profileType = 'horizontal-curved';
          break;
          
        default:
          ribWidth = textureWidth / 6;
          ribSpacing = ribWidth * 1.05;
          profileType = 'trapezoidal';
      }
      
      // Special handling for different colors
      const isWhite = color === '#FFFFFF';
      const isDark = ['#1F2937', '#374151', '#4B5563'].includes(color);
      
      // Profile-specific contrast values
      const shadowOpacity = isWhite ? 0.35 : isDark ? 0.6 : 0.45;
      const highlightOpacity = isWhite ? 0.25 : isDark ? 0.8 : 0.4;
      const deepShadowOpacity = isWhite ? 0.5 : isDark ? 0.9 : 0.65;
      const brightHighlightOpacity = isWhite ? 0.4 : isDark ? 1.0 : 0.6;
      
      console.log(`🏗️ CREATING SKILLION WALL ${wallProfile.toUpperCase()} PROFILE: ${profileType}`);
      
      if (profileType === 'horizontal-curved') {
        // HORIZONTAL CUSTOMORB - Horizontal ribs
        for (let y = 0; y < textureHeight; y += ribSpacing) {
          const curveGradient = ctx.createLinearGradient(0, y, 0, y + ribWidth);
          curveGradient.addColorStop(0, `rgba(0,0,0,${deepShadowOpacity})`);
          curveGradient.addColorStop(0.3, `rgba(0,0,0,${shadowOpacity * 0.5})`);
          curveGradient.addColorStop(0.5, `rgba(255,255,255,${brightHighlightOpacity})`);
          curveGradient.addColorStop(0.7, `rgba(0,0,0,${shadowOpacity * 0.5})`);
          curveGradient.addColorStop(1, `rgba(0,0,0,${deepShadowOpacity})`);
          
          ctx.fillStyle = curveGradient;
          ctx.fillRect(0, y, textureWidth, ribWidth);
          
          ctx.fillStyle = `rgba(255,255,255,${brightHighlightOpacity * 1.2})`;
          ctx.fillRect(0, y + ribWidth * 0.45, textureWidth, 2);
          
          ctx.fillStyle = `rgba(0,0,0,${deepShadowOpacity * 1.2})`;
          ctx.fillRect(0, y + 1, textureWidth, 1);
          ctx.fillRect(0, y + ribWidth - 1, textureWidth, 1);
        }
      } else {
        // VERTICAL PROFILES (Multiclad, Trimdek, CustomOrb)
        for (let x = 0; x < textureWidth; x += ribSpacing) {
          if (profileType === 'curved') {
            const curveGradient = ctx.createLinearGradient(x, 0, x + ribWidth, 0);
            curveGradient.addColorStop(0, `rgba(0,0,0,${deepShadowOpacity})`);
            curveGradient.addColorStop(0.2, `rgba(0,0,0,${shadowOpacity})`);
            curveGradient.addColorStop(0.4, `rgba(255,255,255,${highlightOpacity * 0.5})`);
            curveGradient.addColorStop(0.5, `rgba(255,255,255,${brightHighlightOpacity})`);
            curveGradient.addColorStop(0.6, `rgba(255,255,255,${highlightOpacity * 0.5})`);
            curveGradient.addColorStop(0.8, `rgba(0,0,0,${shadowOpacity})`);
            curveGradient.addColorStop(1, `rgba(0,0,0,${deepShadowOpacity})`);
            
            ctx.fillStyle = curveGradient;
            ctx.fillRect(x, 0, ribWidth, textureHeight);
            
          } else if (profileType === 'trapezoidal') {
            ctx.fillStyle = `rgba(0,0,0,${deepShadowOpacity})`;
            ctx.fillRect(x, 0, ribWidth * 0.15, textureHeight);
            
            const riseGradient = ctx.createLinearGradient(x + ribWidth * 0.15, 0, x + ribWidth * 0.4, 0);
            riseGradient.addColorStop(0, `rgba(0,0,0,${shadowOpacity})`);
            riseGradient.addColorStop(1, `rgba(255,255,255,${highlightOpacity})`);
            ctx.fillStyle = riseGradient;
            ctx.fillRect(x + ribWidth * 0.15, 0, ribWidth * 0.25, textureHeight);
            
            ctx.fillStyle = `rgba(255,255,255,${brightHighlightOpacity})`;
            ctx.fillRect(x + ribWidth * 0.4, 0, ribWidth * 0.2, textureHeight);
            
            const fallGradient = ctx.createLinearGradient(x + ribWidth * 0.6, 0, x + ribWidth * 0.85, 0);
            fallGradient.addColorStop(0, `rgba(255,255,255,${highlightOpacity})`);
            fallGradient.addColorStop(1, `rgba(0,0,0,${shadowOpacity})`);
            ctx.fillStyle = fallGradient;
            ctx.fillRect(x + ribWidth * 0.6, 0, ribWidth * 0.25, textureHeight);
            
            ctx.fillStyle = `rgba(0,0,0,${deepShadowOpacity})`;
            ctx.fillRect(x + ribWidth * 0.85, 0, ribWidth * 0.15, textureHeight);
            
          } else if (profileType === 'deep-corrugated') {
            ctx.fillStyle = `rgba(0,0,0,${deepShadowOpacity * 1.2})`;
            ctx.fillRect(x, 0, ribWidth * 0.25, textureHeight);
            
            const riseGradient = ctx.createLinearGradient(x + ribWidth * 0.25, 0, x + ribWidth * 0.45, 0);
            riseGradient.addColorStop(0, `rgba(0,0,0,${deepShadowOpacity})`);
            riseGradient.addColorStop(0.5, `rgba(0,0,0,${shadowOpacity})`);
            riseGradient.addColorStop(1, `rgba(255,255,255,${highlightOpacity})`);
            ctx.fillStyle = riseGradient;
            ctx.fillRect(x + ribWidth * 0.25, 0, ribWidth * 0.2, textureHeight);
            
            ctx.fillStyle = `rgba(255,255,255,${brightHighlightOpacity * 1.3})`;
            ctx.fillRect(x + ribWidth * 0.45, 0, ribWidth * 0.1, textureHeight);
            
            const fallGradient = ctx.createLinearGradient(x + ribWidth * 0.55, 0, x + ribWidth * 0.75, 0);
            fallGradient.addColorStop(0, `rgba(255,255,255,${highlightOpacity})`);
            fallGradient.addColorStop(0.5, `rgba(0,0,0,${shadowOpacity})`);
            fallGradient.addColorStop(1, `rgba(0,0,0,${deepShadowOpacity})`);
            ctx.fillStyle = fallGradient;
            ctx.fillRect(x + ribWidth * 0.55, 0, ribWidth * 0.2, textureHeight);
            
            ctx.fillStyle = `rgba(0,0,0,${deepShadowOpacity * 1.2})`;
            ctx.fillRect(x + ribWidth * 0.75, 0, ribWidth * 0.25, textureHeight);
          }
          
          if (profileType !== 'horizontal-curved') {
            ctx.fillStyle = `rgba(255,255,255,${brightHighlightOpacity * 1.5})`;
            ctx.fillRect(x + ribWidth * 0.49, 0, 2, textureHeight);
            
            ctx.fillStyle = `rgba(0,0,0,${deepShadowOpacity * 1.3})`;
            ctx.fillRect(x + ribWidth * 0.02, 0, 2, textureHeight);
            ctx.fillRect(x + ribWidth * 0.98, 0, 2, textureHeight);
          }
        }
      }
      
      // Add horizontal panel lines for all profiles
      const panelHeight = textureHeight / 3;
      ctx.strokeStyle = `rgba(0,0,0,${shadowOpacity * 1.2})`;
      ctx.lineWidth = 3;
      for (let y = panelHeight; y < textureHeight; y += panelHeight) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(textureWidth, y);
        ctx.stroke();
        
        ctx.strokeStyle = `rgba(255,255,255,${highlightOpacity * 0.6})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, y - 2);
        ctx.lineTo(textureWidth, y - 2);
        ctx.stroke();
        ctx.strokeStyle = `rgba(0,0,0,${shadowOpacity * 1.2})`;
        ctx.lineWidth = 3;
      }
      
      // Enhanced weathering for non-white colors
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
      
      console.log(`✅ SKILLION WALL ${wallProfile.toUpperCase()} PROFILE TEXTURE CREATED`);
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    
    // Adjust texture scale based on profile type
    let scaleX = width / 3;
    let scaleY = height / 3;
    
    if (wallProfile === 'customorb') {
      scaleX = width / 2;
      scaleY = height / 2;
    } else if (wallProfile === 'multiclad') {
      scaleX = width / 4;
      scaleY = height / 4;
    }
    
    texture.repeat.set(scaleX, scaleY);
    
    // Enhanced material properties
    const isWhite = color === '#FFFFFF';
    const isDark = ['#1F2937', '#374151', '#4B5563'].includes(color);
    
    const materialProps = isWhite ? {
      metalness: 0.4,
      roughness: 0.5,
      envMapIntensity: 1.2,
    } : isDark ? {
      metalness: 0.8,
      roughness: 0.2,
      envMapIntensity: 1.5,
    } : {
      metalness: 0.6,
      roughness: 0.3,
      envMapIntensity: 1.0,
    };
    
    return new THREE.MeshStandardMaterial({
      map: texture,
      ...materialProps,
      side: THREE.DoubleSide,
    });
  }, [color, width, height, wallProfile]);

  // Create wall geometry with skillion roof slope for side walls
  const wallGeometry = useMemo(() => {
    const windowFeatures = wallFeatures.filter(feature => 
      feature.position.wallPosition === wallPosition && feature.type === 'window'
    );

    console.log(`🏗️ Creating SKILLION wall geometry for ${wallPosition} with ${windowFeatures.length} window cutouts`);

    // Calculate roof height for skillion roof
    const roofHeight = buildingWidth * (roofPitch / 12);

    // For skillion roofs, side walls (left/right) need to follow the roof slope
    if ((wallPosition === 'left' || wallPosition === 'right') && roofPitch > 0) {
      console.log(`🏗️ Creating SLOPED SIDE WALL for skillion roof: ${wallPosition} wall`);
      
      // Create the sloped wall shape
      const wallShape = new THREE.Shape();
      
      // For skillion roof, one side is low (height) and other side is high (height + roofHeight)
      // Assuming the roof slopes from left (low) to right (high)
      if (wallPosition === 'left') {
        // Left wall: low side of roof
        wallShape.moveTo(-width/2, -height/2);
        wallShape.lineTo(width/2, -height/2);
        wallShape.lineTo(width/2, height/2);
        wallShape.lineTo(-width/2, height/2);
        wallShape.lineTo(-width/2, -height/2);
      } else {
        // Right wall: high side of roof
        wallShape.moveTo(-width/2, -height/2);
        wallShape.lineTo(width/2, -height/2);
        wallShape.lineTo(width/2, height/2 + roofHeight);
        wallShape.lineTo(-width/2, height/2);
        wallShape.lineTo(-width/2, -height/2);
      }

      // Add window cutouts as holes
      windowFeatures.forEach(feature => {
        const windowHole = new THREE.Path();
        
        let windowX = 0;
        switch (feature.position.alignment) {
          case 'left':
            windowX = -width/2 + feature.position.xOffset + feature.width/2;
            break;
          case 'right':
            windowX = width/2 - feature.position.xOffset - feature.width/2;
            break;
          case 'center':
          default:
            windowX = feature.position.xOffset;
            break;
        }
        
        const windowY = -height/2 + feature.position.yOffset + feature.height/2;
        
        const halfWidth = feature.width / 2;
        const halfHeight = feature.height / 2;
        
        windowHole.moveTo(windowX - halfWidth, windowY - halfHeight);
        windowHole.lineTo(windowX + halfWidth, windowY - halfHeight);
        windowHole.lineTo(windowX + halfWidth, windowY + halfHeight);
        windowHole.lineTo(windowX - halfWidth, windowY + halfHeight);
        windowHole.closePath();
        
        wallShape.holes.push(windowHole);
        console.log(`  Added window cutout at (${windowX.toFixed(1)}, ${windowY.toFixed(1)})`);
      });

      const extrudeSettings = {
        steps: 1,
        depth: 0.2,
        bevelEnabled: false
      };

      const geometry = new THREE.ExtrudeGeometry(wallShape, extrudeSettings);
      
      // Calculate UV coordinates for the extruded geometry
      const uvs = geometry.attributes.uv.array;
      const positions = geometry.attributes.position.array;
      
      const totalHeight = wallPosition === 'right' ? height + roofHeight : height;
      
      for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const y = positions[i + 1];
        
        const u = (x + width/2) / width;
        const v = (y + height/2) / totalHeight;
        
        const uvIndex = (i / 3) * 2;
        uvs[uvIndex] = u;
        uvs[uvIndex + 1] = v;
      }
      
      geometry.attributes.uv.needsUpdate = true;
      return geometry;
    } else {
      // Front and back walls remain rectangular for skillion roofs
      if (windowFeatures.length === 0) {
        return new THREE.BoxGeometry(width, height, 0.2);
      }

      const wallShape = new THREE.Shape();
      wallShape.moveTo(-width/2, -height/2);
      wallShape.lineTo(width/2, -height/2);
      wallShape.lineTo(width/2, height/2);
      wallShape.lineTo(-width/2, height/2);
      wallShape.closePath();

      windowFeatures.forEach(feature => {
        const windowHole = new THREE.Path();
        
        let windowX = 0;
        switch (feature.position.alignment) {
          case 'left':
            windowX = -width/2 + feature.position.xOffset + feature.width/2;
            break;
          case 'right':
            windowX = width/2 - feature.position.xOffset - feature.width/2;
            break;
          case 'center':
          default:
            windowX = feature.position.xOffset;
            break;
        }
        
        const windowY = -height/2 + feature.position.yOffset + feature.height/2;
        
        const halfWidth = feature.width / 2;
        const halfHeight = feature.height / 2;
        
        windowHole.moveTo(windowX - halfWidth, windowY - halfHeight);
        windowHole.lineTo(windowX + halfWidth, windowY - halfHeight);
        windowHole.lineTo(windowX + halfWidth, windowY + halfHeight);
        windowHole.lineTo(windowX - halfWidth, windowY + halfHeight);
        windowHole.closePath();
        
        wallShape.holes.push(windowHole);
        console.log(`  Added window cutout at (${windowX.toFixed(1)}, ${windowY.toFixed(1)})`);
      });

      const extrudeSettings = {
        steps: 1,
        depth: 0.2,
        bevelEnabled: false
      };

      const geometry = new THREE.ExtrudeGeometry(wallShape, extrudeSettings);
      
      const uvs = geometry.attributes.uv.array;
      const positions = geometry.attributes.position.array;
      
      for (let i = 0; i < positions.length; i += 3) {
        const x = positions[i];
        const y = positions[i + 1];
        
        const u = (x + width/2) / width;
        const v = (y + height/2) / height;
        
        const uvIndex = (i / 3) * 2;
        uvs[uvIndex] = u;
        uvs[uvIndex + 1] = v;
      }
      
      geometry.attributes.uv.needsUpdate = true;
      return geometry;
    }
  }, [width, height, wallPosition, roofPitch, wallFeatures, buildingWidth]);

  // Generate structural beams (same as gable wall)
  const beamSegments = useMemo(() => {
    console.log(`\n🏗️  SKILLION WALL STRUCTURAL BEAM GENERATION for ${wallPosition} wall (${width}x${height})`);
    
    const allFeatures = wallFeatures.filter(feature => 
      feature.position.wallPosition === wallPosition
    );
    
    console.log(`All features affecting beams: ${allFeatures.length}`);
    
    return generateBeamPositions(width, height, allFeatures, {
      maxSpacing: 8,
      minSpacing: 4,
      margin: 2,
      beamWidth: 0.3,
      minBeams: 3
    });
  }, [width, height, wallFeatures, wallPosition]);

  const horizontalBeamSegments = useMemo(() => {
    console.log(`\n🏗️  SKILLION WALL HORIZONTAL STRUCTURAL BEAM GENERATION for ${wallPosition} wall`);
    
    const allFeatures = wallFeatures.filter(feature => 
      feature.position.wallPosition === wallPosition
    );
    
    return generateHorizontalBeamPositions(
      width, 
      height, 
      allFeatures, 
      [0.25, 0.5, 0.75],
      0.3
    );
  }, [width, height, wallFeatures, wallPosition]);

  // Interior beam positioning (same as gable wall)
  const getInteriorZOffset = (wallPos: WallPosition): number => {
    const deepInteriorOffset = -0.4;
    
    switch (wallPos) {
      case 'front':
        return deepInteriorOffset;
      case 'back':
        return deepInteriorOffset;
      case 'left':
        return -deepInteriorOffset;
      case 'right':
        return -deepInteriorOffset;
      default:
        return deepInteriorOffset;
    }
  };

  const createInteriorBeam = (segment: BeamSegment, segmentIndex: number) => {
    const beamWidth = segment.width;
    const beamDepth = 0.2;
    const beamHeight = segment.topY - segment.bottomY;
    const beamCenterY = (segment.topY + segment.bottomY) / 2;
    
    const zOffset = getInteriorZOffset(wallPosition);
    
    const steelMaterial = new THREE.MeshStandardMaterial({
      color: "#808080",
      metalness: 0.9,
      roughness: 0.1,
      envMapIntensity: 1.0,
    });
    
    const key = `skillion-interior-beam-${wallPosition}-${segment.x}-${segment.bottomY}-${segment.topY}-${segmentIndex}`;
    
    return (
      <group key={key} position={[segment.x, beamCenterY, zOffset]}>
        <mesh castShadow receiveShadow position={[0, 0, 0]}>
          <boxGeometry args={[beamWidth, beamHeight, beamDepth]} />
          <primitive object={steelMaterial} attach="material" />
        </mesh>
        
        {beamHeight > 2 && Array.from({ length: Math.max(1, Math.ceil(beamHeight / 6)) }).map((_, i) => {
          const flangeY = -beamHeight/2 + i * 6;
          if (Math.abs(flangeY) > beamHeight/2) return null;
          
          return (
            <mesh key={i} castShadow receiveShadow position={[0, flangeY, 0]}>
              <boxGeometry args={[0.4, 0.15, beamDepth * 1.2]} />
              <primitive object={steelMaterial} attach="material" />
            </mesh>
          );
        })}
        
        <mesh castShadow receiveShadow position={[0, -beamHeight/2, 0]}>
          <cylinderGeometry args={[beamWidth/3, beamWidth/3, 0.1, 8]} />
          <primitive object={steelMaterial} attach="material" />
        </mesh>
        <mesh castShadow receiveShadow position={[0, beamHeight/2, 0]}>
          <cylinderGeometry args={[beamWidth/3, beamWidth/3, 0.1, 8]} />
          <primitive object={steelMaterial} attach="material" />
        </mesh>
      </group>
    );
  };

  const createInteriorHorizontalBeam = (segment: BeamSegment, segmentIndex: number) => {
    const beamWidth = segment.width;
    const beamHeight = segment.topY - segment.bottomY;
    const beamDepth = 0.2;
    const beamCenterY = (segment.topY + segment.bottomY) / 2;
    
    const zOffset = getInteriorZOffset(wallPosition);
    
    const steelMaterial = new THREE.MeshStandardMaterial({
      color: "#808080",
      metalness: 0.9,
      roughness: 0.1,
      envMapIntensity: 1.0,
    });
    
    const key = `skillion-interior-h-beam-${wallPosition}-${segment.x}-${segment.bottomY}-${segment.topY}-${segment.width}-${segmentIndex}`;
    
    return (
      <group key={key} position={[segment.x, beamCenterY, zOffset]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[beamWidth, beamHeight, beamDepth]} />
          <primitive object={steelMaterial} attach="material" />
        </mesh>
        
        <mesh castShadow receiveShadow position={[-beamWidth/2, 0, 0]}>
          <boxGeometry args={[beamHeight, beamHeight, beamDepth]} />
          <primitive object={steelMaterial} attach="material" />
        </mesh>
        <mesh castShadow receiveShadow position={[beamWidth/2, 0, 0]}>
          <boxGeometry args={[beamHeight, beamHeight, beamDepth]} />
          <primitive object={steelMaterial} attach="material" />
        </mesh>
        
        <mesh castShadow receiveShadow position={[-beamWidth/2, 0, 0]}>
          <cylinderGeometry args={[beamHeight/4, beamHeight/4, 0.1, 6]} />
          <primitive object={steelMaterial} attach="material" />
        </mesh>
        <mesh castShadow receiveShadow position={[beamWidth/2, 0, 0]}>
          <cylinderGeometry args={[beamHeight/4, beamHeight/4, 0.1, 6]} />
          <primitive object={steelMaterial} attach="material" />
        </mesh>
      </group>
    );
  };

  return (
    <group position={position} rotation={rotation}>
      {/* Wall with window cutouts only - doors remain solid for structural integrity */}
      <mesh castShadow receiveShadow>
        <primitive object={wallGeometry} />
        <primitive object={wallMaterial} attach="material" />
      </mesh>
      
      {/* Interior beams - Split around ALL features, positioned DEEP INTERIOR ONLY */}
      {beamSegments.map((segment, index) => createInteriorBeam(segment, index))}
      
      {/* Interior horizontal beams - Split around ALL features, positioned DEEP INTERIOR ONLY */}
      {horizontalBeamSegments.map((segment, index) => createInteriorHorizontalBeam(segment, index))}
    </group>
  );
};

export default SkillionWall;