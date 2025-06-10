import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { validateWallHeights } from '../utils/wallHeightValidation';
import { isValidFeaturePosition } from '../utils/wallBoundsValidation';
import { isValidSkylightPosition } from '../utils/skylightValidation';
import type { BuildingStore, Project, ViewMode, BuildingDimensions, WallFeature, Skylight } from '../types';

// Default initial building
const defaultBuilding = {
  dimensions: {
    width: 30,
    length: 40,
    height: 12,
    roofPitch: 4, // 4:12 pitch
  },
  features: [],
  skylights: [],
  color: '#E5E7EB', // Light gray
  roofColor: '#9CA3AF', // Medium gray
};

// Create a default project
const createDefaultProject = (): Project => ({
  id: uuidv4(),
  name: 'New Barn',
  created: new Date(),
  lastModified: new Date(),
  building: { ...defaultBuilding },
});

// Create the store
export const useBuildingStore = create<BuildingStore>((set, get) => ({
  currentProject: createDefaultProject(),
  savedProjects: [],
  currentView: '3d' as ViewMode,

  // Update building dimensions with comprehensive validation
  updateDimensions: (dimensions: Partial<BuildingDimensions>) => 
    set((state) => {
      const newDimensions = {
        ...state.currentProject.building.dimensions,
        ...dimensions,
      };

      // If height changed, validate all existing features
      if (dimensions.height !== undefined) {
        const heightValidation = validateWallHeights(newDimensions, state.currentProject.building.features);
        
        if (!heightValidation.valid) {
          console.warn('Wall height validation failed:', heightValidation.errors);
        }
      }

      // If width or length changed, validate wall bounds for all features
      if (dimensions.width !== undefined || dimensions.length !== undefined) {
        const invalidFeatures = state.currentProject.building.features.filter(feature => {
          return !isValidFeaturePosition(feature, newDimensions);
        });

        if (invalidFeatures.length > 0) {
          console.warn('Wall bounds validation failed for features:', invalidFeatures.map(f => f.id));
        }

        // Also validate skylights when roof dimensions change
        const invalidSkylights = state.currentProject.building.skylights.filter(skylight => {
          return !isValidSkylightPosition(skylight, newDimensions);
        });

        if (invalidSkylights.length > 0) {
          console.warn('Skylight bounds validation failed for skylights:', invalidSkylights.length);
        }
      }

      return {
        currentProject: {
          ...state.currentProject,
          lastModified: new Date(),
          building: {
            ...state.currentProject.building,
            dimensions: newDimensions,
          },
        },
      };
    }),

  // Add a new wall feature with comprehensive validation
  addFeature: (feature: Omit<WallFeature, 'id'>) => 
    set((state) => {
      const newFeature = { ...feature, id: uuidv4() };
      const newFeatures = [...state.currentProject.building.features, newFeature];
      
      // Validate height constraints
      const heightValidation = validateWallHeights(
        state.currentProject.building.dimensions,
        newFeatures
      );

      if (!heightValidation.valid) {
        console.error('Feature height validation failed:', heightValidation.errors);
        return state;
      }

      // Validate wall bounds
      const boundsValid = isValidFeaturePosition(feature, state.currentProject.building.dimensions);

      if (!boundsValid) {
        console.error('Feature bounds validation failed: Feature extends beyond wall boundaries');
        return state;
      }

      return {
        currentProject: {
          ...state.currentProject,
          lastModified: new Date(),
          building: {
            ...state.currentProject.building,
            features: newFeatures,
          },
        },
      };
    }),

  // Remove a wall feature
  removeFeature: (id: string) => 
    set((state) => ({
      currentProject: {
        ...state.currentProject,
        lastModified: new Date(),
        building: {
          ...state.currentProject.building,
          features: state.currentProject.building.features.filter(
            (feature) => feature.id !== id
          ),
        },
      },
    })),

  // Add a new skylight with validation
  addSkylight: (skylight: Skylight) =>
    set((state) => {
      // Validate skylight bounds
      const boundsValid = isValidSkylightPosition(skylight, state.currentProject.building.dimensions);

      if (!boundsValid) {
        console.error('Skylight bounds validation failed: Skylight extends beyond roof boundaries');
        return state;
      }

      return {
        currentProject: {
          ...state.currentProject,
          lastModified: new Date(),
          building: {
            ...state.currentProject.building,
            skylights: [...state.currentProject.building.skylights, skylight],
          },
        },
      };
    }),

  // Remove a skylight
  removeSkylight: (index: number) =>
    set((state) => ({
      currentProject: {
        ...state.currentProject,
        lastModified: new Date(),
        building: {
          ...state.currentProject.building,
          skylights: state.currentProject.building.skylights.filter((_, i) => i !== index),
        },
      },
    })),

  // Update a skylight with validation
  updateSkylight: (index: number, updates: Partial<Skylight>) =>
    set((state) => {
      const updatedSkylights = state.currentProject.building.skylights.map((skylight, i) =>
        i === index ? { ...skylight, ...updates } : skylight
      );

      // Validate the updated skylight
      const updatedSkylight = updatedSkylights[index];
      const boundsValid = isValidSkylightPosition(updatedSkylight, state.currentProject.building.dimensions);

      if (!boundsValid) {
        console.error('Skylight update bounds validation failed: Skylight extends beyond roof boundaries');
        return state;
      }

      return {
        currentProject: {
          ...state.currentProject,
          lastModified: new Date(),
          building: {
            ...state.currentProject.building,
            skylights: updatedSkylights,
          },
        },
      };
    }),

  // Update a wall feature with comprehensive validation
  updateFeature: (id: string, updates: Partial<Omit<WallFeature, 'id'>>) => 
    set((state) => {
      const updatedFeatures = state.currentProject.building.features.map((feature) =>
        feature.id === id ? { ...feature, ...updates } : feature
      );

      // Validate height constraints
      const heightValidation = validateWallHeights(
        state.currentProject.building.dimensions,
        updatedFeatures
      );

      if (!heightValidation.valid) {
        console.error('Feature update height validation failed:', heightValidation.errors);
        return state;
      }

      // Validate wall bounds for the updated feature
      const updatedFeature = updatedFeatures.find(f => f.id === id);
      if (updatedFeature) {
        const boundsValid = isValidFeaturePosition(updatedFeature, state.currentProject.building.dimensions);

        if (!boundsValid) {
          console.error('Feature update bounds validation failed: Feature extends beyond wall boundaries');
          return state;
        }
      }

      return {
        currentProject: {
          ...state.currentProject,
          lastModified: new Date(),
          building: {
            ...state.currentProject.building,
            features: updatedFeatures,
          },
        },
      };
    }),

  // Set building color
  setColor: (color: string) => 
    set((state) => ({
      currentProject: {
        ...state.currentProject,
        lastModified: new Date(),
        building: {
          ...state.currentProject.building,
          color,
        },
      },
    })),

  // Set roof color
  setRoofColor: (color: string) => 
    set((state) => ({
      currentProject: {
        ...state.currentProject,
        lastModified: new Date(),
        building: {
          ...state.currentProject.building,
          roofColor: color,
        },
      },
    })),

  // Change current view mode
  setCurrentView: (view: ViewMode) => 
    set({ currentView: view }),

  // Save current project
  saveProject: () => 
    set((state) => {
      const updatedProject = {
        ...state.currentProject,
        lastModified: new Date(),
      };
      
      const projectExists = state.savedProjects.some(
        (project) => project.id === updatedProject.id
      );
      
      if (projectExists) {
        return {
          savedProjects: state.savedProjects.map((project) =>
            project.id === updatedProject.id ? updatedProject : project
          ),
        };
      } else {
        return {
          savedProjects: [...state.savedProjects, updatedProject],
        };
      }
    }),

  // Load a saved project
  loadProject: (id: string) => 
    set((state) => {
      const projectToLoad = state.savedProjects.find(
        (project) => project.id === id
      );
      
      if (!projectToLoad) {
        return {}; // No changes if project not found
      }
      
      return {
        currentProject: { ...projectToLoad },
      };
    }),

  // Create a new project
  createNewProject: (name = 'New Barn') => 
    set(() => ({
      currentProject: {
        ...createDefaultProject(),
        name,
      },
    })),
}));