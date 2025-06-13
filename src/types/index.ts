// Building dimensions and properties
export interface BuildingDimensions {
  width: number;
  length: number;
  height: number;
  roofPitch: number; // in degrees
}

// Room design constraints
export interface RoomConstraints {
  minimumWallHeight: number; // feet
  minimumWallLength: number; // feet
  minimumWallWidth: number; // feet
  standardDoorHeight: number; // feet
  standardWindowHeight: number; // feet
  structuralClearance: number; // feet above features
}

// Wall feature types
export type FeatureType = 'door' | 'window' | 'rollupDoor' | 'walkDoor';

// Wall positions
export type WallPosition = 'front' | 'back' | 'left' | 'right';

// Wall profile types - Lysaght profiles
export type WallProfile = 'multiclad' | 'trimdek' | 'customorb' | 'horizontal-customorb';

// Feature positioning
export interface FeaturePosition {
  wallPosition: WallPosition;
  xOffset: number;  // Distance from left edge of wall
  yOffset: number;  // Distance from bottom of wall
  alignment: 'left' | 'center' | 'right';
}

// Wall segment lock status
export interface WallSegmentLock {
  segmentId: string;
  wallPosition: WallPosition;
  startPosition: number; // feet from wall start
  endPosition: number; // feet from wall start
  lockedBy: string[]; // Array of feature IDs that lock this segment
  lockType: 'dimensional' | 'positional' | 'full';
  lockReason: string;
  canModify: boolean;
}

// Wall bounds protection
export interface WallBoundsProtection {
  wallPosition: WallPosition;
  protectedSegments: WallSegmentLock[];
  totalLockedLength: number;
  availableLength: number;
  modificationRestrictions: string[];
  lastModified: Date;
}

// Feature bounds lock information
export interface FeatureBoundsLock {
  featureId: string;
  featureType: FeatureType;
  wallPosition: WallPosition;
  lockedDimensions: {
    width: boolean;
    height: boolean;
    position: boolean;
  };
  affectedWallSegments: string[];
  lockTimestamp: Date;
  lockReason: string;
  canOverride: boolean;
}

// Wall feature (door, window, etc.)
export interface WallFeature {
  id: string;
  type: FeatureType;
  width: number;
  height: number;
  position: FeaturePosition;
  color?: string;
  boundsLock?: FeatureBoundsLock;
  isLocked?: boolean;
}

// Roof panel types
export type RoofPanel = 'left' | 'right';

// Skylight feature with panel selection
export interface Skylight {
  width: number;
  length: number;
  xOffset: number; // Distance from panel center (not roof center)
  yOffset: number; // Distance from ridge
  panel: RoofPanel; // Which roof panel the skylight is on
}

// View modes
export type ViewMode = '3d' | 'plan' | 'floor';

// Building Code Requirements
export interface ElectricalRequirement {
  minimumOutletHeight: number; // feet from floor
  minimumSwitchHeight: number; // feet from floor
  minimumCeilingClearance: number; // feet from ceiling
  minimumServicePanelClearance: number; // feet around electrical panel
}

export interface PlumbingRequirement {
  minimumFixtureHeight: number; // feet from floor
  minimumCeilingClearance: number; // feet from ceiling
  minimumAccessClearance: number; // feet for maintenance access
  minimumVentClearance: number; // feet for plumbing vents
}

export interface BuildingCodeRequirements {
  minimumCeilingHeight: number; // feet - absolute minimum ceiling height
  minimumDoorClearance: number; // feet above door height
  minimumWindowClearance: number; // feet above window height
  structuralLoadBearing: number; // feet for load-bearing requirements
  fireCodeClearance: number; // feet for fire safety clearances
  electrical: ElectricalRequirement;
  plumbing: PlumbingRequirement;
  ventilationClearance: number; // feet for HVAC systems
  insulationSpace: number; // feet for insulation thickness
}

// Building state
export interface Building {
  dimensions: BuildingDimensions;
  features: WallFeature[];
  skylights: Skylight[];
  color: string;
  roofColor: string;
  wallProfile: WallProfile;
  wallBoundsProtection?: Map<WallPosition, WallBoundsProtection>;
}

// Project info
export interface Project {
  id: string;
  name: string;
  created: Date;
  lastModified: Date;
  building: Building;
}

// Collision detection utilities
export interface CollisionBounds {
  left: number;
  right: number;
  bottom: number;
  top: number;
}

export interface BeamCollisionData {
  x: number;
  width: number;
  height: number;
  bounds: CollisionBounds;
}

// Beam segment for split beams
export interface BeamSegment {
  x: number;
  bottomY: number;
  topY: number;
  width: number;
}

// Store state
export interface BuildingStore {
  currentProject: Project;
  savedProjects: Project[];
  currentView: ViewMode;
  
  // Actions
  setBuilding: (building: Building) => void;
  updateDimensions: (dimensions: Partial<BuildingDimensions>) => void;
  addFeature: (feature: Omit<WallFeature, 'id'>) => void;
  removeFeature: (id: string) => void;
  updateFeature: (id: string, updates: Partial<Omit<WallFeature, 'id'>>) => void;
  addSkylight: (skylight: Skylight) => void;
  removeSkylight: (index: number) => void;
  updateSkylight: (index: number, updates: Partial<Skylight>) => void;
  setColor: (color: string) => void;
  setRoofColor: (color: string) => void;
  setWallProfile: (profile: WallProfile) => void;
  setCurrentView: (view: ViewMode) => void;
  saveProject: () => void;
  loadProject: (id: string) => void;
  createNewProject: (name?: string) => void;
  
  // Wall bounds protection actions
  checkWallBoundsLock: (wallPosition: WallPosition, proposedDimensions: Partial<BuildingDimensions>) => { canModify: boolean; restrictions: string[] };
  getWallProtectionStatus: (wallPosition: WallPosition) => WallBoundsProtection | null;
  overrideWallLock: (wallPosition: WallPosition, reason: string) => boolean;
}