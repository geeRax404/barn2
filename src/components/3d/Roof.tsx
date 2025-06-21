import React from 'react';
import GableRoof from './GableRoof';
import SkillionRoof from './SkillionRoof';
import DoubleSkillionRoof from './DoubleSkillionRoof';
import type { Skylight } from '../../types';

interface RoofProps {
  width: number;
  length: number;
  height: number;
  pitch: number;
  color: string;
  skylights?: Skylight[];
  wallProfile?: string;
  roofType?: 'gable' | 'skillion' | 'double-skillion';
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
  console.log(`🏗️ Rendering ${roofType.toUpperCase()} roof: ${width}ft × ${length}ft, ${pitch}:12 pitch`);

  if (roofType === 'skillion') {
    return (
      <SkillionRoof
        width={width}
        length={length}
        height={height}
        pitch={pitch}
        color={color}
        skylights={skylights}
        wallProfile={wallProfile}
      />
    );
  } else if (roofType === 'double-skillion') {
    return (
      <DoubleSkillionRoof
        width={width}
        length={length}
        height={height}
        pitch={pitch}
        color={color}
        skylights={skylights}
        wallProfile={wallProfile}
      />
    );
  } else {
    return (
      <GableRoof
        width={width}
        length={length}
        height={height}
        pitch={pitch}
        color={color}
        skylights={skylights}
        wallProfile={wallProfile}
      />
    );
  }
};

export default Roof;