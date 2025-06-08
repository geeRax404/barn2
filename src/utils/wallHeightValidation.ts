import type { WallFeature, BuildingDimensions } from '../types';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface FeatureValidationDetails {
  feature: WallFeature;
  individualValid: boolean;
  positionValid: boolean;
  errors: string[];
}

/**
 * Validates that a single feature doesn't exceed wall height constraints
 */
export const validateFeatureHeight = (
  feature: WallFeature,
  wallHeight: number
): FeatureValidationDetails => {
  const errors: string[] = [];
  let individualValid = true;
  let positionValid = true;

  // Check if individual feature height exceeds wall height
  if (feature.height > wallHeight) {
    errors.push(`Error: ${feature.type} height (${feature.height}ft) exceeds wall height (${wallHeight}ft)`);
    individualValid = false;
  }

  // Check if feature position + height exceeds wall height
  const featureTop = feature.position.yOffset + feature.height;
  if (featureTop > wallHeight) {
    errors.push(`Error: ${feature.type} extends beyond wall top (position: ${feature.position.yOffset}ft + height: ${feature.height}ft = ${featureTop}ft > ${wallHeight}ft)`);
    positionValid = false;
  }

  // Check if feature position is below ground level
  if (feature.position.yOffset < 0) {
    errors.push(`Error: ${feature.type} position (${feature.position.yOffset}ft) is below ground level`);
    positionValid = false;
  }

  return {
    feature,
    individualValid,
    positionValid,
    errors
  };
};

/**
 * Validates stacked features on the same wall position
 */
export const validateStackedFeatures = (
  features: WallFeature[],
  wallHeight: number,
  wallPosition: string
): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Group features by wall position and horizontal overlap
  const wallFeatures = features.filter(f => f.position.wallPosition === wallPosition);
  
  // Check for vertically stacked features (same horizontal position)
  const featureGroups = new Map<string, WallFeature[]>();
  
  wallFeatures.forEach(feature => {
    // Create a key based on horizontal position for grouping
    let horizontalKey = '';
    switch (feature.position.alignment) {
      case 'left':
        horizontalKey = `left-${feature.position.xOffset}`;
        break;
      case 'right':
        horizontalKey = `right-${feature.position.xOffset}`;
        break;
      case 'center':
        horizontalKey = `center-${feature.position.xOffset}`;
        break;
    }
    
    if (!featureGroups.has(horizontalKey)) {
      featureGroups.set(horizontalKey, []);
    }
    featureGroups.get(horizontalKey)!.push(feature);
  });

  // Validate each group for vertical stacking
  featureGroups.forEach((groupFeatures, position) => {
    if (groupFeatures.length > 1) {
      // Sort by vertical position (yOffset)
      const sortedFeatures = groupFeatures.sort((a, b) => a.position.yOffset - b.position.yOffset);
      
      let totalStackedHeight = 0;
      let currentTop = 0;
      
      sortedFeatures.forEach((feature, index) => {
        const featureBottom = feature.position.yOffset;
        const featureTop = featureBottom + feature.height;
        
        // Check for overlap with previous feature
        if (index > 0 && featureBottom < currentTop) {
          errors.push(`Error: ${feature.type} overlaps with feature above it at ${position} position`);
        }
        
        totalStackedHeight += feature.height;
        currentTop = Math.max(currentTop, featureTop);
      });
      
      // Check if total stacked height exceeds wall height
      if (currentTop > wallHeight) {
        errors.push(`Error: Combined height of stacked features at ${position} (${currentTop.toFixed(1)}ft) exceeds wall height (${wallHeight}ft)`);
      }
      
      // Warning for high stacking ratio
      if (totalStackedHeight / wallHeight > 0.8) {
        warnings.push(`Warning: High feature density at ${position} position may affect structural integrity`);
      }
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Comprehensive wall height validation for all features
 */
export const validateWallHeights = (
  dimensions: BuildingDimensions,
  features: WallFeature[]
): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const wallHeight = dimensions.height;

  console.log(`\n🏗️ WALL HEIGHT VALIDATION`);
  console.log(`Wall height: ${wallHeight}ft`);
  console.log(`Total features to validate: ${features.length}`);

  // Validate each individual feature
  const featureValidations = features.map(feature => 
    validateFeatureHeight(feature, wallHeight)
  );

  // Collect individual feature errors
  featureValidations.forEach(validation => {
    errors.push(...validation.errors);
  });

  // Validate stacked features for each wall
  const wallPositions = ['front', 'back', 'left', 'right'];
  wallPositions.forEach(wallPosition => {
    const stackValidation = validateStackedFeatures(features, wallHeight, wallPosition);
    errors.push(...stackValidation.errors);
    warnings.push(...stackValidation.warnings);
  });

  // Additional structural warnings
  const totalFeatureArea = features.reduce((sum, feature) => sum + (feature.width * feature.height), 0);
  const wallArea = dimensions.width * 2 * wallHeight + dimensions.length * 2 * wallHeight; // Total wall area
  const openingRatio = totalFeatureArea / wallArea;

  if (openingRatio > 0.4) {
    warnings.push(`Warning: High opening ratio (${(openingRatio * 100).toFixed(1)}%) may require additional structural support`);
  }

  console.log(`Validation complete: ${errors.length} errors, ${warnings.length} warnings`);

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Validates a new feature before adding it to the building
 */
export const validateNewFeature = (
  newFeature: Omit<WallFeature, 'id'>,
  existingFeatures: WallFeature[],
  wallHeight: number
): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Create a temporary feature with ID for validation
  const tempFeature: WallFeature = {
    ...newFeature,
    id: 'temp-validation'
  };

  // Validate individual feature height
  const featureValidation = validateFeatureHeight(tempFeature, wallHeight);
  errors.push(...featureValidation.errors);

  // Validate against existing features on the same wall
  const wallFeatures = existingFeatures.filter(f => 
    f.position.wallPosition === newFeature.position.wallPosition
  );

  // Check for conflicts with existing features
  wallFeatures.forEach(existing => {
    // Check for horizontal overlap
    const newLeft = getFeatureLeft(tempFeature);
    const newRight = newLeft + newFeature.width;
    const existingLeft = getFeatureLeft(existing);
    const existingRight = existingLeft + existing.width;

    const horizontalOverlap = !(newRight <= existingLeft || newLeft >= existingRight);

    if (horizontalOverlap) {
      // Check for vertical overlap
      const newBottom = newFeature.position.yOffset;
      const newTop = newBottom + newFeature.height;
      const existingBottom = existing.position.yOffset;
      const existingTop = existingBottom + existing.height;

      const verticalOverlap = !(newTop <= existingBottom || newBottom >= existingTop);

      if (verticalOverlap) {
        errors.push(`Error: ${newFeature.type} overlaps with existing ${existing.type}`);
      }
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Helper function to get the left edge position of a feature
 */
const getFeatureLeft = (feature: WallFeature): number => {
  // This would need to be calculated based on wall width and alignment
  // For now, return the xOffset as a simplified calculation
  switch (feature.position.alignment) {
    case 'left':
      return feature.position.xOffset;
    case 'right':
      return -feature.position.xOffset - feature.width;
    case 'center':
    default:
      return feature.position.xOffset - feature.width / 2;
  }
};

/**
 * Get maximum allowed height for a feature at a specific position
 */
export const getMaxAllowedHeight = (
  position: { yOffset: number },
  wallHeight: number
): number => {
  return wallHeight - position.yOffset;
};

/**
 * Suggest valid positioning for a feature that exceeds constraints
 */
export const suggestValidPosition = (
  feature: Omit<WallFeature, 'id'>,
  wallHeight: number
): { yOffset: number; height: number } => {
  let suggestedHeight = feature.height;
  let suggestedYOffset = feature.position.yOffset;

  // If feature height exceeds wall height, reduce it
  if (feature.height > wallHeight) {
    suggestedHeight = wallHeight * 0.8; // 80% of wall height as maximum
  }

  // If position + height exceeds wall height, adjust position
  if (feature.position.yOffset + suggestedHeight > wallHeight) {
    suggestedYOffset = wallHeight - suggestedHeight;
  }

  // Ensure position is not below ground
  if (suggestedYOffset < 0) {
    suggestedYOffset = 0;
  }

  return {
    yOffset: Math.max(0, suggestedYOffset),
    height: Math.min(suggestedHeight, wallHeight)
  };
};