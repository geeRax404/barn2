import React, { useRef, useEffect, useState } from 'react';
import { useBuildingStore } from '../store/buildingStore';
import RoofLines from './RoofLines';
import type { WallFeature } from '../types';

const FloorPlan: React.FC = () => {
  const { dimensions, features, color, skylights } = useBuildingStore((state) => ({
    dimensions: state.currentProject.building.dimensions,
    features: state.currentProject.building.features,
    color: state.currentProject.building.color,
    skylights: state.currentProject.building.skylights
  }));
  
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(20); // pixels per foot
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showRoofLines, setShowRoofLines] = useState(true);
  
  const width = dimensions.width * scale;
  const length = dimensions.length * scale;
  const margin = 120; // Increased margin for better label spacing
  
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = -e.deltaY;
      setScale(prevScale => {
        const newScale = prevScale * (1 + delta * 0.001);
        return Math.min(Math.max(newScale, 5), 50);
      });
    };
    
    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
    }
    
    return () => {
      if (container) {
        container.removeEventListener('wheel', handleWheel);
      }
    };
  }, []);
  
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  const renderFeature = (feature: WallFeature) => {
    const featureWidth = feature.width * scale;
    const featureDepth = 2 * scale;
    let x = 0;
    let y = 0;
    
    switch (feature.position.wallPosition) {
      case 'front':
        x = (feature.position.alignment === 'left')
          ? feature.position.xOffset * scale
          : (feature.position.alignment === 'right')
            ? width - (feature.position.xOffset * scale) - featureWidth
            : (width / 2) - (featureWidth / 2) + (feature.position.xOffset * scale);
        y = length - featureDepth;
        break;
      case 'back':
        x = (feature.position.alignment === 'left')
          ? feature.position.xOffset * scale
          : (feature.position.alignment === 'right')
            ? width - (feature.position.xOffset * scale) - featureWidth
            : (width / 2) - (featureWidth / 2) + (feature.position.xOffset * scale);
        y = 0;
        break;
      case 'left':
        y = (feature.position.alignment === 'left')
          ? feature.position.xOffset * scale
          : (feature.position.alignment === 'right')
            ? length - (feature.position.xOffset * scale) - featureWidth
            : (length / 2) - (featureWidth / 2) + (feature.position.xOffset * scale);
        x = 0;
        break;
      case 'right':
        y = (feature.position.alignment === 'left')
          ? feature.position.xOffset * scale
          : (feature.position.alignment === 'right')
            ? length - (feature.position.xOffset * scale) - featureWidth
            : (length / 2) - (featureWidth / 2) + (feature.position.xOffset * scale);
        x = width - featureDepth;
        break;
    }
    
    const isHorizontal = feature.position.wallPosition === 'front' || feature.position.wallPosition === 'back';
    const featureStyle = {
      position: 'absolute' as const,
      left: `${x}px`,
      top: `${y}px`,
      width: isHorizontal ? `${featureWidth}px` : `${featureDepth}px`,
      height: isHorizontal ? `${featureDepth}px` : `${featureWidth}px`,
      backgroundColor: '#2563eb',
      border: '1px solid #1d4ed8'
    };
    
    return (
      <div
        key={feature.id}
        style={featureStyle}
        className="shadow-sm"
        title={`${feature.type} (${feature.width}'x${feature.height}')`}
      />
    );
  };

  const renderSkylight = (skylight: any, index: number) => {
    // Convert skylight coordinates to floor plan coordinates
    const skylightWidth = skylight.width * scale;
    const skylightLength = skylight.length * scale;
    
    // Calculate position based on panel and offsets
    let centerX: number;
    if (skylight.panel === 'left') {
      // Left panel center is at 1/4 of building width
      centerX = (width / 4) + (skylight.xOffset * scale);
    } else {
      // Right panel center is at 3/4 of building width
      centerX = (3 * width / 4) + (skylight.xOffset * scale);
    }
    
    const centerY = (length / 2) + (skylight.yOffset * scale);
    
    const skylightStyle = {
      position: 'absolute' as const,
      left: `${centerX - skylightWidth/2}px`,
      top: `${centerY - skylightLength/2}px`,
      width: `${skylightWidth}px`,
      height: `${skylightLength}px`,
      backgroundColor: 'rgba(135, 206, 235, 0.3)', // Light blue with transparency
      border: '2px solid #87CEEB',
      borderRadius: '4px'
    };
    
    return (
      <div
        key={`skylight-${index}`}
        style={skylightStyle}
        className="shadow-sm"
        title={`Skylight ${index + 1} (${skylight.width}'x${skylight.length}') - ${skylight.panel} panel`}
      />
    );
  };

  const renderDimensionLine = (start: number, length: number, isHorizontal: boolean) => {
    const style = {
      position: 'absolute' as const,
      backgroundColor: '#1f2937',
      [isHorizontal ? 'width' : 'height']: `${length}px`,
      [isHorizontal ? 'height' : 'width']: '2px',
      left: isHorizontal ? `${start}px` : undefined,
      top: !isHorizontal ? `${start}px` : undefined,
    };

    const markerStyle = {
      position: 'absolute' as const,
      width: '8px',
      height: '8px',
      backgroundColor: '#1f2937',
      transform: 'rotate(45deg)',
    };

    return (
      <div style={style}>
        <div style={{ ...markerStyle, left: '-3px', top: '-3px' }} />
        <div style={{ ...markerStyle, right: '-3px', bottom: '-3px' }} />
      </div>
    );
  };

  const renderWallLabel = (text: string, position: 'top' | 'bottom' | 'left' | 'right') => {
    const baseStyle = {
      position: 'absolute' as const,
      backgroundColor: '#f3f4f6',
      padding: '4px 12px',
      borderRadius: '4px',
      fontWeight: 500,
      color: '#1f2937',
      border: '1px solid #e5e7eb',
      fontSize: '0.875rem',
      letterSpacing: '0.05em',
      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
    };

    const positionStyles = {
      top: {
        left: '60px',
        width: `${width}px`,
        textAlign: 'center' as const,
        top: '10px',
      },
      bottom: {
        left: '60px',
        width: `${width}px`,
        textAlign: 'center' as const,
        bottom: '10px',
      },
      left: {
        left: '10px',
        top: '60px',
        height: `${length}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        writingMode: 'vertical-rl' as const,
        transform: 'rotate(180deg)',
      },
      right: {
        right: '10px',
        top: '60px',
        height: `${length}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        writingMode: 'vertical-rl' as const,
      },
    };

    return (
      <div style={{ ...baseStyle, ...positionStyles[position] }}>
        {text}
      </div>
    );
  };
  
  return (
    <div 
      ref={containerRef}
      className="w-full h-full overflow-hidden bg-gray-100 cursor-move relative"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Roof Lines Toggle */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={() => setShowRoofLines(!showRoofLines)}
          className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
            showRoofLines 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {showRoofLines ? 'Hide' : 'Show'} Roof Lines
        </button>
      </div>

      {/* Skylight Count Display */}
      {skylights.length > 0 && (
        <div className="absolute top-4 left-4 z-10 bg-white px-3 py-2 rounded-md shadow-sm border border-gray-200">
          <div className="text-sm font-medium text-gray-700">
            Skylights: {skylights.length}
          </div>
          <div className="text-xs text-gray-500">
            Left: {skylights.filter(s => s.panel === 'left').length} | 
            Right: {skylights.filter(s => s.panel === 'right').length}
          </div>
        </div>
      )}
      
      <div 
        className="relative"
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
          width: `${width + margin}px`,
          height: `${length + margin}px`,
          margin: '2rem auto'
        }}
      >
        {/* SVG for roof lines */}
        {showRoofLines && (
          <svg
            className="absolute inset-0 pointer-events-none"
            style={{
              left: '60px',
              top: '60px',
              width: `${width}px`,
              height: `${length}px`,
              zIndex: 1
            }}
          >
            <RoofLines
              scale={scale}
              width={width}
              length={length}
              position={{ x: 0, y: 0 }}
            />
          </svg>
        )}

        {/* Main building outline */}
        <div 
          className="absolute"
          style={{ 
            left: '60px',
            top: '60px',
            width: `${width}px`,
            height: `${length}px`,
            border: '8px solid #1f2937',
            backgroundColor: color,
            zIndex: 2
          }}
        >
          {/* Wall features */}
          {features.map(renderFeature)}
          
          {/* Skylights */}
          {skylights.map(renderSkylight)}
        </div>

        {/* Dimension lines */}
        <div className="absolute" style={{ left: '60px', top: '20px' }}>
          {renderDimensionLine(0, width, true)}
          <div 
            className="absolute bg-white px-2 py-1 rounded-md shadow-sm border border-gray-200"
            style={{ 
              width: 'auto',
              left: '50%',
              transform: 'translateX(-50%)',
              top: '-30px',
              whiteSpace: 'nowrap',
              fontSize: '0.875rem',
              fontWeight: 500,
              color: '#1f2937'
            }}
          >
            {dimensions.width} ft
          </div>
        </div>

        <div className="absolute" style={{ left: '20px', top: '60px' }}>
          {renderDimensionLine(0, length, false)}
          <div 
            className="absolute bg-white px-2 py-1 rounded-md shadow-sm border border-gray-200"
            style={{ 
              transform: 'rotate(-90deg) translateX(-50%)',
              transformOrigin: '0 0',
              left: '-30px',
              top: '50%',
              whiteSpace: 'nowrap',
              fontSize: '0.875rem',
              fontWeight: 500,
              color: '#1f2937'
            }}
          >
            {dimensions.length} ft
          </div>
        </div>

        {/* Wall labels */}
        {renderWallLabel('BACK', 'top')}
        {renderWallLabel('FRONT', 'bottom')}
        {renderWallLabel('LEFT', 'left')}
        {renderWallLabel('RIGHT', 'right')}

        {/* Roof panel indicators */}
        {showRoofLines && (
          <>
            <div 
              className="absolute bg-blue-50 border border-blue-200 rounded px-2 py-1 text-xs font-medium text-blue-800"
              style={{
                left: `${60 + width/4}px`,
                top: `${60 + length/2}px`,
                transform: 'translate(-50%, -50%)',
                zIndex: 3
              }}
            >
              LEFT PANEL
            </div>
            <div 
              className="absolute bg-green-50 border border-green-200 rounded px-2 py-1 text-xs font-medium text-green-800"
              style={{
                left: `${60 + 3*width/4}px`,
                top: `${60 + length/2}px`,
                transform: 'translate(-50%, -50%)',
                zIndex: 3
              }}
            >
              RIGHT PANEL
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FloorPlan;