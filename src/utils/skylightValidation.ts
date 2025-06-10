import type { Skylight, BuildingDimensions } from '../types';

export interface SkylightBounds {
  maxXOffset: number;
  minXOffset: number;
  maxYOffset: number;
  minYOffset: number;
  maxWidth: number;
  maxLength: number;
}

export interface SkylightValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  bounds: SkylightBounds;
}

/**
 * Calculates the valid bounds for skylights on the roof
 */
export const getSkylightBounds = (dimensions: BuildingDimensions): SkylightBounds => {
  const { width, length } = dimensions;
  
  // Skylights must be positioned within the roof panels
  // Leave a margin from roof edges for structural integrity
  const edgeMargin = 1.0; // 1 foot margin from roof edges
  
  return {
    // X-axis bounds (left/right on roof)
    maxXOffset: width / 2 - edgeMargin,
    minXOffset: -width / 2 + edgeMargin,
    
    // Y-axis bounds (front/back on roof)
    maxYOffset: length / 2 - edgeMargin,
    minYOffset: -length / 2 + edgeMargin,
    
    // Maximum dimensions
    maxWidth: width - (2 * edgeMargin),
    maxLength: length - (2 * edgeMargin)
  };
};

/**
 * Validates a single skylight against roof bounds
 */
export const validateSkylight = (
  skylight: Skylight,
  dimensions: BuildingDimensions
): SkylightValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const bounds = getSkylightBounds(dimensions);
  
  console.log(`\n🏠 SKYLIGHT VALIDATION`);
  console.log(`Roof dimensions: ${dimensions.width}ft × ${dimensions.length}ft`);
  console.log(`Skylight: ${skylight.width}ft × ${skylight.length}ft at (${skylight.xOffset}, ${skylight.yOffset})`);
  console.log(`Valid bounds: X(${bounds.minXOffset} to ${bounds.maxXOffset}), Y(${bounds.minYOffset} to ${bounds.maxYOffset})`);
  
  // Calculate skylight edges
  const skylightLeft = skylight.xOffset - skylight.width / 2;
  const skylightRight = skylight.xOffset + skylight.width / 2;
  const skylightFront = skylight.yOffset - skylight.length / 2;
  const skylightBack = skylight.yOffset + skylight.length / 2;
  
  console.log(`Skylight edges: Left=${skylightLeft}, Right=${skylightRight}, Front=${skylightFront}, Back=${skylightBack}`);
  
  // Validate X-axis bounds (left/right)
  if (skylightLeft < bounds.minXOffset) {
    const overhang = bounds.minXOffset - skylightLeft;
    errors.push(`Skylight extends ${overhang.toFixed(2)}ft beyond left roof edge`);
  }
  
  if (skylightRight > bounds.maxXOffset) {
    const overhang = skylightRight - bounds.maxXOffset;
    errors.push(`Skylight extends ${overhang.toFixed(2)}ft beyond right roof edge`);
  }
  
  // Validate Y-axis bounds (front/back)
  if (skylightFront < bounds.minYOffset) {
    const overhang = bounds.minYOffset - skylightFront;
    errors.push(`Skylight extends ${overhang.toFixed(2)}ft beyond front roof edge`);
  }
  
  if (skylightBack > bounds.maxYOffset) {
    const overhang = skylightBack - bounds.maxYOffset;
    errors.push(`Skylight extends ${overhang.toFixed(2)}ft beyond back roof edge`);
  }
  
  // Validate dimensions
  if (skylight.width > bounds.maxWidth) {
    errors.push(`Skylight width (${skylight.width}ft) exceeds maximum allowed (${bounds.maxWidth}ft)`);
  }
  
  if (skylight.length > bounds.maxLength) {
    errors.push(`Skylight length (${skylight.length}ft) exceeds maximum allowed (${bounds.maxLength}ft)`);
  }
  
  // Warnings for skylights too close to edges
  const warningMargin = 0.5; // 6 inches
  
  if (skylightLeft - bounds.minXOffset < warningMargin && skylightLeft >= bounds.minXOffset) {
    warnings.push(`Skylight is very close to left roof edge (${(skylightLeft - bounds.minXOffset).toFixed(2)}ft clearance)`);
  }
  
  if (bounds.maxXOffset - skylightRight < warningMargin && skylightRight <= bounds.maxXOffset) {
    warnings.push(`Skylight is very close to right roof edge (${(bounds.maxXOffset - skylightRight).toFixed(2)}ft clearance)`);
  }
  
  if (skylightFront - bounds.minYOffset < warningMargin && skylightFront >= bounds.minYOffset) {
    warnings.push(`Skylight is very close to front roof edge (${(skylightFront - bounds.minYOffset).toFixed(2)}ft clearance)`);
  }
  
  if (bounds.maxYOffset - skylightBack < warningMargin && skylightBack <= bounds.maxYOffset) {
    warnings.push(`Skylight is very close to back roof edge (${(bounds.maxYOffset - skylightBack).toFixed(2)}ft clearance)`);
  }
  
  const isValid = errors.length === 0;
  console.log(`Validation result: ${isValid ? '✅ VALID' : '❌ INVALID'} (${errors.length} errors, ${warnings.length} warnings)`);
  
  return {
    valid: isValid,
    errors,
    warnings,
    bounds
  };
};

/**
 * Validates all skylights against roof bounds
 */
export const validateAllSkylights = (
  skylights: Skylight[],
  dimensions: BuildingDimensions
): {
  valid: boolean;
  errors: string[];
  warnings: string[];
  skylightValidations: SkylightValidationResult[];
} => {
  console.log(`\n🏠 === COMPREHENSIVE SKYLIGHT VALIDATION ===`);
  console.log(`Roof dimensions: ${dimensions.width}ft × ${dimensions.length}ft`);
  console.log(`Total skylights to validate: ${skylights.length}`);
  
  const allErrors: string[] = [];
  const allWarnings: string[] = [];
  const skylightValidations: SkylightValidationResult[] = [];
  
  skylights.forEach((skylight, index) => {
    console.log(`\n--- Skylight ${index + 1}/${skylights.length} ---`);
    
    const validation = validateSkylight(skylight, dimensions);
    skylightValidations.push(validation);
    
    allErrors.push(...validation.errors);
    allWarnings.push(...validation.warnings);
  });
  
  // Check for skylight overlaps
  for (let i = 0; i < skylights.length; i++) {
    for (let j = i + 1; j < skylights.length; j++) {
      const skylight1 = skylights[i];
      const skylight2 = skylights[j];
      
      const overlap = checkSkylightOverlap(skylight1, skylight2);
      if (overlap.overlaps) {
        allErrors.push(`Skylights ${i + 1} and ${j + 1} overlap`);
      }
    }
  }
  
  const overallValid = allErrors.length === 0;
  
  console.log(`\n📊 OVERALL SKYLIGHT VALIDATION SUMMARY:`);
  console.log(`Total errors: ${allErrors.length}`);
  console.log(`Total warnings: ${allWarnings.length}`);
  console.log(`Overall result: ${overallValid ? '✅ ALL SKYLIGHTS WITHIN BOUNDS' : '❌ SOME SKYLIGHTS OUT OF BOUNDS'}`);
  
  return {
    valid: overallValid,
    errors: allErrors,
    warnings: allWarnings,
    skylightValidations
  };
};

/**
 * Checks if two skylights overlap
 */
export const checkSkylightOverlap = (
  skylight1: Skylight,
  skylight2: Skylight
): { overlaps: boolean; overlapArea?: number } => {
  const s1Left = skylight1.xOffset - skylight1.width / 2;
  const s1Right = skylight1.xOffset + skylight1.width / 2;
  const s1Front = skylight1.yOffset - skylight1.length / 2;
  const s1Back = skylight1.yOffset + skylight1.length / 2;
  
  const s2Left = skylight2.xOffset - skylight2.width / 2;
  const s2Right = skylight2.xOffset + skylight2.width / 2;
  const s2Front = skylight2.yOffset - skylight2.length / 2;
  const s2Back = skylight2.yOffset + skylight2.length / 2;
  
  // Check for overlap
  const xOverlap = Math.max(0, Math.min(s1Right, s2Right) - Math.max(s1Left, s2Left));
  const yOverlap = Math.max(0, Math.min(s1Back, s2Back) - Math.max(s1Front, s2Front));
  
  const overlaps = xOverlap > 0 && yOverlap > 0;
  const overlapArea = overlaps ? xOverlap * yOverlap : 0;
  
  return { overlaps, overlapArea };
};

/**
 * Suggests valid positioning for a skylight that's out of bounds
 */
export const suggestValidSkylightPosition = (
  skylight: Skylight,
  dimensions: BuildingDimensions
): {
  suggestedXOffset: number;
  suggestedYOffset: number;
  suggestedWidth: number;
  suggestedLength: number;
  adjustments: string[];
} => {
  const bounds = getSkylightBounds(dimensions);
  const adjustments: string[] = [];
  
  let suggestedWidth = skylight.width;
  let suggestedLength = skylight.length;
  let suggestedXOffset = skylight.xOffset;
  let suggestedYOffset = skylight.yOffset;
  
  // Adjust dimensions if too large
  if (skylight.width > bounds.maxWidth) {
    suggestedWidth = bounds.maxWidth * 0.9; // 90% of max width
    adjustments.push(`Reduced width from ${skylight.width}ft to ${suggestedWidth.toFixed(2)}ft to fit roof`);
  }
  
  if (skylight.length > bounds.maxLength) {
    suggestedLength = bounds.maxLength * 0.9; // 90% of max length
    adjustments.push(`Reduced length from ${skylight.length}ft to ${suggestedLength.toFixed(2)}ft to fit roof`);
  }
  
  // Adjust position to keep within bounds
  const halfWidth = suggestedWidth / 2;
  const halfLength = suggestedLength / 2;
  
  // X-axis adjustment
  if (suggestedXOffset - halfWidth < bounds.minXOffset) {
    suggestedXOffset = bounds.minXOffset + halfWidth;
    adjustments.push(`Moved right to stay within roof bounds`);
  } else if (suggestedXOffset + halfWidth > bounds.maxXOffset) {
    suggestedXOffset = bounds.maxXOffset - halfWidth;
    adjustments.push(`Moved left to stay within roof bounds`);
  }
  
  // Y-axis adjustment
  if (suggestedYOffset - halfLength < bounds.minYOffset) {
    suggestedYOffset = bounds.minYOffset + halfLength;
    adjustments.push(`Moved back to stay within roof bounds`);
  } else if (suggestedYOffset + halfLength > bounds.maxYOffset) {
    suggestedYOffset = bounds.maxYOffset - halfLength;
    adjustments.push(`Moved forward to stay within roof bounds`);
  }
  
  return {
    suggestedXOffset,
    suggestedYOffset,
    suggestedWidth,
    suggestedLength,
    adjustments
  };
};

/**
 * Gets the maximum allowed dimensions for a skylight at a specific position
 */
export const getMaxAllowedSkylightDimensions = (
  xOffset: number,
  yOffset: number,
  dimensions: BuildingDimensions
): { maxWidth: number; maxLength: number } => {
  const bounds = getSkylightBounds(dimensions);
  
  // Calculate maximum width based on position
  const distanceToLeft = xOffset - bounds.minXOffset;
  const distanceToRight = bounds.maxXOffset - xOffset;
  const maxWidth = Math.min(distanceToLeft, distanceToRight) * 2;
  
  // Calculate maximum length based on position
  const distanceToFront = yOffset - bounds.minYOffset;
  const distanceToBack = bounds.maxYOffset - yOffset;
  const maxLength = Math.min(distanceToFront, distanceToBack) * 2;
  
  return {
    maxWidth: Math.max(0, Math.min(maxWidth, bounds.maxWidth)),
    maxLength: Math.max(0, Math.min(maxLength, bounds.maxLength))
  };
};

/**
 * Checks if a skylight position is valid for the given roof
 */
export const isValidSkylightPosition = (
  skylight: Skylight,
  dimensions: BuildingDimensions
): boolean => {
  const validation = validateSkylight(skylight, dimensions);
  return validation.valid;
};