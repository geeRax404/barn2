import React from 'react';
import { motion } from 'framer-motion';
import { useBuildingStore } from '../../store/buildingStore';

// 🎯 COPIED COLOR PALETTE from https://shed-builder.bbcinnovation.com.au/
const colorOptions = [
  // Whites & Light Colors
  { name: 'Classic White', value: '#FFFFFF' },
  { name: 'Off White', value: '#F8F8F8' },
  { name: 'Cream', value: '#F5F5DC' },
  { name: 'Light Grey', value: '#E8E8E8' },
  
  // Greys
  { name: 'Silver Grey', value: '#C0C0C0' },
  { name: 'Medium Grey', value: '#9E9E9E' },
  { name: 'Charcoal', value: '#666666' },
  { name: 'Dark Grey', value: '#4A4A4A' },
  
  // Blues
  { name: 'Sky Blue', value: '#87CEEB' },
  { name: 'Ocean Blue', value: '#4682B4' },
  { name: 'Navy Blue', value: '#1E3A8A' },
  { name: 'Steel Blue', value: '#4682B4' },
  
  // Greens
  { name: 'Sage Green', value: '#9CAF88' },
  { name: 'Forest Green', value: '#228B22' },
  { name: 'Hunter Green', value: '#355E3B' },
  { name: 'Dark Green', value: '#006400' },
  
  // Reds & Browns
  { name: 'Barn Red', value: '#B22222' },
  { name: 'Burgundy', value: '#800020' },
  { name: 'Chocolate Brown', value: '#7B3F00' },
  { name: 'Coffee Brown', value: '#6F4E37' },
  
  // Tans & Beiges
  { name: 'Desert Sand', value: '#EDC9AF' },
  { name: 'Wheat', value: '#F5DEB3' },
  { name: 'Tan', value: '#D2B48C' },
  { name: 'Khaki', value: '#C3B091' },
];

// 🎯 ROOF COLOR PALETTE - Matching shed builder style
const roofColorOptions = [
  // Classic Roof Colors
  { name: 'Classic White', value: '#FFFFFF' },
  { name: 'Light Grey', value: '#D3D3D3' },
  { name: 'Medium Grey', value: '#A9A9A9' },
  { name: 'Charcoal Grey', value: '#36454F' },
  { name: 'Slate Grey', value: '#708090' },
  
  // Traditional Roof Colors
  { name: 'Terracotta', value: '#E2725B' },
  { name: 'Barn Red', value: '#B22222' },
  { name: 'Forest Green', value: '#228B22' },
  { name: 'Navy Blue', value: '#1E3A8A' },
  { name: 'Bronze', value: '#CD7F32' },
  
  // Modern Roof Colors
  { name: 'Graphite', value: '#383838' },
  { name: 'Black', value: '#2C2C2C' },
  { name: 'Copper', value: '#B87333' },
  { name: 'Zinc', value: '#7A7A7A' },
  { name: 'Pewter', value: '#96A8A1' },
];

// 🏗️ LYSAGHT WALL PROFILES - Based on https://lysaght.com/profiles
const wallProfileOptions = [
  {
    name: 'Multiclad',
    value: 'multiclad',
    description: 'Traditional ribbed profile with deep corrugations',
    ribWidth: 76, // 76mm rib spacing
    ribDepth: 'deep'
  },
  {
    name: 'Trimdek',
    value: 'trimdek',
    description: 'Contemporary trapezoidal profile with clean lines',
    ribWidth: 65, // 65mm rib spacing
    ribDepth: 'medium'
  },
  {
    name: 'CustomOrb',
    value: 'customorb',
    description: 'Curved profile with rounded ribs',
    ribWidth: 32, // 32mm rib spacing
    ribDepth: 'shallow'
  },
  {
    name: 'Horizontal CustomOrb',
    value: 'horizontal-customorb',
    description: 'Horizontal installation of CustomOrb profile',
    ribWidth: 32,
    ribDepth: 'shallow'
  }
];

const ColorsPanel: React.FC = () => {
  const { color, roofColor, wallProfile, setColor, setRoofColor, setWallProfile } = useBuildingStore((state) => ({
    color: state.currentProject.building.color,
    roofColor: state.currentProject.building.roofColor,
    wallProfile: state.currentProject.building.wallProfile || 'trimdek',
    setColor: state.setColor,
    setRoofColor: state.setRoofColor,
    setWallProfile: state.setWallProfile
  }));

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Wall Profile Selection */}
      <div className="mb-6">
        <label className="form-label text-base font-semibold">Wall Profile</label>
        <p className="text-xs text-gray-600 mb-3">Choose from Lysaght's premium profile collection</p>
        
        <div className="space-y-3">
          {wallProfileOptions.map((profile) => (
            <div key={profile.value} className="relative">
              <button
                className={`w-full p-3 text-left rounded-lg border-2 transition-all duration-200 hover:shadow-md ${
                  wallProfile === profile.value 
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' 
                    : 'border-gray-300 hover:border-gray-400 bg-white'
                }`}
                onClick={() => setWallProfile(profile.value)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{profile.name}</div>
                    <div className="text-xs text-gray-600 mt-1">{profile.description}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {profile.ribWidth}mm spacing • {profile.ribDepth} profile
                    </div>
                  </div>
                  {wallProfile === profile.value && (
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center ml-3">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </div>
                
                {/* Profile Preview Pattern */}
                <div className="mt-2 h-8 bg-gray-100 rounded overflow-hidden relative">
                  <div 
                    className="absolute inset-0 opacity-30"
                    style={{
                      background: profile.value === 'horizontal-customorb' 
                        ? `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)`
                        : profile.value === 'customorb'
                          ? `repeating-linear-gradient(90deg, transparent, transparent 3px, rgba(0,0,0,0.1) 3px, rgba(0,0,0,0.1) 6px)`
                          : profile.value === 'trimdek'
                            ? `repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(0,0,0,0.15) 8px, rgba(0,0,0,0.15) 10px, transparent 10px, transparent 18px)`
                            : `repeating-linear-gradient(90deg, transparent, transparent 6px, rgba(0,0,0,0.2) 6px, rgba(0,0,0,0.2) 8px, transparent 8px, transparent 14px)`
                    }}
                  />
                  <div className="absolute bottom-1 right-2 text-xs text-gray-500 font-medium">
                    {profile.name}
                  </div>
                </div>
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <label className="form-label text-base font-semibold">Wall Color</label>
        <p className="text-xs text-gray-600 mb-3">Choose from our premium color collection</p>
        <div className="grid grid-cols-4 gap-2">
          {colorOptions.map((option) => (
            <div key={option.value} className="relative group">
              <button
                className={`w-full h-12 rounded-lg overflow-hidden border-2 transition-all duration-200 hover:scale-105 hover:shadow-md ${
                  color === option.value 
                    ? 'border-blue-500 ring-2 ring-blue-200' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                style={{ backgroundColor: option.value }}
                onClick={() => setColor(option.value)}
                title={option.name}
              >
                {color === option.value && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-4 h-4 bg-white rounded-full shadow-md flex items-center justify-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    </div>
                  </div>
                )}
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white text-xs p-1 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-b-lg">
                {option.name}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mb-6">
        <label className="form-label text-base font-semibold">Roof Color</label>
        <p className="text-xs text-gray-600 mb-3">Select a complementary roof color</p>
        <div className="grid grid-cols-4 gap-2">
          {roofColorOptions.map((option) => (
            <div key={option.value} className="relative group">
              <button
                className={`w-full h-12 rounded-lg overflow-hidden border-2 transition-all duration-200 hover:scale-105 hover:shadow-md ${
                  roofColor === option.value 
                    ? 'border-blue-500 ring-2 ring-blue-200' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
                style={{ backgroundColor: option.value }}
                onClick={() => setRoofColor(option.value)}
                title={option.name}
              >
                {roofColor === option.value && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-4 h-4 bg-white rounded-full shadow-md flex items-center justify-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    </div>
                  </div>
                )}
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white text-xs p-1 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-b-lg">
                {option.name}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Color Combination Preview */}
      <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Preview</h3>
        <div className="space-y-3">
          {/* Profile Preview */}
          <div>
            <div className="text-xs text-gray-600 mb-1">Wall Profile</div>
            <div className="text-sm font-medium text-gray-700">
              {wallProfileOptions.find(p => p.value === wallProfile)?.name || 'Trimdek'}
            </div>
            <div className="text-xs text-gray-500">
              {wallProfileOptions.find(p => p.value === wallProfile)?.description}
            </div>
          </div>
          
          {/* Color Preview */}
          <div className="flex items-center space-x-3">
            <div className="flex-1">
              <div className="text-xs text-gray-600 mb-1">Wall Color</div>
              <div 
                className="h-8 rounded border border-gray-300 shadow-sm"
                style={{ backgroundColor: color }}
              ></div>
              <div className="text-xs text-gray-700 mt-1 font-medium">
                {colorOptions.find(c => c.value === color)?.name || 'Custom'}
              </div>
            </div>
            <div className="flex-1">
              <div className="text-xs text-gray-600 mb-1">Roof Color</div>
              <div 
                className="h-8 rounded border border-gray-300 shadow-sm"
                style={{ backgroundColor: roofColor }}
              ></div>
              <div className="text-xs text-gray-700 mt-1 font-medium">
                {roofColorOptions.find(c => c.value === roofColor)?.name || 'Custom'}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Material Information */}
      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="text-sm font-semibold text-blue-800 mb-2">Material Information</h3>
        
        <div className="mb-3">
          <label htmlFor="exteriorMaterial" className="text-xs text-blue-700 block mb-1 font-medium">Exterior Cladding</label>
          <select
            id="exteriorMaterial"
            className="form-input text-sm w-full"
            defaultValue="colorbond"
          >
            <option value="colorbond">COLORBOND® Steel</option>
            <option value="zincalume">ZINCALUME® Steel</option>
            <option value="vinyl">Vinyl Cladding</option>
            <option value="timber">Timber Weatherboard</option>
            <option value="fiber">Fiber Cement</option>
          </select>
        </div>
        
        <div className="mb-3">
          <label htmlFor="roofMaterial" className="text-xs text-blue-700 block mb-1 font-medium">Roofing Material</label>
          <select
            id="roofMaterial"
            className="form-input text-sm w-full"
            defaultValue="colorbond"
          >
            <option value="colorbond">COLORBOND® Steel Roofing</option>
            <option value="zincalume">ZINCALUME® Steel Roofing</option>
            <option value="tile">Concrete Roof Tiles</option>
            <option value="shingle">Asphalt Shingles</option>
          </select>
        </div>
        
        <div className="text-xs text-blue-700">
          <p className="mb-1">• 25-year warranty on COLORBOND® steel</p>
          <p className="mb-1">• UV resistant and fade proof</p>
          <p>• Environmentally sustainable materials</p>
        </div>
      </div>
    </motion.div>
  );
};

export default ColorsPanel;