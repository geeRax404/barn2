import { create } from 'zustand';
import type { BuildingTemplate } from '../types/templates';
import { useBuildingStore } from './buildingStore';

interface TemplateStore {
  selectedTemplate: BuildingTemplate | null;
  isTemplateModalOpen: boolean;
  
  // Actions
  setSelectedTemplate: (template: BuildingTemplate | null) => void;
  openTemplateModal: () => void;
  closeTemplateModal: () => void;
  applyTemplate: (template: BuildingTemplate) => void;
}

export const useTemplateStore = create<TemplateStore>((set, get) => ({
  selectedTemplate: null,
  isTemplateModalOpen: false,

  setSelectedTemplate: (template) => set({ selectedTemplate: template }),
  
  openTemplateModal: () => set({ isTemplateModalOpen: true }),
  
  closeTemplateModal: () => set({ isTemplateModalOpen: false }),
  
  applyTemplate: (template) => {
    const buildingStore = useBuildingStore.getState();
    
    // Apply template dimensions
    buildingStore.updateDimensions({
      width: template.defaultDimensions.width,
      length: template.defaultDimensions.length,
      height: template.defaultDimensions.height,
      roofPitch: template.defaultDimensions.roofPitch
    });
    
    // Apply template colors
    buildingStore.setColor(template.defaultColor);
    buildingStore.setRoofColor(template.defaultRoofColor);
    buildingStore.setWallProfile(template.wallProfile);
    
    // Clear existing features and add template features
    const currentFeatures = buildingStore.currentProject.building.features;
    currentFeatures.forEach(feature => {
      buildingStore.removeFeature(feature.id);
    });
    
    // Add template features
    template.features.forEach(feature => {
      buildingStore.addFeature({
        type: feature.type,
        width: feature.width,
        height: feature.height,
        position: feature.position
      });
    });
    
    // Clear existing skylights and add template skylights
    const currentSkylights = buildingStore.currentProject.building.skylights;
    for (let i = currentSkylights.length - 1; i >= 0; i--) {
      buildingStore.removeSkylight(i);
    }
    
    // Add template skylights
    if (template.skylights) {
      template.skylights.forEach(skylight => {
        buildingStore.addSkylight(skylight);
      });
    }
    
    // Update project name to reflect template
    buildingStore.currentProject.name = template.name;
    
    set({ 
      selectedTemplate: template,
      isTemplateModalOpen: false 
    });
  }
}));