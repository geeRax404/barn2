import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, X, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { useBuildingStore } from '../../store/buildingStore';
import { 
  validateSkylight, 
  validateAllSkylights, 
  suggestValidSkylightPosition,
  getMaxAllowedSkylightDimensions,
  getSkylightBounds,
  isValidSkylightPosition
} from '../../utils/skylightValidation';
import type { Skylight, RoofPanel } from '../../types';

const RoofPanel: React.FC = () => {
  const { dimensions, skylights, updateDimensions, addSkylight, removeSkylight } = useBuildingStore((state) => ({
    dimensions: state.currentProject.building.dimensions,
    skylights: state.currentProject.building.skylights,
    updateDimensions: state.updateDimensions,
    addSkylight: state.addSkylight,
    removeSkylight: state.removeSkylight
  }));

  const [newSkylight, setNewSkylight] = useState<Skylight>({
    width: 4,
    length: 4,
    xOffset: 0,
    yOffset: 0,
    panel: 'left' as RoofPanel
  });

  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);
  const [skylightValidation, setSkylightValidation] = useState<any>(null);

  // Validate all existing skylights whenever dimensions or skylights change
  useEffect(() => {
    const validation = validateAllSkylights(skylights, dimensions);
    setValidationErrors(validation.errors);
    setValidationWarnings(validation.warnings);
    setSkylightValidation(validation);
  }, [dimensions, skylights]);

  // Get skylight bounds for current roof panel
  const skylightBounds = getSkylightBounds(dimensions, newSkylight.panel);

  // Get maximum allowed dimensions for current position
  const maxAllowedDimensions = getMaxAllowedSkylightDimensions(
    newSkylight.xOffset,
    newSkylight.yOffset,
    dimensions,
    newSkylight.panel
  );

  const handlePitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      updateDimensions({ roofPitch: value });
    }
  };

  const handleAddSkylight = () => {
    // Validate the new skylight before adding
    const validation = validateSkylight(newSkylight, dimensions);

    if (!validation.valid) {
      setValidationErrors(validation.errors);
      return;
    }

    // Clear validation errors and add the skylight
    setValidationErrors([]);
    addSkylight(newSkylight);
    setNewSkylight({ width: 4, length: 4, xOffset: 0, yOffset: 0, panel: 'left' });
  };

  const handleSuggestValidPosition = () => {
    const suggestion = suggestValidSkylightPosition(newSkylight, dimensions);
    
    setNewSkylight({
      width: suggestion.suggestedWidth,
      length: suggestion.suggestedLength,
      xOffset: suggestion.suggestedXOffset,
      yOffset: suggestion.suggestedYOffset,
      panel: newSkylight.panel
    });
    setValidationErrors([]);
  };

  // Check if current skylight configuration is valid
  const isCurrentSkylightValid = () => {
    return isValidSkylightPosition(newSkylight, dimensions);
  };

  // Calculate roof rise based on pitch
  const roofRise = (dimensions.width / 2) * (dimensions.roofPitch / 12);
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Roof Panel Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
        <div className="flex items-center space-x-2 mb-2">
          <Info className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-800">
            {newSkylight.panel.charAt(0).toUpperCase() + newSkylight.panel.slice(1)} Roof Panel
          </span>
        </div>
        <div className="text-xs text-blue-700 space-y-1">
          <div>Panel dimensions: {(dimensions.width/2).toFixed(1)}ft × {dimensions.length}ft</div>
          <div>Valid X range: {skylightBounds.minXOffset.toFixed(1)}ft to {skylightBounds.maxXOffset.toFixed(1)}ft</div>
          <div>Valid Y range: {skylightBounds.minYOffset.toFixed(1)}ft to {skylightBounds.maxYOffset.toFixed(1)}ft</div>
          <div>Max skylight size: {skylightBounds.maxWidth.toFixed(1)}ft × {skylightBounds.maxLength.toFixed(1)}ft</div>
        </div>
      </div>

      {/* Global Validation Status */}
      {validationErrors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span className="text-sm font-medium text-red-800">Skylight Validation Errors</span>
          </div>
          <ul className="text-xs text-red-700 space-y-1">
            {validationErrors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      {validationWarnings.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
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

      {validationErrors.length === 0 && validationWarnings.length === 0 && skylights.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">All skylights are positioned within roof panel bounds</span>
          </div>
        </div>
      )}

      <div className="mb-4">
        <label htmlFor="roofPitch" className="form-label">Roof Pitch (rise:12)</label>
        <div className="flex items-center">
          <input
            type="range"
            id="roofPitch-range"
            min="1"
            max="12"
            step="0.5"
            value={dimensions.roofPitch}
            onChange={handlePitchChange}
            className="flex-1 mr-3"
          />
          <input
            type="number"
            id="roofPitch"
            min="1"
            max="12"
            step="0.5"
            value={dimensions.roofPitch}
            onChange={handlePitchChange}
            className="w-20 form-input"
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {dimensions.roofPitch}:12 pitch ({dimensions.roofPitch} inches of rise per 12 inches of run)
        </p>
      </div>

      <div className="mt-6">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Skylights</h3>
        
        <div className="space-y-4">
          {/* Roof Panel Selection */}
          <div>
            <label className="form-label">Roof Panel</label>
            <select
              className="form-input"
              value={newSkylight.panel}
              onChange={(e) => {
                const newPanel = e.target.value as RoofPanel;
                setNewSkylight({ 
                  ...newSkylight, 
                  panel: newPanel,
                  xOffset: 0 // Reset position when changing panels
                });
              }}
            >
              <option value="left">Left Panel</option>
              <option value="right">Right Panel</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Choose which side of the roof to place the skylight
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label">
                Width (ft)
                <span className="text-xs text-gray-500 ml-1">
                  (max: {maxAllowedDimensions.maxWidth.toFixed(1)}ft)
                </span>
              </label>
              <input
                type="number"
                className={`form-input ${newSkylight.width > maxAllowedDimensions.maxWidth ? 'border-red-300 bg-red-50' : ''}`}
                min="2"
                max={maxAllowedDimensions.maxWidth}
                step="0.5"
                value={newSkylight.width}
                onChange={(e) => setNewSkylight({ ...newSkylight, width: parseFloat(e.target.value) })}
              />
              {newSkylight.width > maxAllowedDimensions.maxWidth && (
                <p className="text-xs text-red-600 mt-1">
                  Width exceeds available space at this position
                </p>
              )}
            </div>
            <div>
              <label className="form-label">
                Length (ft)
                <span className="text-xs text-gray-500 ml-1">
                  (max: {maxAllowedDimensions.maxLength.toFixed(1)}ft)
                </span>
              </label>
              <input
                type="number"
                className={`form-input ${newSkylight.length > maxAllowedDimensions.maxLength ? 'border-red-300 bg-red-50' : ''}`}
                min="2"
                max={maxAllowedDimensions.maxLength}
                step="0.5"
                value={newSkylight.length}
                onChange={(e) => setNewSkylight({ ...newSkylight, length: parseFloat(e.target.value) })}
              />
              {newSkylight.length > maxAllowedDimensions.maxLength && (
                <p className="text-xs text-red-600 mt-1">
                  Length exceeds available space at this position
                </p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label">
                Panel Position (ft)
                <span className="text-xs text-gray-500 ml-1">
                  ({skylightBounds.minXOffset.toFixed(1)} to {skylightBounds.maxXOffset.toFixed(1)})
                </span>
              </label>
              <input
                type="number"
                className={`form-input ${
                  newSkylight.xOffset - newSkylight.width/2 < skylightBounds.minXOffset || 
                  newSkylight.xOffset + newSkylight.width/2 > skylightBounds.maxXOffset 
                    ? 'border-red-300 bg-red-50' : ''
                }`}
                min={skylightBounds.minXOffset + newSkylight.width/2}
                max={skylightBounds.maxXOffset - newSkylight.width/2}
                step="0.5"
                value={newSkylight.xOffset}
                onChange={(e) => setNewSkylight({ ...newSkylight, xOffset: parseFloat(e.target.value) })}
              />
              <p className="text-xs text-gray-500 mt-1">
                Position from panel center (0 = center of {newSkylight.panel} panel)
              </p>
            </div>
            <div>
              <label className="form-label">
                Ridge Distance (ft)
                <span className="text-xs text-gray-500 ml-1">
                  ({skylightBounds.minYOffset.toFixed(1)} to {skylightBounds.maxYOffset.toFixed(1)})
                </span>
              </label>
              <input
                type="number"
                className={`form-input ${
                  newSkylight.yOffset - newSkylight.length/2 < skylightBounds.minYOffset || 
                  newSkylight.yOffset + newSkylight.length/2 > skylightBounds.maxYOffset 
                    ? 'border-red-300 bg-red-50' : ''
                }`}
                min={skylightBounds.minYOffset + newSkylight.length/2}
                max={skylightBounds.maxYOffset - newSkylight.length/2}
                step="0.5"
                value={newSkylight.yOffset}
                onChange={(e) => setNewSkylight({ ...newSkylight, yOffset: parseFloat(e.target.value) })}
              />
              <p className="text-xs text-gray-500 mt-1">
                Distance from roof ridge (negative = toward eave)
              </p>
            </div>
          </div>

          {/* Auto-fix suggestion button */}
          {!isCurrentSkylightValid() && (
            <button
              className="w-full btn-secondary btn text-sm"
              onClick={handleSuggestValidPosition}
            >
              <AlertTriangle className="w-4 h-4 mr-1" />
              Auto-fix Position & Size to Fit Panel Bounds
            </button>
          )}
          
          <button
            className="w-full btn"
            onClick={handleAddSkylight}
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Skylight to {newSkylight.panel.charAt(0).toUpperCase() + newSkylight.panel.slice(1)} Panel
          </button>
        </div>

        {skylights.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Existing Skylights</h4>
            <div className="space-y-2">
              {skylights.map((skylight, index) => {
                const validation = skylightValidation?.skylightValidations?.[index];
                const isValid = validation?.valid ?? true;
                
                return (
                  <div 
                    key={index}
                    className={`flex items-center justify-between p-2 rounded border ${
                      isValid ? 'bg-gray-50 border-gray-200' : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-center">
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium">
                            {skylight.width}' × {skylight.length}'
                          </p>
                          <span className={`text-xs px-2 py-1 rounded ${
                            skylight.panel === 'left' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {skylight.panel}
                          </span>
                          {!isValid && (
                            <AlertTriangle className="w-3 h-3 text-red-500" />
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          Panel pos: {skylight.xOffset}', Ridge: {skylight.yOffset}'
                          {!isValid && (
                            <span className="text-red-600 ml-1">(Out of bounds)</span>
                          )}
                        </p>
                      </div>
                    </div>
                    <button
                      className="p-1 text-gray-400 hover:text-error rounded-full hover:bg-gray-100"
                      onClick={() => removeSkylight(index)}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default RoofPanel;