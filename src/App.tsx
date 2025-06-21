'use client';

import React from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import { useBuildingStore } from './store/buildingStore';

// Dynamically import components that use lucide-react icons with SSR disabled
const Sidebar = dynamic(() => import('./components/Sidebar'), { ssr: false });
const Toolbar = dynamic(() => import('./components/Toolbar'), { ssr: false });
const ViewControls = dynamic(() => import('./components/ViewControls'), { ssr: false });
const Canvas3D = dynamic(() => import('./components/Canvas3D'), { ssr: false });

function App() {
  const currentView = useBuildingStore((state) => state.currentView);
  
  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      <Sidebar />
      
      <main className="flex-1 flex flex-col">
        <Toolbar />
        
        <motion.div 
          className="flex-1 relative bg-gray-200"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          style={{ height: 'calc(100vh - 3.5rem)' }}
        >
          <Canvas3D view={currentView} />
          <ViewControls />
        </motion.div>
      </main>
    </div>
  );
}

export default App;