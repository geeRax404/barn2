import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, X, Move, Edit2, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { useBuildingStore } from '../../store/buildingStore';
import { 
  validateNewFeature, 
  validateWallHeights, 
  getMaxAllowedHeight,
  suggestValidPosition 
} from '../../utils/wallHeightValidation';
import type { FeatureType, WallPosition } from '../../types';

const WallFeaturesPanel: React.FC = () => {
  const { dimensions, features, addFeature, removeFeature, updateFeature } = useBuildingStore((state) => ({
    dimensions: state.currentProject.building.dimensions,
    features: state.currentProject.building.features,
    addFeature: state.addFeature,
    removeFeature: state.removeFeature,
    updateFeature: state.updateFeature
  }));
  
  const [editingFeature, setEditingFeature] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
  const [newFeature, setNewFeature] = useState({
    type: 'door' as FeatureType,
    width: 3,
    height: 7,
    wallPosition: 'front' as WallPosition,
    xOffset: 0,
    alignment: 'center' as 'left' | 'center' | 'right',
    yOffset: 0
  });

  // Validate all existing features whenever dimensions or features change
  useEffect(() => {
    const validation = validateWallHeights(dimensions, features);
    setValidationErrors(validation.errors);
    setValidationWarnings(validation.warnings);
  }, [dimensions, features]);

  // Get maximum allowed height for current position
  const maxAllowedHeight = getMaxAllowedHeight(
    { yOffset: newFeature.yOffset },
    dimensions.height
  );

  const handleAddFeature = () => {
    // Validate the new feature before adding
    const validation = validateNewFeature(
      {
        type: newFeature.type,
        width: newFeature.width,
        height: newFeature.height,
        position: {
          wallPosition: newFeature.wallPosition,
          xOffset: newFeature.xOffset,
          yOffset: newFeature.yOffset,
          alignment: newFeature.alignment
        }
      },
      features,
      dimensions.height
    );

    if (!validation.valid) {
      setValidationErrors(validation.errors);
      return;
    }

    // Clear validation errors and add the feature
    setValidationErrors([]);
    addFeature({
      type: newFeature.type,
      width: newFeature.width,
      height: newFeature.height,
      position: {
        wallPosition: newFeature.wallPosition,
        xOffset: newFeature.xOffset,
        yOffset: newFeature.yOffset,
        alignment: newFeature.alignment
      }
    });
    
    setNewFeature({
      ...newFeature,
      xOffset: 0,
      yOffset: 0
    });
  };

  const handleUpdateFeature = (id: string) => {
    const feature = features.find(f => f.id === id);
    if (!feature) return;

    // Validate the updated feature
    const validation = validateNewFeature(
      {
        type: newFeature.type,
        width: newFeature.width,
        height: newFeature.height,
        position: {
          wallPosition: newFeature.wallPosition,
          xOffset: newFeature.xOffset,
          yOffset: newFeature.yOffset,
          alignment: newFeature.alignment
        }
      },
      features.filter(f => f.id !== id), // Exclude the feature being updated
      dimensions.height
    );

    if (!validation.valid) {
      setValidationErrors(validation.errors);
      return;
    }

    setValidationErrors([]);
    updateFeature(id, {
      type: newFeature.type,
      width: newFeature.width,
      height: newFeature.height,
      position: {
        wallPosition: newFeature.wallPosition,
        xOffset: newFeature.xOffset,
        yOffset: newFeature.yOffset,
        alignment: newFeature.alignment
      }
    });
    setEditingFeature(null);
  };

  const startEditing = (id: string) => {
    const feature = features.find(f => f.id === id);
    if (!feature) return;

    setNewFeature({
      type: feature.type,
      width: feature.width,
      height: feature.height,
      wallPosition: feature.position.wallPosition,
      xOffset: feature.position.xOffset,
      yOffset: feature.position.yOffset,
      alignment: feature.position.alignment
    });
    setEditingFeature(id);
    setValidationErrors([]); // Clear errors when starting to edit
  };

  const handleSuggestValidPosition = () => {
    const suggestion = suggestValidPosition(
      {
        type: newFeature.type,
        width: newFeature.width,
        height: newFeature.height,
        position: {
          wallPosition: newFeature.wallPosition,
          xOffset: newFeature.xOffset,
          yOffset: newFeature.yOffset,
          alignment: newFeature.alignment
        }
      },
      dimensions.height
    );

    setNewFeature({
      ...newFeature,
      height: suggestion.height,
      yOffset: suggestion.yOffset
    });
    setValidationErrors([]);
  };

  // Check if current feature configuration is valid
  const isCurrentFeatureValid = () => {
    if (newFeature.height > dimensions.height) return false;
    if (newFeature.yOffset + newFeature.height > dimensions.height) return false;
    if (newFeature.yOffset < 0) return false;
    return true;
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-4"
    >
      {/* Wall Height Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-center space-x-2 mb-2">
          <Info className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-800">Wall Height: {dimensions.height} ft</span>
        </div>
        <p className="text-xs text-blue-700">
          All doors and windows must fit within this height limit.
        </p>
      </div>

      {/* Global Validation Status */}
      {validationErrors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span className="text-sm font-medium text-red-800">Validation Errors</span>
          </div>
          <ul className="text-xs text-red-700 space-y-1">
            {validationErrors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      {validationWarnings.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-800">Warnings</span>
          </div>
          <ul className="text-xs text-yellow-700 space-y-1">
            {validationWarnings.map((warning, index) => (
              <li key={index}>• {warning}</li>
            ))}
          </ul>
        </div>
      )}

      {validationErrors.length === 0 && validationWarnings.length === 0 && features.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">All features are valid</span>
          </div>
        </div>
      )}

      <div>
        <label htmlFor="featureType" className="form-label">Feature Type</label>
        <select
          id="featureType"
          className="form-input"
          value={newFeature.type}
          onChange={(e) => setNewFeature({ ...newFeature, type: e.target.value as FeatureType })}
        >
          <option value="door">Standard Door</option>
          <option value="window">Window</option>
          <option value="rollupDoor">Roll-up Door</option>
          <option value="walkDoor">Walk Door</option>
        </select>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="featureWidth" className="form-label">Width (ft)</label>
          <input
            type="number"
            id="featureWidth"
            className="form-input"
            min="1"
            max="20"
            step="0.5"
            value={newFeature.width}
            onChange={(e) => setNewFeature({ ...newFeature, width: parseFloat(e.target.value) })}
          />
        </div>
        
        <div>
          <label htmlFor="featureHeight" className="form-label">
            Height (ft)
            <span className="text-xs text-gray-500 ml-1">
              (max: {maxAllowedHeight.toFixed(1)}ft)
            </span>
          </label>
          <input
            type="number"
            id="featureHeight"
            className={`form-input ${newFeature.height > maxAllowedHeight ? 'border-red-300 bg-red-50' : ''}`}
            min="1"
            max={dimensions.height}
            step="0.5"
            value={newFeature.height}
            onChange={(e) => setNewFeature({ ...newFeature, height: parseFloat(e.target.value) })}
          />
          {newFeature.height > maxAllowedHeight && (
            <p className="text-xs text-red-600 mt-1">
              Height exceeds available space at this position
            </p>
          )}
        </div>
      </div>
      
      <div>
        <label htmlFor="wallPosition" className="form-label">Wall</label>
        <select
          id="wallPosition"
          className="form-input"
          value={newFeature.wallPosition}
          onChange={(e) => setNewFeature({ ...newFeature, wallPosition: e.target.value as WallPosition })}
        >
          <option value="front">Front</option>
          <option value="back">Back</option>
          <option value="left">Left</option>
          <option value="right">Right</option>
        </select>
      </div>
      
      <div>
        <label htmlFor="alignment" className="form-label">Alignment</label>
        <select
          id="alignment"
          className="form-input"
          value={newFeature.alignment}
          onChange={(e) => setNewFeature({ ...newFeature, alignment: e.target.value as 'left' | 'center' | 'right' })}
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </div>
      
      <div>
        <label htmlFor="xOffset" className="form-label">Position Offset (ft)</label>
        <input
          type="number"
          id="xOffset"
          className="form-input"
          min="0"
          step="0.5"
          value={newFeature.xOffset}
          onChange={(e) => setNewFeature({ ...newFeature, xOffset: parseFloat(e.target.value) })}
        />
      </div>
      
      <div>
        <label htmlFor="yOffset" className="form-label">
          Height From Bottom (ft)
          <span className="text-xs text-gray-500 ml-1">
            (max: {(dimensions.height - newFeature.height).toFixed(1)}ft)
          </span>
        </label>
        <input
          type="number"
          id="yOffset"
          className={`form-input ${newFeature.yOffset + newFeature.height > dimensions.height ? 'border-red-300 bg-red-50' : ''}`}
          min="0"
          max={dimensions.height - newFeature.height}
          step="0.5"
          value={newFeature.yOffset}
          onChange={(e) => setNewFeature({ ...newFeature, yOffset: parseFloat(e.target.value) })}
        />
        {newFeature.yOffset + newFeature.height > dimensions.height && (
          <p className="text-xs text-red-600 mt-1">
            Feature extends beyond wall height
          </p>
        )}
      </div>

      {/* Auto-fix suggestion button */}
      {!isCurrentFeatureValid() && (
        <button
          className="w-full btn-secondary btn text-sm"
          onClick={handleSuggestValidPosition}
        >
          <AlertTriangle className="w-4 h-4 mr-1" />
          Auto-fix Position & Size
        </button>
      )}
      
      <button
        className={`w-full btn ${!isCurrentFeatureValid() ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={editingFeature ? () => handleUpdateFeature(editingFeature) : handleAddFeature}
        disabled={!isCurrentFeatureValid()}
      >
        {editingFeature ? (
          <>
            <Edit2 className="w-4 h-4 mr-1" />
            Update Feature
          </>
        ) : (
          <>
            <Plus className="w-4 h-4 mr-1" />
            Add Feature
          </>
        )}
      </button>
      
      {features.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Existing Features</h3>
          <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
            {features.map((feature) => {
              const isValid = feature.height <= dimensions.height && 
                             feature.position.yOffset + feature.height <= dimensions.height &&
                             feature.position.yOffset >= 0;
              
              return (
                <div 
                  key={feature.id} 
                  className={`flex items-center justify-between p-2 rounded border ${
                    editingFeature === feature.id 
                      ? 'bg-blue-50 border-blue-200' 
                      : isValid
                        ? 'bg-gray-50 border-gray-200'
                        : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-center">
                    <Move className="w-4 h-4 text-gray-400 mr-2" />
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium capitalize">
                          {feature.type}
                        </p>
                        {!isValid && (
                          <AlertTriangle className="w-3 h-3 text-red-500" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        {feature.position.wallPosition} wall, {feature.width}x{feature.height}ft
                        {!isValid && (
                          <span className="text-red-600 ml-1">(Invalid height)</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      className={`p-1 rounded-full hover:bg-gray-100 ${
                        editingFeature === feature.id ? 'text-blue-500' : 'text-gray-400'
                      }`}
                      onClick={() => {
                        if (editingFeature === feature.id) {
                          setEditingFeature(null);
                          setValidationErrors([]);
                        } else {
                          startEditing(feature.id);
                        }
                      }}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      className="p-1 text-gray-400 hover:text-error rounded-full hover:bg-gray-100"
                      onClick={() => removeFeature(feature.id)}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default WallFeaturesPanel;