import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Info, Shield, Zap, Droplets, Wind, Home, Ruler } from 'lucide-react';
import { useBuildingStore } from '../../store/buildingStore';
import { validateWallHeights, DEFAULT_BUILDING_CODE_REQUIREMENTS } from '../../utils/wallHeightValidation';
import { validateRoomDimensions, STANDARD_ROOM_CONSTRAINTS } from '../../utils/roomConstraints';
import type { BuildingCodeRequirements } from '../../types';

const DimensionsPanel: React.FC = () => {
  const { dimensions, features, updateDimensions } = useBuildingStore((state) => ({
    dimensions: state.currentProject.building.dimensions,
    features: state.currentProject.building.features,
    updateDimensions: state.updateDimensions
  }));

  const [heightWarning, setHeightWarning] = useState<string[]>([]);
  const [minimumHeight, setMinimumHeight] = useState<number | null>(null);
  const [heightBreakdown, setHeightBreakdown] = useState<any>(null);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [roomValidation, setRoomValidation] = useState<any>(null);

  // Use default building code requirements
  const buildingCodeRequirements: BuildingCodeRequirements = DEFAULT_BUILDING_CODE_REQUIREMENTS;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, dimension: keyof typeof dimensions) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      // Validate room constraints first
      const proposedDimensions = { ...dimensions, [dimension]: value };
      const roomValidationResult = validateRoomDimensions(proposedDimensions, STANDARD_ROOM_CONSTRAINTS);
      setRoomValidation(roomValidationResult);

      // If changing height, validate against building code requirements
      if (dimension === 'height') {
        const newDimensions = { ...dimensions, height: value };
        const validation = validateWallHeights(newDimensions, features, buildingCodeRequirements);
        
        if (!validation.valid) {
          setHeightWarning(validation.errors);
          setMinimumHeight(validation.minimumRequiredHeight || null);
          setHeightBreakdown(validation.breakdown || null);
          
          // Prevent updating if height is below minimum requirement
          const isBelowMinimum = validation.errors.some(error => 
            error.includes('below minimum required height')
          );
          
          if (isBelowMinimum) {
            console.log(`❌ Preventing height update: ${value}ft is below minimum required height`);
            return; // Don't update dimensions if below minimum
          }
        } else {
          setHeightWarning(validation.warnings || []);
          setMinimumHeight(validation.minimumRequiredHeight || null);
          setHeightBreakdown(validation.breakdown || null);
        }
      }
      
      updateDimensions({ [dimension]: value });
    }
  };

  // Check if any features would be invalid with current height
  const invalidFeatures = features.filter(feature => 
    feature.height > dimensions.height || 
    feature.position.yOffset + feature.height > dimensions.height
  );

  // Calculate current minimum required height
  const currentValidation = validateWallHeights(dimensions, features, buildingCodeRequirements);
  const currentMinimumHeight = currentValidation.minimumRequiredHeight || buildingCodeRequirements.minimumCeilingHeight;
  const heightClearance = dimensions.height - currentMinimumHeight;

  // Get current room validation
  const currentRoomValidation = validateRoomDimensions(dimensions, STANDARD_ROOM_CONSTRAINTS);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Room Constraints Info */}
      <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <Home className="w-4 h-4 text-green-600" />
          <span className="text-sm font-medium text-green-800">Room Minimum Requirements</span>
        </div>
        <div className="text-xs text-green-700 space-y-1">
          <div>Minimum width: {STANDARD_ROOM_CONSTRAINTS.minimumWallWidth}ft</div>
          <div>Minimum length: {STANDARD_ROOM_CONSTRAINTS.minimumWallLength}ft</div>
          <div>Minimum height: {STANDARD_ROOM_CONSTRAINTS.minimumWallHeight}ft</div>
          <div className={`font-medium ${currentRoomValidation.valid ? 'text-green-700' : 'text-red-700'}`}>
            {currentRoomValidation.valid 
              ? '✅ All minimums met'
              : '❌ Below minimum requirements'
            }
          </div>
        </div>
      </div>

      {/* Room Validation Errors */}
      {roomValidation && !roomValidation.valid && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span className="text-sm font-medium text-red-800">Room Dimension Errors</span>
          </div>
          <ul className="text-xs text-red-700 space-y-1">
            {roomValidation.errors.map((error: string, index: number) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
          {roomValidation.adjustedDimensions && (
            <div className="mt-2 p-2 bg-red-100 rounded">
              <div className="text-xs font-medium text-red-800">
                Suggested: {roomValidation.adjustedDimensions.width}ft × {roomValidation.adjustedDimensions.length}ft × {roomValidation.adjustedDimensions.height}ft
              </div>
            </div>
          )}
        </div>
      )}

      {/* Building Code Requirements Info */}
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <Shield className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-800">Building Code Compliance</span>
        </div>
        <div className="text-xs text-blue-700 space-y-1">
          <div>Minimum ceiling height: {buildingCodeRequirements.minimumCeilingHeight}ft</div>
          <div>Current minimum required: {currentMinimumHeight.toFixed(2)}ft</div>
          <div className={`font-medium ${heightClearance >= 0 ? 'text-green-700' : 'text-red-700'}`}>
            {heightClearance >= 0 
              ? `✅ ${heightClearance.toFixed(2)}ft clearance above minimum`
              : `❌ ${Math.abs(heightClearance).toFixed(2)}ft below minimum`
            }
          </div>
        </div>
      </div>

      {/* Height validation warning */}
      {heightWarning.length > 0 && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span className="text-sm font-medium text-red-800">Height Validation Errors</span>
          </div>
          <ul className="text-xs text-red-700 space-y-1">
            {heightWarning.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
          {minimumHeight && (
            <div className="mt-2 p-2 bg-red-100 rounded">
              <div className="text-xs font-medium text-red-800">
                Required minimum height: {minimumHeight.toFixed(2)}ft
              </div>
              {heightBreakdown && (
                <button
                  onClick={() => setShowBreakdown(!showBreakdown)}
                  className="text-xs text-red-600 hover:text-red-800 underline mt-1"
                >
                  {showBreakdown ? 'Hide' : 'Show'} height calculation breakdown
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Height Breakdown Modal */}
      {showBreakdown && heightBreakdown && (
        <div className="mb-4 bg-gray-50 border border-gray-200 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-800">Height Requirement Breakdown</span>
            <button
              onClick={() => setShowBreakdown(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>
          <div className="space-y-2 text-xs text-gray-700">
            <div className="flex items-center space-x-2">
              <Home className="w-3 h-3" />
              <span>Base ceiling: {heightBreakdown.baseCeilingHeight}ft</span>
            </div>
            {heightBreakdown.highestFeatureRequirement > 0 && (
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-3 h-3" />
                <span>Highest feature: {heightBreakdown.highestFeatureRequirement.toFixed(2)}ft</span>
              </div>
            )}
            {heightBreakdown.electricalRequirement > 0 && (
              <div className="flex items-center space-x-2">
                <Zap className="w-3 h-3" />
                <span>Electrical: {heightBreakdown.electricalRequirement.toFixed(2)}ft</span>
              </div>
            )}
            {heightBreakdown.plumbingRequirement > 0 && (
              <div className="flex items-center space-x-2">
                <Droplets className="w-3 h-3" />
                <span>Plumbing: {heightBreakdown.plumbingRequirement.toFixed(2)}ft</span>
              </div>
            )}
            {heightBreakdown.ventilationRequirement > 0 && (
              <div className="flex items-center space-x-2">
                <Wind className="w-3 h-3" />
                <span>HVAC: +{heightBreakdown.ventilationRequirement.toFixed(2)}ft</span>
              </div>
            )}
            <div className="border-t pt-2 font-medium">
              Final minimum: {heightBreakdown.finalMinimum.toFixed(2)}ft
            </div>
          </div>
        </div>
      )}

      {/* Invalid features warning */}
      {invalidFeatures.length > 0 && (
        <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-800">
              {invalidFeatures.length} Feature(s) Exceed Wall Height
            </span>
          </div>
          <ul className="text-xs text-yellow-700 space-y-1">
            {invalidFeatures.map((feature, index) => (
              <li key={index}>
                • {feature.type} on {feature.position.wallPosition} wall 
                ({feature.height}ft height, position: {feature.position.yOffset}ft)
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mb-4">
        <label htmlFor="width" className="form-label">
          Width (ft)
          <span className="text-xs text-gray-500 ml-1">
            (min: {STANDARD_ROOM_CONSTRAINTS.minimumWallWidth}ft)
          </span>
        </label>
        <div className="flex items-center">
          <input
            type="range"
            id="width-range"
            min={STANDARD_ROOM_CONSTRAINTS.minimumWallWidth}
            max="60"
            step="1"
            value={dimensions.width}
            onChange={(e) => handleChange(e, 'width')}
            className="flex-1 mr-3"
          />
          <input
            type="number"
            id="width"
            min={STANDARD_ROOM_CONSTRAINTS.minimumWallWidth}
            max="60"
            value={dimensions.width}
            onChange={(e) => handleChange(e, 'width')}
            className={`w-20 form-input ${dimensions.width < STANDARD_ROOM_CONSTRAINTS.minimumWallWidth ? 'border-red-300 bg-red-50' : ''}`}
          />
        </div>
        {dimensions.width < STANDARD_ROOM_CONSTRAINTS.minimumWallWidth && (
          <p className="text-xs text-red-600 mt-1">
            Below minimum width requirement
          </p>
        )}
      </div>
      
      <div className="mb-4">
        <label htmlFor="length" className="form-label">
          Length (ft)
          <span className="text-xs text-gray-500 ml-1">
            (min: {STANDARD_ROOM_CONSTRAINTS.minimumWallLength}ft)
          </span>
        </label>
        <div className="flex items-center">
          <input
            type="range"
            id="length-range"
            min={STANDARD_ROOM_CONSTRAINTS.minimumWallLength}
            max="100"
            step="1"
            value={dimensions.length}
            onChange={(e) => handleChange(e, 'length')}
            className="flex-1 mr-3"
          />
          <input
            type="number"
            id="length"
            min={STANDARD_ROOM_CONSTRAINTS.minimumWallLength}
            max="100"
            value={dimensions.length}
            onChange={(e) => handleChange(e, 'length')}
            className={`w-20 form-input ${dimensions.length < STANDARD_ROOM_CONSTRAINTS.minimumWallLength ? 'border-red-300 bg-red-50' : ''}`}
          />
        </div>
        {dimensions.length < STANDARD_ROOM_CONSTRAINTS.minimumWallLength && (
          <p className="text-xs text-red-600 mt-1">
            Below minimum length requirement
          </p>
        )}
      </div>
      
      <div className="mb-4">
        <label htmlFor="height" className="form-label">
          Wall Height (ft)
          <span className="text-xs text-gray-500 ml-1">
            (min: {Math.max(STANDARD_ROOM_CONSTRAINTS.minimumWallHeight, currentMinimumHeight).toFixed(1)}ft)
          </span>
          {features.length > 0 && (
            <span className="text-xs text-gray-500 ml-1">
              (affects {features.length} feature{features.length !== 1 ? 's' : ''})
            </span>
          )}
        </label>
        <div className="flex items-center">
          <input
            type="range"
            id="height-range"
            min={Math.max(STANDARD_ROOM_CONSTRAINTS.minimumWallHeight, currentMinimumHeight)}
            max="20"
            step="0.5"
            value={dimensions.height}
            onChange={(e) => handleChange(e, 'height')}
            className="flex-1 mr-3"
          />
          <input
            type="number"
            id="height"
            min={Math.max(STANDARD_ROOM_CONSTRAINTS.minimumWallHeight, currentMinimumHeight)}
            max="20"
            step="0.5"
            value={dimensions.height}
            onChange={(e) => handleChange(e, 'height')}
            className={`w-20 form-input ${heightWarning.length > 0 ? 'border-red-300 bg-red-50' : ''}`}
          />
        </div>
        
        {/* Height constraint information */}
        <div className="mt-2 text-xs text-gray-600">
          <div>Room minimum: {STANDARD_ROOM_CONSTRAINTS.minimumWallHeight}ft</div>
          <div>Code minimum: {currentMinimumHeight.toFixed(2)}ft</div>
          {heightClearance >= 0 && (
            <div className="text-green-600">Current clearance: {heightClearance.toFixed(2)}ft</div>
          )}
        </div>
        
        {features.length > 0 && (
          <div className="mt-2 bg-blue-50 border border-blue-200 rounded p-2">
            <div className="flex items-center space-x-2 mb-1">
              <Info className="w-3 h-3 text-blue-600" />
              <span className="text-xs font-medium text-blue-800">Feature Height Summary</span>
            </div>
            <div className="text-xs text-blue-700 space-y-1">
              {features.map((feature, index) => (
                <div key={index} className="flex justify-between">
                  <span>{feature.type} ({feature.position.wallPosition})</span>
                  <span className={
                    feature.height > dimensions.height || 
                    feature.position.yOffset + feature.height > dimensions.height
                      ? 'text-red-600 font-medium' 
                      : 'text-green-600'
                  }>
                    {feature.height}ft
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <div className="mt-4 p-3 bg-gray-50 rounded-md border border-gray-100">
        <div className="flex items-center space-x-2 mb-2">
          <Ruler className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Room Summary</span>
        </div>
        <p className="text-sm text-gray-800">
          Room footprint: {dimensions.width} × {dimensions.length} ft
          <br />
          Total area: {dimensions.width * dimensions.length} sq ft
          <br />
          Wall height: {dimensions.height} ft
          <br />
          <span className={`${currentRoomValidation.valid && heightClearance >= 0 ? 'text-green-700' : 'text-red-700'}`}>
            Compliance: {currentRoomValidation.valid && heightClearance >= 0 ? '✅ Meets all requirements' : '❌ Below requirements'}
          </span>
        </p>
      </div>
    </motion.div>
  );
};

export default DimensionsPanel;