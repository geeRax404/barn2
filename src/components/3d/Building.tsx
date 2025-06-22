import React from 'react';
import { useFrame } from '@react-three/fiber';
import { useBuildingStore } from '../../store/buildingStore';
import Wall from './Wall';
import Roof from './Roof';
import WallFeature from './WallFeature';

// Ground alignment offset to ensure walls sit flush with ground
const GROUND_ALIGNMENT_OFFSET = 0.01;

const Building: React.FC = () => {
  const { dimensions, features, color, roofColor, skylights, wallProfile, roofType } = useBuildingStore((state) => ({
    dimensions: state.currentProject.building.dimensions,
    features: state.currentProject.building.features,
    color: state.currentProject.building.color,
    roofColor: state.currentProject.building.roofColor,
    skylights: state.currentProject.building.skylights,
    wallProfile: state.currentProject.building.wallProfile || 'trimdek',
    roofType: state.currentProject.building.roofType || 'gable'
  }));
  
  const halfWidth = dimensions.width / 2;
  const halfLength = dimensions.length / 2;
  
  // Calculate total height including roof peak
  const roofHeight = roofType === 'gable' 
    ? (dimensions.width / 2) * (dimensions.roofPitch / 12)
    : roofType === 'double-skillion'
    ? (dimensions.width / 4) * (dimensions.roofPitch / 12) // Quarter width for double skillion
    : dimensions.width * (dimensions.roofPitch / 12);
  const totalHeight = dimensions.height + roofHeight;
  
  // Filter features by wall position for collision detection
  const getWallFeatures = (wallPosition: string) => {
    const wallFeatures = features.filter(feature => feature.position.wallPosition === wallPosition);
    console.log(`Wall ${wallPosition} has ${wallFeatures.length} features:`, wallFeatures.map(f => `${f.type} ${f.width}x${f.height} at ${f.position.alignment} ${f.position.xOffset}`));
    return wallFeatures;
  };
  
  // 🎯 PERFECT FLUSH ALIGNMENT: Calculate exact wall positions and heights for different roof types
  const getWallData = (wallPos: string): { position: [number, number, number], height: number } => {
    const baseHeight = dimensions.height / 2;
    
    if (roofType === 'skillion') {
      const roofHeightTotal = dimensions.width * (dimensions.roofPitch / 12);
      
      console.log(`🎯 PERFECT FLUSH: Calculating ${wallPos} wall for skillion roof`);
      console.log(`  Roof height total: ${roofHeightTotal}ft`);
      console.log(`  Base wall height: ${dimensions.height}ft`);
      
      switch (wallPos) {
        case 'front':
          // Front wall: TRAPEZOIDAL - follows roof slope (low left, high right)
          const frontAvgHeight = dimensions.height + roofHeightTotal / 2;
          console.log(`  FRONT wall: avg height = ${frontAvgHeight}ft, positioned at y = ${frontAvgHeight / 2}`);
          return {
            position: [0, frontAvgHeight / 2 - GROUND_ALIGNMENT_OFFSET, halfLength],
            height: dimensions.height // Base height, geometry will be sloped
          };
          
        case 'back':
          // Back wall: TRAPEZOIDAL - follows roof slope (low left, high right)
          const backAvgHeight = dimensions.height + roofHeightTotal / 2;
          console.log(`  BACK wall: avg height = ${backAvgHeight}ft, positioned at y = ${backAvgHeight / 2}`);
          return {
            position: [0, backAvgHeight / 2 - GROUND_ALIGNMENT_OFFSET, -halfLength],
            height: dimensions.height // Base height, geometry will be sloped
          };
          
        case 'left':
          // Left wall: RECTANGULAR - stays at base height (low side)
          console.log(`  LEFT wall: base height = ${dimensions.height}ft, positioned at y = ${baseHeight}`);
          return {
            position: [-halfWidth, baseHeight - GROUND_ALIGNMENT_OFFSET, 0],
            height: dimensions.height // Exact base height
          };
          
        case 'right':
          // Right wall: RECTANGULAR - full height to reach high side
          const rightWallHeight = dimensions.height + roofHeightTotal;
          const rightWallCenter = rightWallHeight / 2;
          console.log(`  RIGHT wall: full height = ${rightWallHeight}ft, positioned at y = ${rightWallCenter}`);
          return {
            position: [halfWidth, rightWallCenter - GROUND_ALIGNMENT_OFFSET, 0],
            height: rightWallHeight // Exact height to reach roof
          };
          
        default:
          return {
            position: [0, baseHeight - GROUND_ALIGNMENT_OFFSET, 0],
            height: dimensions.height
          };
      }
    } else if (roofType === 'double-skillion') {
      const roofHeightTotal = (dimensions.width / 4) * (dimensions.roofPitch / 12); // Quarter width for each slope
      
      console.log(`🎯 PERFECT FLUSH: Calculating ${wallPos} wall for double skillion (butterfly) roof`);
      console.log(`  Roof height total: ${roofHeightTotal}ft`);
      console.log(`  Base wall height: ${dimensions.height}ft`);
      
      switch (wallPos) {
        case 'front':
        case 'back':
          // Front/Back walls: BUTTERFLY SHAPE - high at edges, low at center
          const butterflyAvgHeight = dimensions.height + roofHeightTotal / 2;
          console.log(`  ${wallPos.toUpperCase()} wall: butterfly avg height = ${butterflyAvgHeight}ft, positioned at y = ${butterflyAvgHeight / 2}`);
          return {
            position: [0, butterflyAvgHeight / 2 - GROUND_ALIGNMENT_OFFSET, wallPos === 'front' ? halfLength : -halfLength],
            height: dimensions.height // Base height, geometry will be butterfly-shaped
          };
          
        case 'left':
        case 'right':
          // Left/Right walls: RECTANGULAR - stay at base height (no slope along length)
          console.log(`  ${wallPos.toUpperCase()} wall: base height = ${dimensions.height}ft, positioned at y = ${baseHeight}`);
          return {
            position: [wallPos === 'left' ? -halfWidth : halfWidth, baseHeight - GROUND_ALIGNMENT_OFFSET, 0],
            height: dimensions.height // Exact base height
          };
          
        default:
          return {
            position: [0, baseHeight - GROUND_ALIGNMENT_OFFSET, 0],
            height: dimensions.height
          };
      }
    } else {
      // Gable roof - all walls same height
      switch (wallPos) {
        case 'front':
          return { position: [0, baseHeight - GROUND_ALIGNMENT_OFFSET, halfLength], height: dimensions.height };
        case 'back':
          return { position: [0, baseHeight - GROUND_ALIGNMENT_OFFSET, -halfLength], height: dimensions.height };
        case 'left':
          return { position: [-halfWidth, baseHeight - GROUND_ALIGNMENT_OFFSET, 0], height: dimensions.height };
        case 'right':
          return { position: [halfWidth, baseHeight - GROUND_ALIGNMENT_OFFSET, 0], height: dimensions.height };
        default:
          return { position: [0, baseHeight - GROUND_ALIGNMENT_OFFSET, 0], height: dimensions.height };
      }
    }
  };
  
  return (
    <group>
      {/* Enhanced Foundation with better materials */}
      <mesh position={[0, 0.1 - GROUND_ALIGNMENT_OFFSET, 0]} receiveShadow castShadow>
        <boxGeometry args={[dimensions.width, 0.2, dimensions.length]} />
        <meshStandardMaterial 
          color="#8B7355" 
          metalness={0.1}
          roughness={0.9}
          envMapIntensity={0.2}
        />
      </mesh>
      
      {/* Front wall */}
      <Wall 
        position={getWallData('front').position} 
        width={dimensions.width}
        height={getWallData('front').height}
        color={color}
        wallPosition="front"
        roofPitch={dimensions.roofPitch}
        wallFeatures={getWallFeatures('front')}
        wallProfile={wallProfile}
        roofType={roofType}
        buildingWidth={dimensions.width}
      />
      
      {/* Back wall */}
      <Wall 
        position={getWallData('back').position} 
        width={dimensions.width}
        height={getWallData('back').height}
        color={color}
        wallPosition="back"
        roofPitch={dimensions.roofPitch}
        rotation={[0, Math.PI, 0]}
        wallFeatures={getWallFeatures('back')}
        wallProfile={wallProfile}
        roofType={roofType}
        buildingWidth={dimensions.width}
      />
      
      {/* Left wall */}
      <Wall 
        position={getWallData('left').position} 
        width={dimensions.length}
        height={getWallData('left').height}
        color={color}
        wallPosition="left"
        rotation={[0, Math.PI / 2, 0]}
        roofPitch={dimensions.roofPitch}
        wallFeatures={getWallFeatures('left')}
        wallProfile={wallProfile}
        roofType={roofType}
        buildingWidth={dimensions.width}
      />
      
      {/* Right wall */}
      <Wall 
        position={getWallData('right').position} 
        width={dimensions.length}
        height={getWallData('right').height}
        color={color}
        wallPosition="right"
        rotation={[0, -Math.PI / 2, 0]}
        roofPitch={dimensions.roofPitch}
        wallFeatures={getWallFeatures('right')}
        wallProfile={wallProfile}
        roofType={roofType}
        buildingWidth={dimensions.width}
      />
      
      {/* Roof with profile-specific textures - NOW INCLUDES ROOF TYPE! */}
      <Roof
        width={dimensions.width}
        length={dimensions.length}
        height={dimensions.height}
        pitch={dimensions.roofPitch}
        color={roofColor}
        skylights={skylights}
        wallProfile={wallProfile}
        roofType={roofType}
      />
      
      {/* Wall Features (doors, windows, etc.) */}
      {features.map((feature) => (
        <WallFeature
          key={feature.id}
          feature={feature}
          buildingDimensions={dimensions}
        />
      ))}
    </group>
  );
};

export default Building;