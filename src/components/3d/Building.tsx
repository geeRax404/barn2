import React from 'react';
import { useFrame } from '@react-three/fiber';
import { useBuildingStore } from '../../store/buildingStore';
import Wall from './Wall';
import Roof from './Roof';
import WallFeature from './WallFeature';

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
    : dimensions.width * (dimensions.roofPitch / 12);
  const totalHeight = dimensions.height + roofHeight;
  
  // Filter features by wall position for collision detection
  const getWallFeatures = (wallPosition: string) => {
    const wallFeatures = features.filter(feature => feature.position.wallPosition === wallPosition);
    console.log(`Wall ${wallPosition} has ${wallFeatures.length} features:`, wallFeatures.map(f => `${f.type} ${f.width}x${f.height} at ${f.position.alignment} ${f.position.xOffset}`));
    return wallFeatures;
  };
  
  // Calculate wall positions for skillion roof
  const getWallPosition = (wallPos: string): [number, number, number] => {
    const baseHeight = dimensions.height / 2;
    
    if (roofType === 'skillion') {
      const roofHeightTotal = dimensions.width * (dimensions.roofPitch / 12);
      
      switch (wallPos) {
        case 'front':
          return [0, baseHeight, halfLength];
        case 'back':
          // Back wall is taller for skillion roof
          return [0, baseHeight + roofHeightTotal / 2, -halfLength];
        case 'left':
          return [-halfWidth, baseHeight + roofHeightTotal / 4, 0];
        case 'right':
          return [halfWidth, baseHeight + roofHeightTotal / 4, 0];
        default:
          return [0, baseHeight, 0];
      }
    } else {
      // Gable roof - all walls same height
      switch (wallPos) {
        case 'front':
          return [0, baseHeight, halfLength];
        case 'back':
          return [0, baseHeight, -halfLength];
        case 'left':
          return [-halfWidth, baseHeight, 0];
        case 'right':
          return [halfWidth, baseHeight, 0];
        default:
          return [0, baseHeight, 0];
      }
    }
  };
  
  return (
    <group>
      {/* Enhanced Foundation with better materials */}
      <mesh position={[0, 0.1, 0]} receiveShadow castShadow>
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
        position={getWallPosition('front')} 
        width={dimensions.width}
        height={dimensions.height}
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
        position={getWallPosition('back')} 
        width={dimensions.width}
        height={roofType === 'skillion' ? dimensions.height + dimensions.width * (dimensions.roofPitch / 12) : dimensions.height}
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
        position={getWallPosition('left')} 
        width={dimensions.length}
        height={dimensions.height}
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
        position={getWallPosition('right')} 
        width={dimensions.length}
        height={dimensions.height}
        color={color}
        wallPosition="right"
        rotation={[0, -Math.PI / 2, 0]}
        roofPitch={dimensions.roofPitch}
        wallFeatures={getWallFeatures('right')}
        wallProfile={wallProfile}
        roofType={roofType}
        buildingWidth={dimensions.width}
      />
      
      {/* Roof with profile-specific textures */}
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