import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Upload, Download, Share2, Settings, HelpCircle, RotateCcw, Grid3X3 } from 'lucide-react';
import { useBuildingStore } from '../store/buildingStore';
import { useTemplateStore } from '../store/templateStore';
import { exportTechnicalDrawings } from './TechnicalDrawings';
import TemplateSelector from './templates/TemplateSelector';

const Toolbar: React.FC = () => {
  const { createNewProject, saveProject, dimensions, features } = useBuildingStore((state) => ({
    createNewProject: state.createNewProject,
    saveProject: state.saveProject,
    dimensions: state.currentProject.building.dimensions,
    features: state.currentProject.building.features
  }));

  const { isTemplateModalOpen, openTemplateModal, closeTemplateModal, applyTemplate } = useTemplateStore();
  
  const handleNewProject = () => {
    if (window.confirm('Create a new project? Any unsaved changes will be lost.')) {
      createNewProject();
    }
  };

  const handleExport = () => {
    exportTechnicalDrawings(dimensions, features);
  };

  const handleTemplateSelect = (template: any) => {
    applyTemplate(template);
  };
  
  return (
    <>
      <motion.div 
        className="h-14 bg-white border-b border-gray-200 flex items-center px-4 shadow-sm z-10"
        initial={{ y: -56 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="flex space-x-2 mr-auto">
          <button 
            onClick={handleNewProject}
            className="btn"
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            New
          </button>

          <button 
            onClick={openTemplateModal}
            className="btn"
          >
            <Grid3X3 className="w-4 h-4 mr-1" />
            Templates
          </button>
          
          <button className="btn-secondary btn">
            <Upload className="w-4 h-4 mr-1" />
            Load
          </button>
          
          <button 
            onClick={() => saveProject()}
            className="btn"
          >
            <Save className="w-4 h-4 mr-1" />
            Save
          </button>
          
          <button 
            onClick={handleExport} 
            className="btn-secondary btn"
          >
            <Download className="w-4 h-4 mr-1" />
            Export Drawings
          </button>
        </div>
        
        <div className="flex space-x-2">
          <button className="btn-secondary btn">
            <Share2 className="w-4 h-4 mr-1" />
            Share
          </button>
          
          <button className="p-2 text-gray-600 hover:text-gray-800 rounded-full hover:bg-gray-100">
            <Settings className="w-5 h-5" />
          </button>
          
          <button className="p-2 text-gray-600 hover:text-gray-800 rounded-full hover:bg-gray-100">
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
      </motion.div>

      {/* Template Selector Modal */}
      {isTemplateModalOpen && (
        <TemplateSelector
          onTemplateSelect={handleTemplateSelect}
          onClose={closeTemplateModal}
        />
      )}
    </>
  );
};

export default Toolbar;