import React, { useMemo } from 'react';
import * as THREE from 'three';
import type { Skylight } from '../../types';

interface RoofProps {
  width: number;
  length: number;
  height: number;
  pitch: number;
  color: string;
  skylights?: Skylight[];
}

const Roof: React.FC<RoofProps> = ({ width, length, height, pitch, color, skylights = [] }) => {
  const roofHeight = useMemo(() => {
    return (width / 2) * (pitch / 12);
  }, [width, pitch]);
  
  const pitchAngle = Math.atan2(roofHeight, width / 2);
  const panelLength = Math.sqrt(Math.pow(width/2, 2) + Math.pow(roofHeight, 2));

  // Create roof materials and geometries with cutouts for skylights
  const { leftRoofGeometry, rightRoofGeometry, leftRoofMaterial, rightRoofMaterial } = useMemo(() => {
    const createRoofTexture = (panelSide: 'left' | 'right') => {
      const textureWidth = 512;
      const textureHeight = 512;
      const canvas = document.createElement('canvas');
      canvas.width = textureWidth;
      canvas.height = textureHeight;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, textureWidth, textureHeight);
        
        // Create ribbed pattern with special handling for white
        const ribWidth = textureWidth / 24;
        const gradient = ctx.createLinearGradient(0, 0, ribWidth, 0);
        
        // Special handling for pure white to maintain brightness
        const isWhite = color === '#FFFFFF';
        const shadowOpacity = isWhite ? 0.08 : 0.25;
        const highlightOpacity = isWhite ? 0.05 : 0.15;
        
        gradient.addColorStop(0, `rgba(255,255,255,${highlightOpacity})`);
        gradient.addColorStop(0.2, `rgba(255,255,255,${highlightOpacity * 0.5})`);
        gradient.addColorStop(0.4, `rgba(0,0,0,${shadowOpacity})`);
        gradient.addColorStop(0.6, `rgba(0,0,0,${shadowOpacity})`);
        gradient.addColorStop(0.8, `rgba(255,255,255,${highlightOpacity * 0.5})`);
        gradient.addColorStop(1, `rgba(255,255,255,${highlightOpacity})`);
        
        ctx.fillStyle = gradient;
        
        for (let x = 0; x < textureWidth; x += ribWidth) {
          ctx.fillRect(x, 0, ribWidth, textureHeight);
        }
      }
      
      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(4, length/2);
      
      return texture;
    };

    // Create roof geometries with skylight cutouts
    const createRoofGeometryWithCutouts = (isLeftPanel: boolean) => {
      // Filter skylights for this specific panel only
      const panelSkylights = skylights.filter(s => 
        s.panel === (isLeftPanel ? 'left' : 'right')
      );

      console.log(`${isLeftPanel ? 'Left' : 'Right'} panel has ${panelSkylights.length} skylights`);

      if (panelSkylights.length === 0) {
        // No skylights, return simple box geometry
        return new THREE.BoxGeometry(panelLength, 0.2, length);
      }

      // Create a shape for the roof panel in the XY plane (will be rotated later)
      const roofShape = new THREE.Shape();
      roofShape.moveTo(-panelLength/2, -length/2);
      roofShape.lineTo(panelLength/2, -length/2);
      roofShape.lineTo(panelLength/2, length/2);
      roofShape.lineTo(-panelLength/2, length/2);
      roofShape.closePath();

      // Create holes for each skylight on this panel
      panelSkylights.forEach(skylight => {
        const skylightHole = new THREE.Path();
        
        // Convert skylight position to roof panel coordinates
        // Panel coordinates: xOffset is relative to panel center, yOffset is relative to ridge
        const localX = skylight.xOffset * (panelLength / (width/2));
        const localY = skylight.yOffset;
        
        const holeWidth = skylight.width * (panelLength / (width/2));
        const holeLength = skylight.length;
        
        // Ensure skylight hole is within panel bounds
        const maxLocalX = panelLength/2 - holeWidth/2;
        const maxLocalY = length/2 - holeLength/2;
        const clampedLocalX = Math.max(-maxLocalX, Math.min(maxLocalX, localX));
        const clampedLocalY = Math.max(-maxLocalY, Math.min(maxLocalY, localY));
        
        console.log(`Creating skylight hole on ${isLeftPanel ? 'left' : 'right'} panel at (${clampedLocalX.toFixed(2)}, ${clampedLocalY.toFixed(2)}) size ${holeWidth.toFixed(2)}x${holeLength.toFixed(2)}`);
        
        // Create rectangular hole
        skylightHole.moveTo(clampedLocalX - holeWidth/2, clampedLocalY - holeLength/2);
        skylightHole.lineTo(clampedLocalX + holeWidth/2, clampedLocalY - holeLength/2);
        skylightHole.lineTo(clampedLocalX + holeWidth/2, clampedLocalY + holeLength/2);
        skylightHole.lineTo(clampedLocalX - holeWidth/2, clampedLocalY + holeLength/2);
        skylightHole.closePath();
        
        roofShape.holes.push(skylightHole);
      });

      const extrudeSettings = {
        steps: 1,
        depth: 0.2,
        bevelEnabled: false
      };

      const geometry = new THREE.ExtrudeGeometry(roofShape, extrudeSettings);
      
      // Rotate the geometry to align with the roof pitch
      // The extruded geometry is created in XY plane, we need to rotate it to XZ plane
      geometry.rotateX(-Math.PI / 2); // Rotate to lie flat in XZ plane
      
      return geometry;
    };

    // Create separate textures for each panel
    const leftTexture = createRoofTexture('left');
    const rightTexture = createRoofTexture('right');
    
    // Special material properties for white vs other colors
    const isWhite = color === '#FFFFFF';
    const materialProps = isWhite ? {
      metalness: 0.3,
      roughness: 0.6,
      envMapIntensity: 0.8,
    } : {
      metalness: 0.7,
      roughness: 0.3,
      envMapIntensity: 0.5,
    };
    
    // Create geometries with cutouts
    const leftGeometry = createRoofGeometryWithCutouts(true);
    const rightGeometry = createRoofGeometryWithCutouts(false);
    
    // Create separate materials with optimized properties for white
    const leftMaterial = new THREE.MeshStandardMaterial({
      map: leftTexture,
      ...materialProps,
      side: THREE.DoubleSide,
    });

    const rightMaterial = new THREE.MeshStandardMaterial({
      map: rightTexture,
      ...materialProps,
      side: THREE.DoubleSide,
    });
    
    return { 
      leftRoofGeometry: leftGeometry,
      rightRoofGeometry: rightGeometry,
      leftRoofMaterial: leftMaterial, 
      rightRoofMaterial: rightMaterial 
    };
  }, [color, length, width, panelLength, skylights]);

  // Create roof ridge lines that split around skylights
  const roofRidgeLines = useMemo(() => {
    const ridgeSegments: { start: [number, number, number]; end: [number, number, number] }[] = [];
    
    // Main ridge line along the peak
    const ridgeY = height + roofHeight;
    let currentZ = -length / 2;
    const ridgeEnd = length / 2;
    
    // Get all skylights that might intersect the ridge
    const ridgeIntersectingSkylights = skylights
      .filter(skylight => {
        const skylightFront = skylight.yOffset - skylight.length / 2;
        const skylightBack = skylight.yOffset + skylight.length / 2;
        return skylightBack > -length/2 && skylightFront < length/2;
      })
      .sort((a, b) => (a.yOffset - a.length/2) - (b.yOffset - b.length/2));
    
    console.log(`Ridge intersecting skylights: ${ridgeIntersectingSkylights.length}`);
    
    // Create ridge segments between skylights
    ridgeIntersectingSkylights.forEach(skylight => {
      const skylightFront = skylight.yOffset - skylight.length / 2 - 0.1; // Small gap
      const skylightBack = skylight.yOffset + skylight.length / 2 + 0.1; // Small gap
      
      // Add segment before skylight
      if (currentZ < skylightFront) {
        ridgeSegments.push({
          start: [0, ridgeY, currentZ],
          end: [0, ridgeY, skylightFront]
        });
        console.log(`Ridge segment: ${currentZ.toFixed(2)} to ${skylightFront.toFixed(2)}`);
      }
      
      // Skip over the skylight
      currentZ = Math.max(currentZ, skylightBack);
    });
    
    // Add final segment after all skylights
    if (currentZ < ridgeEnd) {
      ridgeSegments.push({
        start: [0, ridgeY, currentZ],
        end: [0, ridgeY, ridgeEnd]
      });
      console.log(`Final ridge segment: ${currentZ.toFixed(2)} to ${ridgeEnd.toFixed(2)}`);
    }
    
    return ridgeSegments;
  }, [skylights, length, height, roofHeight]);

  // Create panel edge lines that split around skylights
  const panelEdgeLines = useMemo(() => {
    const createPanelEdgeSegments = (isLeftPanel: boolean) => {
      const panelSkylights = skylights.filter(s => s.panel === (isLeftPanel ? 'left' : 'right'));
      const segments: { start: [number, number, number]; end: [number, number, number] }[] = [];
      
      // Panel edge coordinates
      const panelX = isLeftPanel ? -width / 4 : width / 4;
      const panelEdgeY = height + roofHeight / 2;
      
      let currentZ = -length / 2;
      const edgeEnd = length / 2;
      
      // Sort skylights by Y position
      const sortedSkylights = panelSkylights
        .filter(skylight => {
          const skylightFront = skylight.yOffset - skylight.length / 2;
          const skylightBack = skylight.yOffset + skylight.length / 2;
          return skylightBack > -length/2 && skylightFront < length/2;
        })
        .sort((a, b) => (a.yOffset - a.length/2) - (b.yOffset - b.length/2));
      
      // Create edge segments between skylights
      sortedSkylights.forEach(skylight => {
        const skylightFront = skylight.yOffset - skylight.length / 2 - 0.05;
        const skylightBack = skylight.yOffset + skylight.length / 2 + 0.05;
        
        // Add segment before skylight
        if (currentZ < skylightFront) {
          segments.push({
            start: [panelX, panelEdgeY, currentZ],
            end: [panelX, panelEdgeY, skylightFront]
          });
        }
        
        // Skip over the skylight
        currentZ = Math.max(currentZ, skylightBack);
      });
      
      // Add final segment after all skylights
      if (currentZ < edgeEnd) {
        segments.push({
          start: [panelX, panelEdgeY, currentZ],
          end: [panelX, panelEdgeY, edgeEnd]
        });
      }
      
      return segments;
    };
    
    return {
      left: createPanelEdgeSegments(true),
      right: createPanelEdgeSegments(false)
    };
  }, [skylights, width, length, height, roofHeight]);

  // Create cross-ridge lines (perpendicular to main ridge)
  const crossRidgeLines = useMemo(() => {
    const segments: { start: [number, number, number]; end: [number, number, number] }[] = [];
    const ridgeY = height + roofHeight;
    const spacing = 8; // Cross-ridge every 8 feet
    
    for (let z = -length/2 + spacing; z < length/2; z += spacing) {
      // Check if this cross-ridge intersects any skylights
      const intersectingSkylights = skylights.filter(skylight => {
        const skylightFront = skylight.yOffset - skylight.length / 2;
        const skylightBack = skylight.yOffset + skylight.length / 2;
        return z >= skylightFront && z <= skylightBack;
      });
      
      if (intersectingSkylights.length === 0) {
        // No skylights intersect, create full cross-ridge
        segments.push({
          start: [-width/2, height, z],
          end: [width/2, height, z]
        });
      } else {
        // Split cross-ridge around skylights
        let currentX = -width/2;
        
        intersectingSkylights
          .sort((a, b) => a.xOffset - b.xOffset)
          .forEach(skylight => {
            // Convert skylight panel position to roof coordinates
            const skylightX = skylight.panel === 'left' ? 
              -width/4 + skylight.xOffset * 0.5 : 
              width/4 + skylight.xOffset * 0.5;
            
            const skylightLeft = skylightX - skylight.width / 2 - 0.1;
            const skylightRight = skylightX + skylight.width / 2 + 0.1;
            
            // Add segment before skylight
            if (currentX < skylightLeft) {
              segments.push({
                start: [currentX, height, z],
                end: [skylightLeft, height, z]
              });
            }
            
            // Skip over skylight
            currentX = Math.max(currentX, skylightRight);
          });
        
        // Add final segment
        if (currentX < width/2) {
          segments.push({
            start: [currentX, height, z],
            end: [width/2, height, z]
          });
        }
      }
    }
    
    return segments;
  }, [skylights, width, length, height, roofHeight]);

  const skylightMaterial = new THREE.MeshPhysicalMaterial({
    color: '#FFFFFF',
    metalness: 0.1,
    roughness: 0.05,
    transmission: 0.9,
    transparent: true,
    opacity: 0.6,
    side: THREE.DoubleSide,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
  });

  const createSkylight = (skylight: Skylight, isLeftPanel: boolean) => {
    // Only create skylight if it belongs to this panel
    if (skylight.panel !== (isLeftPanel ? 'left' : 'right')) {
      return null;
    }

    const skylightWidth = skylight.width;
    const skylightLength = skylight.length;
    
    // Calculate position in roof panel coordinates
    // Panel coordinates: xOffset is relative to panel center, yOffset is relative to ridge
    const localX = skylight.xOffset * (panelLength / (width/2));
    const localY = skylight.yOffset;
    
    // Position the skylight to sit flush in the cutout
    const skylightX = localX;
    const skylightY = 0.05; // Slightly above the roof surface to prevent z-fighting
    const skylightZ = localY;
    
    return (
      <mesh
        key={`${isLeftPanel ? 'left' : 'right'}-${skylight.xOffset}-${skylight.yOffset}`}
        position={[skylightX, skylightY, skylightZ]}
        rotation={[0, 0, 0]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[skylightWidth * (panelLength / (width/2)), 0.1, skylightLength]} />
        <primitive object={skylightMaterial} attach="material" />
      </mesh>
    );
  };

  // Create ridge line components
  const createRidgeLine = (start: [number, number, number], end: [number, number, number], key: string) => {
    const points = [new THREE.Vector3(...start), new THREE.Vector3(...end)];
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    
    return (
      <line key={key}>
        <primitive object={geometry} attach="geometry" />
        <lineBasicMaterial attach="material" color="#2D3748" linewidth={3} />
      </line>
    );
  };
  
  return (
    <group position={[0, height, 0]}>
      {/* Left roof panel with cutouts */}
      <group 
        position={[-width / 4, roofHeight / 2, 0]}
        rotation={[0, 0, pitchAngle]}
      >
        <mesh castShadow receiveShadow>
          <primitive object={leftRoofGeometry} />
          <primitive object={leftRoofMaterial} attach="material" />
        </mesh>
        
        {/* Skylights positioned in the cutouts for left panel */}
        {skylights
          .filter(s => s.panel === 'left')
          .map(s => createSkylight(s, true))
          .filter(Boolean) // Remove null skylights
        }
      </group>
      
      {/* Right roof panel with cutouts */}
      <group
        position={[width / 4, roofHeight / 2, 0]}
        rotation={[0, 0, -pitchAngle]}
      >
        <mesh castShadow receiveShadow>
          <primitive object={rightRoofGeometry} />
          <primitive object={rightRoofMaterial} attach="material" />
        </mesh>
        
        {/* Skylights positioned in the cutouts for right panel */}
        {skylights
          .filter(s => s.panel === 'right')
          .map(s => createSkylight(s, false))
          .filter(Boolean) // Remove null skylights
        }
      </group>
      
      {/* Ridge cap with special white handling */}
      <mesh 
        position={[0, roofHeight, 0]} 
        castShadow 
        receiveShadow
      >
        <boxGeometry args={[0.4, 0.3, length]} />
        <meshStandardMaterial 
          color={color} 
          metalness={color === '#FFFFFF' ? 0.2 : 0.8} 
          roughness={color === '#FFFFFF' ? 0.7 : 0.2}
          envMapIntensity={color === '#FFFFFF' ? 0.6 : 1.0}
        />
      </mesh>

      {/* Roof Ridge Lines - Split around skylights */}
      {roofRidgeLines.map((segment, index) => 
        createRidgeLine(segment.start, segment.end, `ridge-${index}`)
      )}

      {/* Panel Edge Lines - Split around skylights */}
      {panelEdgeLines.left.map((segment, index) => 
        createRidgeLine(segment.start, segment.end, `left-edge-${index}`)
      )}
      {panelEdgeLines.right.map((segment, index) => 
        createRidgeLine(segment.start, segment.end, `right-edge-${index}`)
      )}

      {/* Cross-Ridge Lines - Split around skylights */}
      {crossRidgeLines.map((segment, index) => 
        createRidgeLine(segment.start, segment.end, `cross-ridge-${index}`)
      )}

      {/* Eave Lines (bottom edges of roof panels) */}
      <line>
        <bufferGeometry attach="geometry">
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([-width/2, 0, -length/2, -width/2, 0, length/2])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial attach="material" color="#2D3748" linewidth={2} />
      </line>
      
      <line>
        <bufferGeometry attach="geometry">
          <bufferAttribute
            attach="attributes-position"
            count={2}
            array={new Float32Array([width/2, 0, -length/2, width/2, 0, length/2])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial attach="material" color="#2D3748" linewidth={2} />
      </line>

      {/* Gable End Lines */}
      <line>
        <bufferGeometry attach="geometry">
          <bufferAttribute
            attach="attributes-position"
            count={3}
            array={new Float32Array([-width/2, 0, -length/2, 0, roofHeight, -length/2, width/2, 0, -length/2])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial attach="material" color="#2D3748" linewidth={2} />
      </line>
      
      <line>
        <bufferGeometry attach="geometry">
          <bufferAttribute
            attach="attributes-position"
            count={3}
            array={new Float32Array([-width/2, 0, length/2, 0, roofHeight, length/2, width/2, 0, length/2])}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial attach="material" color="#2D3748" linewidth={2} />
      </line>
    </group>
  );
};

export default Roof;