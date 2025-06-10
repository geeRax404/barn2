import React, { useMemo } from 'react';
import { useBuildingStore } from '../store/buildingStore';
import { 
  generateRoofLinesWithSkylightTrimming,
  validateRoofLineGeneration,
  type RoofLineSegment 
} from '../utils/roofLineGeneration';

interface RoofLinesProps {
  scale: number;
  width: number;
  length: number;
  position: { x: number; y: number };
}

const RoofLines: React.FC<RoofLinesProps> = ({ scale, width, length, position }) => {
  const { dimensions, skylights } = useBuildingStore((state) => ({
    dimensions: state.currentProject.building.dimensions,
    skylights: state.currentProject.building.skylights
  }));

  // Generate roof lines with skylight trimming
  const { roofLineSegments, validation } = useMemo(() => {
    console.log('\n🏠 GENERATING ROOF LINES FOR FLOOR PLAN');
    console.log(`Scale: ${scale}, Building: ${width}ft × ${length}ft`);
    console.log(`Skylights: ${skylights.length}`);
    
    const segments = generateRoofLinesWithSkylightTrimming(dimensions, skylights);
    const validationResult = validateRoofLineGeneration(segments, skylights, dimensions);
    
    console.log('\n📊 ROOF LINE VALIDATION RESULTS:');
    console.log(`Valid: ${validationResult.valid}`);
    console.log(`Errors: ${validationResult.errors.length}`);
    console.log(`Warnings: ${validationResult.warnings.length}`);
    console.log(`Total segments: ${validationResult.statistics.totalSegments}`);
    console.log(`Average segment length: ${validationResult.statistics.averageSegmentLength.toFixed(2)}ft`);
    
    if (validationResult.errors.length > 0) {
      console.error('Roof line errors:', validationResult.errors);
    }
    
    if (validationResult.warnings.length > 0) {
      console.warn('Roof line warnings:', validationResult.warnings);
    }
    
    return {
      roofLineSegments: segments,
      validation: validationResult
    };
  }, [dimensions, skylights, scale, width, length]);

  // Convert roof coordinates to screen coordinates
  const convertToScreenCoords = (roofX: number, roofY: number) => {
    return {
      x: position.x + (roofX * scale) + (width / 2),
      y: position.y + (roofY * scale) + (length / 2)
    };
  };

  // Get line style based on roof line type
  const getLineStyle = (type: string, panel: string) => {
    const baseStyle = {
      strokeWidth: 1,
      opacity: 0.7
    };

    switch (type) {
      case 'ridge':
        return {
          ...baseStyle,
          stroke: '#1F2937', // Dark gray for ridge lines
          strokeWidth: 2,
          strokeDasharray: '4,2',
          opacity: 0.8
        };
      case 'eave':
        return {
          ...baseStyle,
          stroke: '#374151', // Medium gray for eave lines
          strokeWidth: 1.5,
          opacity: 0.9
        };
      case 'rake':
        return {
          ...baseStyle,
          stroke: '#4B5563', // Light gray for rake lines
          strokeWidth: 1.5,
          opacity: 0.8
        };
      case 'valley':
        return {
          ...baseStyle,
          stroke: panel === 'left' ? '#3B82F6' : '#10B981', // Blue for left, green for right
          strokeWidth: 1,
          strokeDasharray: '2,1',
          opacity: 0.6
        };
      case 'hip':
        return {
          ...baseStyle,
          stroke: '#F59E0B', // Orange for hip lines
          strokeWidth: 1,
          strokeDasharray: '3,2',
          opacity: 0.7
        };
      default:
        return {
          ...baseStyle,
          stroke: '#6B7280', // Default gray
          strokeWidth: 1,
          opacity: 0.6
        };
    }
  };

  // Group segments by type for rendering order
  const segmentsByType = useMemo(() => {
    const groups: Record<string, RoofLineSegment[]> = {
      valley: [],
      hip: [],
      rake: [],
      eave: [],
      ridge: []
    };

    roofLineSegments.forEach(segment => {
      if (groups[segment.type]) {
        groups[segment.type].push(segment);
      } else {
        groups.ridge.push(segment); // Default to ridge if unknown type
      }
    });

    return groups;
  }, [roofLineSegments]);

  console.log(`\n🎨 RENDERING ${roofLineSegments.length} roof line segments`);
  console.log(`Segments by type:`, Object.entries(segmentsByType).map(([type, segs]) => `${type}: ${segs.length}`).join(', '));

  return (
    <g className="roof-lines">
      {/* Render segments in order: valley, hip, rake, eave, ridge (back to front) */}
      {Object.entries(segmentsByType).map(([type, segments]) => (
        <g key={type} className={`roof-lines-${type}`}>
          {segments.map((segment) => {
            const startCoords = convertToScreenCoords(segment.startX, segment.startY);
            const endCoords = convertToScreenCoords(segment.endX, segment.endY);
            const style = getLineStyle(segment.type, segment.panel);

            return (
              <line
                key={segment.id}
                x1={startCoords.x}
                y1={startCoords.y}
                x2={endCoords.x}
                y2={endCoords.y}
                {...style}
                className={`roof-line roof-line-${segment.type} roof-line-${segment.panel}`}
              >
                <title>
                  {`${segment.type.charAt(0).toUpperCase() + segment.type.slice(1)} line (${segment.panel} panel)`}
                  {segment.originalLineId !== segment.id && ` - Trimmed from ${segment.originalLineId}`}
                </title>
              </line>
            );
          })}
        </g>
      ))}

      {/* Debug information (only in development) */}
      {process.env.NODE_ENV === 'development' && validation.errors.length > 0 && (
        <g className="roof-lines-debug">
          <text
            x={position.x + 10}
            y={position.y + 20}
            fontSize="10"
            fill="red"
            fontFamily="monospace"
          >
            ⚠️ {validation.errors.length} roof line errors
          </text>
        </g>
      )}

      {/* Skylight indicators for debugging */}
      {process.env.NODE_ENV === 'development' && skylights.map((skylight, index) => {
        const centerX = skylight.panel === 'left' 
          ? -dimensions.width/4 + skylight.xOffset 
          : dimensions.width/4 + skylight.xOffset;
        const centerY = skylight.yOffset;
        
        const screenCoords = convertToScreenCoords(centerX, centerY);
        const skylightWidth = skylight.width * scale;
        const skylightLength = skylight.length * scale;

        return (
          <rect
            key={`skylight-debug-${index}`}
            x={screenCoords.x - skylightWidth/2}
            y={screenCoords.y - skylightLength/2}
            width={skylightWidth}
            height={skylightLength}
            fill="rgba(255, 255, 0, 0.2)"
            stroke="orange"
            strokeWidth="1"
            strokeDasharray="2,2"
            className="skylight-debug"
          >
            <title>Skylight {index + 1} ({skylight.panel} panel)</title>
          </rect>
        );
      })}
    </g>
  );
};

export default RoofLines;