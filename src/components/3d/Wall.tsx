import React from 'react';
import GableWall from './GableWall';
import SkillionWall from './SkillionWall';
import type { WallPosition, WallFeature, WallProfile } from '../../types';

interface WallProps {
  position: [number, number, number];
  width: number;
  height: number;
  color: string;
  wallPosition: WallPosition;
  rotation?: [number, number, number];
  roofPitch?: number;
  wallFeatures?: WallFeature[];
  wallProfile?: WallProfile;
  roofType?: 'gable' | 'skillion';
  buildingWidth?: number; // For skillion roof calculations
}

const Wall: React.FC<WallProps> = ({ 
  position, 
  width, 
  height, 
  color, 
  wallPosition, 
  rotation = [0, 0, 0],
  roofPitch = 0,
  wallFeatures = [],
  wallProfile = 'trimdek',
  roofType = 'gable',
  buildingWidth = width
}) => {
  console.log(`🏗️ Rendering ${roofType.toUpperCase()} wall: ${wallPosition} (${width}ft × ${height}ft)`);

  if (roofType === 'skillion') {
    return (
      <SkillionWall
        position={position}
        width={width}
        height={height}
        color={color}
        wallPosition={wallPosition}
        rotation={rotation}
        roofPitch={roofPitch}
        wallFeatures={wallFeatures}
        wallProfile={wallProfile}
        buildingWidth={buildingWidth}
      />
    );
  } else {
    return (
      <GableWall
        position={position}
        width={width}
        height={height}
        color={color}
        wallPosition={wallPosition}
        rotation={rotation}
        roofPitch={roofPitch}
        wallFeatures={wallFeatures}
        wallProfile={wallProfile}
      />
    );
  }
};

export default Wall;