import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Info } from 'lucide-react';
import { useBuildingStore } from '../../store/buildingStore';
import { validateWallHeights } from '../../utils/wallHeightValidation';

const DimensionsPanel: React.FC = () => {
  const { dimensions, features, updateDimensions } = useBuildingStore((state) => ({
    dimensions: state.currentProject.building.dimensions,
    features: state.currentProject.building.features,
    updateDimensions: state.updateDimensions
  }));

  const [heightWarning, setHeightWarning] = useState<string[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, dimension: keyof typeof dimensions) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      // If changing height, validate against existing features
      if (dimension === 'height') {
        const newDimensions = { ...dimensions, height: value };
        const validation = validateWallHeights(newDimensions, features);
        
        if (!validation.valid) {
          setHeightWarning(validation.errors);
        } else {
          setHeightWarning([]);
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

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
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
          <p className="text-xs text-red-600 mt-2">
            Please adjust wall height or modify/remove conflicting features.
          </p>
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
        <label htmlFor="width" className="form-label">Width (ft)</label>
        <div className="flex items-center">
          <input
            type="range"
            id="width-range"
            min="10"
            max="60"
            step="1"
            value={dimensions.width}
            onChange={(e) => handleChange(e, 'width')}
            className="flex-1 mr-3"
          />
          <input
            type="number"
            id="width"
            min="10"
            max="60"
            value={dimensions.width}
            onChange={(e) => handleChange(e, 'width')}
            className="w-20 form-input"
          />
        </div>
      </div>
      
      <div className="mb-4">
        <label htmlFor="length" className="form-label">Length (ft)</label>
        <div className="flex items-center">
          <input
            type="range"
            id="length-range"
            min="10"
            max="100"
            step="1"
            value={dimensions.length}
            onChange={(e) => handleChange(e, 'length')}
            className="flex-1 mr-3"
          />
          <input
            type="number"
            id="length"
            min="10"
            max="100"
            value={dimensions.length}
            onChange={(e) => handleChange(e, 'length')}
            className="w-20 form-input"
          />
        </div>
      </div>
      
      <div className="mb-4">
        <label htmlFor="height" className="form-label">
          Wall Height (ft)
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
            min="8"
            max="20"
            step="1"
            value={dimensions.height}
            onChange={(e) => handleChange(e, 'height')}
            className="flex-1 mr-3"
          />
          <input
            type="number"
            id="height"
            min="8"
            max="20"
            value={dimensions.height}
            onChange={(e) => handleChange(e, 'height')}
            className={`w-20 form-input ${heightWarning.length > 0 ? 'border-red-300 bg-red-50' : ''}`}
          />
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
      
      <div className="mt-4 p-3 bg-blue-50 rounded-md border border-blue-100">
        <p className="text-sm text-blue-800">
          Building footprint: {dimensions.width} x {dimensions.length} ft
          <br />
          Total area: {dimensions.width * dimensions.length} sq ft
          <br />
          Wall height: {dimensions.height} ft
        </p>
      </div>
    </motion.div>
  );
};

export default DimensionsPanel;