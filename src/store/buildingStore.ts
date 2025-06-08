import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { validateWallHeights } from '../utils/wallHeightValidation';
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

  // Update building dimensions with validation
  updateDimensions: (dimensions: Partial<BuildingDimensions>) => 
    set((state) => {
      const newDimensions = {
        ...state.currentProject.building.dimensions,
        ...dimensions,
      };

      // If height changed, validate all existing features
      if (dimensions.height !== undefined) {
        const validation = validateWallHeights(newDimensions, state.currentProject.building.features);
        
        if (!validation.valid) {
          console.warn('Wall height validation failed:', validation.errors);
          // You could show a notification here or handle the validation failure
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

  // Add a new wall feature with validation
  addFeature: (feature: Omit<WallFeature, 'id'>) => 
    set((state) => {
      const newFeature = { ...feature, id: uuidv4() };
      const newFeatures = [...state.currentProject.building.features, newFeature];
      
      // Validate the new feature configuration
      const validation = validateWallHeights(
        state.currentProject.building.dimensions,
        newFeatures
      );

      if (!validation.valid) {
        console.error('Feature validation failed:', validation.errors);
        // Return state unchanged if validation fails
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

  // Add a new skylight
  addSkylight: (skylight: Skylight) =>
    set((state) => ({
      currentProject: {
        ...state.currentProject,
        lastModified: new Date(),
        building: {
          ...state.currentProject.building,
          skylights: [...state.currentProject.building.skylights, skylight],
        },
      },
    })),

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

  // Update a wall feature with validation
  updateFeature: (id: string, updates: Partial<Omit<WallFeature, 'id'>>) => 
    set((state) => {
      const updatedFeatures = state.currentProject.building.features.map((feature) =>
        feature.id === id ? { ...feature, ...updates } : feature
      );

      // Validate the updated feature configuration
      const validation = validateWallHeights(
        state.currentProject.building.dimensions,
        updatedFeatures
      );

      if (!validation.valid) {
        console.error('Feature update validation failed:', validation.errors);
        // Return state unchanged if validation fails
        return state;
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