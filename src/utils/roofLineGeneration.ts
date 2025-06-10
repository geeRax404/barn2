import type { Skylight, BuildingDimensions } from '../types';

export interface RoofLine {
  id: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  type: 'ridge' | 'eave' | 'rake' | 'valley' | 'hip';
  panel: 'left' | 'right' | 'both';
}

export interface RoofLineSegment {
  id: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  type: 'ridge' | 'eave' | 'rake' | 'valley' | 'hip';
  panel: 'left' | 'right' | 'both';
  originalLineId: string;
}

export interface SkylightBounds {
  left: number;
  right: number;
  top: number;
  bottom: number;
  panel: 'left' | 'right';
}

/**
 * Converts skylight coordinates to roof plan coordinates
 */
export const convertSkylightToRoofCoordinates = (
  skylight: Skylight,
  dimensions: BuildingDimensions
): SkylightBounds => {
  const { width, length } = dimensions;
  const panelWidth = width / 2;
  
  // Convert panel-relative coordinates to roof plan coordinates
  let centerX: number;
  if (skylight.panel === 'left') {
    // Left panel: center at -panelWidth/2, extends from -width/2 to 0
    centerX = -panelWidth/2 + (skylight.xOffset + panelWidth/2);
  } else {
    // Right panel: center at +panelWidth/2, extends from 0 to +width/2
    centerX = panelWidth/2 + (skylight.xOffset - panelWidth/2);
  }
  
  const centerY = skylight.yOffset;
  
  const bounds: SkylightBounds = {
    left: centerX - skylight.width / 2,
    right: centerX + skylight.width / 2,
    top: centerY + skylight.length / 2,
    bottom: centerY - skylight.length / 2,
    panel: skylight.panel
  };
  
  console.log(`Skylight ${skylight.panel} panel: (${skylight.xOffset}, ${skylight.yOffset}) -> roof coords: (${centerX.toFixed(2)}, ${centerY.toFixed(2)})`);
  console.log(`Bounds: left=${bounds.left.toFixed(2)}, right=${bounds.right.toFixed(2)}, top=${bounds.top.toFixed(2)}, bottom=${bounds.bottom.toFixed(2)}`);
  
  return bounds;
};

/**
 * Generates the basic roof lines for a gabled roof
 */
export const generateBaseRoofLines = (dimensions: BuildingDimensions): RoofLine[] => {
  const { width, length } = dimensions;
  const halfWidth = width / 2;
  const halfLength = length / 2;
  
  console.log(`\n🏠 GENERATING BASE ROOF LINES for ${width}ft × ${length}ft roof`);
  
  const roofLines: RoofLine[] = [
    // Ridge line (center peak)
    {
      id: 'ridge-main',
      startX: 0,
      startY: -halfLength,
      endX: 0,
      endY: halfLength,
      type: 'ridge',
      panel: 'both'
    },
    
    // Left eave line
    {
      id: 'eave-left',
      startX: -halfWidth,
      startY: -halfLength,
      endX: -halfWidth,
      endY: halfLength,
      type: 'eave',
      panel: 'left'
    },
    
    // Right eave line
    {
      id: 'eave-right',
      startX: halfWidth,
      startY: -halfLength,
      endX: halfWidth,
      endY: halfLength,
      type: 'eave',
      panel: 'right'
    },
    
    // Front rake lines
    {
      id: 'rake-front-left',
      startX: -halfWidth,
      startY: -halfLength,
      endX: 0,
      endY: -halfLength,
      type: 'rake',
      panel: 'left'
    },
    {
      id: 'rake-front-right',
      startX: 0,
      startY: -halfLength,
      endX: halfWidth,
      endY: -halfLength,
      type: 'rake',
      panel: 'right'
    },
    
    // Back rake lines
    {
      id: 'rake-back-left',
      startX: -halfWidth,
      startY: halfLength,
      endX: 0,
      endY: halfLength,
      type: 'rake',
      panel: 'left'
    },
    {
      id: 'rake-back-right',
      startX: 0,
      startY: halfLength,
      endX: halfWidth,
      endY: halfLength,
      type: 'rake',
      panel: 'right'
    }
  ];
  
  // Add intermediate ridge lines for visual detail
  const ridgeSpacing = 4; // 4 feet spacing
  for (let y = -halfLength + ridgeSpacing; y < halfLength; y += ridgeSpacing) {
    roofLines.push({
      id: `ridge-detail-${y}`,
      startX: -halfWidth * 0.8,
      startY: y,
      endX: halfWidth * 0.8,
      endY: y,
      type: 'ridge',
      panel: 'both'
    });
  }
  
  // Add panel separation lines
  const panelSpacing = 3; // 3 feet spacing
  for (let x = -halfWidth + panelSpacing; x < 0; x += panelSpacing) {
    roofLines.push({
      id: `panel-left-${x}`,
      startX: x,
      startY: -halfLength * 0.9,
      endX: x,
      endY: halfLength * 0.9,
      type: 'valley',
      panel: 'left'
    });
  }
  
  for (let x = panelSpacing; x < halfWidth; x += panelSpacing) {
    roofLines.push({
      id: `panel-right-${x}`,
      startX: x,
      startY: -halfLength * 0.9,
      endX: x,
      endY: halfLength * 0.9,
      type: 'valley',
      panel: 'right'
    });
  }
  
  console.log(`Generated ${roofLines.length} base roof lines`);
  return roofLines;
};

/**
 * Checks if a line segment intersects with a skylight bounds
 */
export const lineIntersectsSkylightBounds = (
  lineStartX: number,
  lineStartY: number,
  lineEndX: number,
  lineEndY: number,
  skylightBounds: SkylightBounds
): boolean => {
  // Check if line is completely outside skylight bounds
  const lineMinX = Math.min(lineStartX, lineEndX);
  const lineMaxX = Math.max(lineStartX, lineEndX);
  const lineMinY = Math.min(lineStartY, lineEndY);
  const lineMaxY = Math.max(lineStartY, lineEndY);
  
  // No intersection if line is completely outside skylight bounds
  if (lineMaxX < skylightBounds.left || lineMinX > skylightBounds.right ||
      lineMaxY < skylightBounds.bottom || lineMinY > skylightBounds.top) {
    return false;
  }
  
  // Check for actual line-rectangle intersection
  return lineIntersectsRectangle(
    lineStartX, lineStartY, lineEndX, lineEndY,
    skylightBounds.left, skylightBounds.bottom,
    skylightBounds.right, skylightBounds.top
  );
};

/**
 * Checks if a line segment intersects with a rectangle
 */
export const lineIntersectsRectangle = (
  lineStartX: number,
  lineStartY: number,
  lineEndX: number,
  lineEndY: number,
  rectLeft: number,
  rectBottom: number,
  rectRight: number,
  rectTop: number
): boolean => {
  // Check if either endpoint is inside the rectangle
  if (pointInRectangle(lineStartX, lineStartY, rectLeft, rectBottom, rectRight, rectTop) ||
      pointInRectangle(lineEndX, lineEndY, rectLeft, rectBottom, rectRight, rectTop)) {
    return true;
  }
  
  // Check if line intersects any of the rectangle edges
  return (
    lineIntersectsLine(lineStartX, lineStartY, lineEndX, lineEndY, rectLeft, rectBottom, rectRight, rectBottom) || // Bottom edge
    lineIntersectsLine(lineStartX, lineStartY, lineEndX, lineEndY, rectRight, rectBottom, rectRight, rectTop) ||   // Right edge
    lineIntersectsLine(lineStartX, lineStartY, lineEndX, lineEndY, rectRight, rectTop, rectLeft, rectTop) ||       // Top edge
    lineIntersectsLine(lineStartX, lineStartY, lineEndX, lineEndY, rectLeft, rectTop, rectLeft, rectBottom)        // Left edge
  );
};

/**
 * Checks if a point is inside a rectangle
 */
export const pointInRectangle = (
  pointX: number,
  pointY: number,
  rectLeft: number,
  rectBottom: number,
  rectRight: number,
  rectTop: number
): boolean => {
  return pointX >= rectLeft && pointX <= rectRight && pointY >= rectBottom && pointY <= rectTop;
};

/**
 * Checks if two line segments intersect
 */
export const lineIntersectsLine = (
  line1StartX: number,
  line1StartY: number,
  line1EndX: number,
  line1EndY: number,
  line2StartX: number,
  line2StartY: number,
  line2EndX: number,
  line2EndY: number
): boolean => {
  const denom = (line1StartX - line1EndX) * (line2StartY - line2EndY) - (line1StartY - line1EndY) * (line2StartX - line2EndX);
  
  if (Math.abs(denom) < 1e-10) {
    return false; // Lines are parallel
  }
  
  const t = ((line1StartX - line2StartX) * (line2StartY - line2EndY) - (line1StartY - line2StartY) * (line2StartX - line2EndX)) / denom;
  const u = -((line1StartX - line1EndX) * (line1StartY - line2StartY) - (line1StartY - line1EndY) * (line1StartX - line2StartX)) / denom;
  
  return t >= 0 && t <= 1 && u >= 0 && u <= 1;
};

/**
 * Trims a roof line around skylight bounds, returning segments
 */
export const trimRoofLineAroundSkylight = (
  roofLine: RoofLine,
  skylightBounds: SkylightBounds
): RoofLineSegment[] => {
  const segments: RoofLineSegment[] = [];
  
  console.log(`\n✂️ TRIMMING roof line ${roofLine.id} around skylight`);
  console.log(`Line: (${roofLine.startX}, ${roofLine.startY}) to (${roofLine.endX}, ${roofLine.endY})`);
  console.log(`Skylight bounds: (${skylightBounds.left}, ${skylightBounds.bottom}) to (${skylightBounds.right}, ${skylightBounds.top})`);
  
  // Check if line intersects with skylight
  if (!lineIntersectsSkylightBounds(
    roofLine.startX, roofLine.startY, roofLine.endX, roofLine.endY, skylightBounds
  )) {
    console.log(`No intersection - keeping full line`);
    // No intersection, keep the full line
    segments.push({
      id: `${roofLine.id}-full`,
      startX: roofLine.startX,
      startY: roofLine.startY,
      endX: roofLine.endX,
      endY: roofLine.endY,
      type: roofLine.type,
      panel: roofLine.panel,
      originalLineId: roofLine.id
    });
    return segments;
  }
  
  // Find intersection points with skylight bounds
  const intersections = findLineRectangleIntersections(
    roofLine.startX, roofLine.startY, roofLine.endX, roofLine.endY,
    skylightBounds.left, skylightBounds.bottom, skylightBounds.right, skylightBounds.top
  );
  
  console.log(`Found ${intersections.length} intersection points`);
  intersections.forEach((point, i) => {
    console.log(`  Intersection ${i + 1}: (${point.x.toFixed(2)}, ${point.y.toFixed(2)})`);
  });
  
  if (intersections.length === 0) {
    // Line is completely inside skylight - remove it entirely
    console.log(`Line completely inside skylight - removing`);
    return segments;
  }
  
  // Sort intersections by distance along the line
  intersections.sort((a, b) => {
    const distA = Math.sqrt(Math.pow(a.x - roofLine.startX, 2) + Math.pow(a.y - roofLine.startY, 2));
    const distB = Math.sqrt(Math.pow(b.x - roofLine.startX, 2) + Math.pow(b.y - roofLine.startY, 2));
    return distA - distB;
  });
  
  // Create segments before and after skylight
  let currentStart = { x: roofLine.startX, y: roofLine.startY };
  let segmentIndex = 0;
  
  for (let i = 0; i < intersections.length; i += 2) {
    const entryPoint = intersections[i];
    const exitPoint = intersections[i + 1];
    
    // Segment before skylight
    if (currentStart.x !== entryPoint.x || currentStart.y !== entryPoint.y) {
      console.log(`Creating segment before skylight: (${currentStart.x.toFixed(2)}, ${currentStart.y.toFixed(2)}) to (${entryPoint.x.toFixed(2)}, ${entryPoint.y.toFixed(2)})`);
      segments.push({
        id: `${roofLine.id}-seg-${segmentIndex++}`,
        startX: currentStart.x,
        startY: currentStart.y,
        endX: entryPoint.x,
        endY: entryPoint.y,
        type: roofLine.type,
        panel: roofLine.panel,
        originalLineId: roofLine.id
      });
    }
    
    // Update current start to exit point
    if (exitPoint) {
      currentStart = exitPoint;
    }
  }
  
  // Final segment after skylight
  if (currentStart.x !== roofLine.endX || currentStart.y !== roofLine.endY) {
    console.log(`Creating segment after skylight: (${currentStart.x.toFixed(2)}, ${currentStart.y.toFixed(2)}) to (${roofLine.endX}, ${roofLine.endY})`);
    segments.push({
      id: `${roofLine.id}-seg-${segmentIndex}`,
      startX: currentStart.x,
      startY: currentStart.y,
      endX: roofLine.endX,
      endY: roofLine.endY,
      type: roofLine.type,
      panel: roofLine.panel,
      originalLineId: roofLine.id
    });
  }
  
  console.log(`Created ${segments.length} segments after trimming`);
  return segments;
};

/**
 * Finds intersection points between a line and a rectangle
 */
export const findLineRectangleIntersections = (
  lineStartX: number,
  lineStartY: number,
  lineEndX: number,
  lineEndY: number,
  rectLeft: number,
  rectBottom: number,
  rectRight: number,
  rectTop: number
): { x: number; y: number }[] => {
  const intersections: { x: number; y: number }[] = [];
  
  // Check intersection with each rectangle edge
  const edges = [
    { x1: rectLeft, y1: rectBottom, x2: rectRight, y2: rectBottom }, // Bottom
    { x1: rectRight, y1: rectBottom, x2: rectRight, y2: rectTop },   // Right
    { x1: rectRight, y1: rectTop, x2: rectLeft, y2: rectTop },       // Top
    { x1: rectLeft, y1: rectTop, x2: rectLeft, y2: rectBottom }      // Left
  ];
  
  edges.forEach(edge => {
    const intersection = findLineIntersection(
      lineStartX, lineStartY, lineEndX, lineEndY,
      edge.x1, edge.y1, edge.x2, edge.y2
    );
    
    if (intersection) {
      // Check if intersection is within both line segments
      if (pointOnLineSegment(intersection.x, intersection.y, lineStartX, lineStartY, lineEndX, lineEndY) &&
          pointOnLineSegment(intersection.x, intersection.y, edge.x1, edge.y1, edge.x2, edge.y2)) {
        intersections.push(intersection);
      }
    }
  });
  
  // Remove duplicate intersections (corner cases)
  const uniqueIntersections = intersections.filter((point, index, array) => {
    return array.findIndex(p => Math.abs(p.x - point.x) < 1e-6 && Math.abs(p.y - point.y) < 1e-6) === index;
  });
  
  return uniqueIntersections;
};

/**
 * Finds intersection point between two lines
 */
export const findLineIntersection = (
  line1StartX: number,
  line1StartY: number,
  line1EndX: number,
  line1EndY: number,
  line2StartX: number,
  line2StartY: number,
  line2EndX: number,
  line2EndY: number
): { x: number; y: number } | null => {
  const denom = (line1StartX - line1EndX) * (line2StartY - line2EndY) - (line1StartY - line1EndY) * (line2StartX - line2EndX);
  
  if (Math.abs(denom) < 1e-10) {
    return null; // Lines are parallel
  }
  
  const t = ((line1StartX - line2StartX) * (line2StartY - line2EndY) - (line1StartY - line2StartY) * (line2StartX - line2EndX)) / denom;
  
  return {
    x: line1StartX + t * (line1EndX - line1StartX),
    y: line1StartY + t * (line1EndY - line1StartY)
  };
};

/**
 * Checks if a point lies on a line segment
 */
export const pointOnLineSegment = (
  pointX: number,
  pointY: number,
  lineStartX: number,
  lineStartY: number,
  lineEndX: number,
  lineEndY: number
): boolean => {
  const tolerance = 1e-6;
  
  // Check if point is within the bounding box of the line segment
  const minX = Math.min(lineStartX, lineEndX) - tolerance;
  const maxX = Math.max(lineStartX, lineEndX) + tolerance;
  const minY = Math.min(lineStartY, lineEndY) - tolerance;
  const maxY = Math.max(lineStartY, lineEndY) + tolerance;
  
  if (pointX < minX || pointX > maxX || pointY < minY || pointY > maxY) {
    return false;
  }
  
  // Check if point is on the line (cross product should be zero)
  const crossProduct = (pointY - lineStartY) * (lineEndX - lineStartX) - (pointX - lineStartX) * (lineEndY - lineStartY);
  return Math.abs(crossProduct) < tolerance;
};

/**
 * Generates roof lines with automatic skylight trimming
 */
export const generateRoofLinesWithSkylightTrimming = (
  dimensions: BuildingDimensions,
  skylights: Skylight[]
): RoofLineSegment[] => {
  console.log(`\n🏠 === GENERATING ROOF LINES WITH SKYLIGHT TRIMMING ===`);
  console.log(`Roof dimensions: ${dimensions.width}ft × ${dimensions.length}ft`);
  console.log(`Skylights to avoid: ${skylights.length}`);
  
  // Generate base roof lines
  const baseRoofLines = generateBaseRoofLines(dimensions);
  
  // Convert skylights to roof coordinates
  const skylightBounds = skylights.map(skylight => 
    convertSkylightToRoofCoordinates(skylight, dimensions)
  );
  
  console.log(`\nConverted ${skylightBounds.length} skylights to roof coordinates`);
  
  // Process each roof line and trim around skylights
  const allSegments: RoofLineSegment[] = [];
  
  baseRoofLines.forEach(roofLine => {
    console.log(`\n--- Processing roof line: ${roofLine.id} (${roofLine.type}) ---`);
    
    let currentSegments: RoofLineSegment[] = [{
      id: `${roofLine.id}-initial`,
      startX: roofLine.startX,
      startY: roofLine.startY,
      endX: roofLine.endX,
      endY: roofLine.endY,
      type: roofLine.type,
      panel: roofLine.panel,
      originalLineId: roofLine.id
    }];
    
    // Trim against each skylight
    skylightBounds.forEach((skylightBound, skylightIndex) => {
      console.log(`\n  Trimming against skylight ${skylightIndex + 1} (${skylightBound.panel} panel)`);
      
      // Only trim if the roof line is on the same panel or spans both panels
      if (roofLine.panel === 'both' || roofLine.panel === skylightBound.panel) {
        const newSegments: RoofLineSegment[] = [];
        
        currentSegments.forEach(segment => {
          const trimmedSegments = trimRoofLineAroundSkylight(
            {
              id: segment.id,
              startX: segment.startX,
              startY: segment.startY,
              endX: segment.endX,
              endY: segment.endY,
              type: segment.type,
              panel: segment.panel
            },
            skylightBound
          );
          
          newSegments.push(...trimmedSegments);
        });
        
        currentSegments = newSegments;
        console.log(`    After trimming: ${currentSegments.length} segments`);
      } else {
        console.log(`    Skipping - line panel (${roofLine.panel}) doesn't match skylight panel (${skylightBound.panel})`);
      }
    });
    
    allSegments.push(...currentSegments);
  });
  
  console.log(`\n✅ ROOF LINE GENERATION COMPLETE:`);
  console.log(`Total roof line segments: ${allSegments.length}`);
  console.log(`Original roof lines: ${baseRoofLines.length}`);
  console.log(`Skylights processed: ${skylights.length}`);
  
  // Group segments by type for summary
  const segmentsByType = allSegments.reduce((acc, segment) => {
    acc[segment.type] = (acc[segment.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  console.log(`Segments by type:`, segmentsByType);
  
  return allSegments;
};

/**
 * Validates roof line generation results
 */
export const validateRoofLineGeneration = (
  segments: RoofLineSegment[],
  skylights: Skylight[],
  dimensions: BuildingDimensions
): {
  valid: boolean;
  errors: string[];
  warnings: string[];
  statistics: {
    totalSegments: number;
    segmentsByType: Record<string, number>;
    averageSegmentLength: number;
    skylightsCovered: number;
  };
} => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Convert skylights to bounds for validation
  const skylightBounds = skylights.map(skylight => 
    convertSkylightToRoofCoordinates(skylight, dimensions)
  );
  
  // Check that no segments intersect with skylights
  let skylightIntersections = 0;
  segments.forEach(segment => {
    skylightBounds.forEach(bounds => {
      if (lineIntersectsSkylightBounds(
        segment.startX, segment.startY, segment.endX, segment.endY, bounds
      )) {
        skylightIntersections++;
        errors.push(`Roof line segment ${segment.id} intersects with skylight on ${bounds.panel} panel`);
      }
    });
  });
  
  // Calculate statistics
  const segmentsByType = segments.reduce((acc, segment) => {
    acc[segment.type] = (acc[segment.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const totalLength = segments.reduce((sum, segment) => {
    return sum + Math.sqrt(
      Math.pow(segment.endX - segment.startX, 2) + 
      Math.pow(segment.endY - segment.startY, 2)
    );
  }, 0);
  
  const averageSegmentLength = segments.length > 0 ? totalLength / segments.length : 0;
  
  // Warnings for potential issues
  if (segments.length === 0) {
    warnings.push('No roof line segments generated - all lines may have been trimmed away');
  }
  
  if (skylightIntersections > 0) {
    warnings.push(`${skylightIntersections} roof line segments still intersect with skylights`);
  }
  
  const statistics = {
    totalSegments: segments.length,
    segmentsByType,
    averageSegmentLength,
    skylightsCovered: skylights.length
  };
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
    statistics
  };
};