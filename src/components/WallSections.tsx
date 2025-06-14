import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, Ruler, Info } from 'lucide-react';

const WallSections: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size for detailed drawings
    canvas.width = 1600;
    canvas.height = 1200;

    // Clear canvas
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Drawing settings
    ctx.strokeStyle = '#000000';
    ctx.fillStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.font = '12px Arial';

    // Scale: 1:20 (1mm = 20mm actual)
    const scale = 0.05; // 1:20 scale factor

    // Draw main wall section
    drawMainWallSection(ctx, 50, 50, scale);
    
    // Draw left annex connection
    drawLeftAnnexSection(ctx, 550, 50, scale);
    
    // Draw right annex connection
    drawRightAnnexSection(ctx, 1050, 50, scale);

    // Add title block and legends
    drawTitleBlock(ctx);
    drawMaterialLegend(ctx);
    drawNotes(ctx);

  }, []);

  const drawMainWallSection = (ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) => {
    ctx.save();
    ctx.translate(x, y);

    // Title
    ctx.font = 'bold 16px Arial';
    ctx.fillText('MAIN WALL SECTION', 0, -20);
    ctx.fillText('Scale 1:20', 0, -5);
    ctx.font = '12px Arial';

    // Foundation (600mm wide x 300mm deep)
    const foundationWidth = 600 * scale;
    const foundationDepth = 300 * scale;
    
    ctx.fillStyle = '#CCCCCC';
    ctx.fillRect(0, 500, foundationWidth, foundationDepth);
    ctx.strokeRect(0, 500, foundationWidth, foundationDepth);
    
    // Foundation annotation
    ctx.fillStyle = '#000000';
    ctx.fillText('Reinforced Concrete Foundation', foundationWidth + 10, 520);
    ctx.fillText('600mm W x 300mm D', foundationWidth + 10, 535);
    ctx.fillText('N20 Concrete, F72 Mesh', foundationWidth + 10, 550);

    // Slab on ground (150mm thick)
    const slabThickness = 150 * scale;
    ctx.fillStyle = '#E0E0E0';
    ctx.fillRect(0, 500 - slabThickness, foundationWidth, slabThickness);
    ctx.strokeRect(0, 500 - slabThickness, foundationWidth, slabThickness);
    
    // Slab annotation
    ctx.fillText('150mm Concrete Slab', foundationWidth + 10, 430);
    ctx.fillText('N25 Concrete, SL72 Mesh', foundationWidth + 10, 445);
    ctx.fillText('DPM under slab', foundationWidth + 10, 460);

    // Steel column (200x200 UC)
    const columnWidth = 200 * scale;
    const columnHeight = 4000 * scale;
    
    ctx.fillStyle = '#FF6B6B';
    ctx.fillRect(200 * scale, 500 - slabThickness - columnHeight, columnWidth, columnHeight);
    ctx.strokeRect(200 * scale, 500 - slabThickness - columnHeight, columnWidth, columnHeight);
    
    // Column annotation
    ctx.fillText('200UC Steel Column', foundationWidth + 10, 300);
    ctx.fillText('Grade 350 Steel', foundationWidth + 10, 315);
    ctx.fillText('Galvanized Finish', foundationWidth + 10, 330);

    // Wall framing (C150 purlins at 1200 centers)
    for (let i = 0; i < 4; i++) {
      const purlinY = 500 - slabThickness - (i + 1) * 1000 * scale;
      ctx.fillStyle = '#4ECDC4';
      ctx.fillRect(0, purlinY - 75 * scale, 150 * scale, 150 * scale);
      ctx.strokeRect(0, purlinY - 75 * scale, 150 * scale, 150 * scale);
    }
    
    // Purlin annotation
    ctx.fillText('C150 Steel Purlins @ 1200 ctrs', foundationWidth + 10, 250);
    ctx.fillText('Grade 350 Steel', foundationWidth + 10, 265);

    // External cladding (0.42mm Colorbond)
    const claddingThickness = 5 * scale; // Exaggerated for visibility
    ctx.fillStyle = '#45B7D1';
    ctx.fillRect(-claddingThickness, 500 - slabThickness - columnHeight, claddingThickness, columnHeight);
    ctx.strokeRect(-claddingThickness, 500 - slabThickness - columnHeight, claddingThickness, columnHeight);
    
    // Cladding annotation
    ctx.fillText('0.42mm COLORBOND Steel', foundationWidth + 10, 200);
    ctx.fillText('Trimdek Profile', foundationWidth + 10, 215);
    ctx.fillText('Surfmist Color', foundationWidth + 10, 230);

    // Insulation (R1.5 bulk + R1.5 reflective)
    ctx.fillStyle = '#FFE66D';
    ctx.fillRect(150 * scale, 500 - slabThickness - columnHeight, 75 * scale, columnHeight);
    ctx.strokeRect(150 * scale, 500 - slabThickness - columnHeight, 75 * scale, columnHeight);
    
    // Insulation annotation
    ctx.fillText('R3.0 Total Insulation', foundationWidth + 10, 150);
    ctx.fillText('R1.5 Bulk + R1.5 Reflective', foundationWidth + 10, 165);
    ctx.fillText('Vapor Barrier Included', foundationWidth + 10, 180);

    // Internal lining (10mm FC sheet)
    const liningThickness = 10 * scale;
    ctx.fillStyle = '#F8F8F8';
    ctx.fillRect(400 * scale, 500 - slabThickness - columnHeight, liningThickness, columnHeight);
    ctx.strokeRect(400 * scale, 500 - slabThickness - columnHeight, liningThickness, columnHeight);
    
    // Lining annotation
    ctx.fillText('10mm Fiber Cement Sheet', foundationWidth + 10, 100);
    ctx.fillText('Painted Finish', foundationWidth + 10, 115);

    // Roof structure
    const roofHeight = 500 * scale;
    const roofSpan = 600 * scale;
    
    // Roof truss
    ctx.beginPath();
    ctx.moveTo(0, 500 - slabThickness - columnHeight);
    ctx.lineTo(roofSpan / 2, 500 - slabThickness - columnHeight - roofHeight);
    ctx.lineTo(roofSpan, 500 - slabThickness - columnHeight);
    ctx.stroke();
    
    // Roof cladding
    ctx.fillStyle = '#95A5A6';
    ctx.beginPath();
    ctx.moveTo(-10, 500 - slabThickness - columnHeight);
    ctx.lineTo(roofSpan / 2, 500 - slabThickness - columnHeight - roofHeight - 10);
    ctx.lineTo(roofSpan + 10, 500 - slabThickness - columnHeight);
    ctx.lineTo(roofSpan, 500 - slabThickness - columnHeight);
    ctx.lineTo(roofSpan / 2, 500 - slabThickness - columnHeight - roofHeight);
    ctx.lineTo(0, 500 - slabThickness - columnHeight);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Roof annotation
    ctx.fillText('0.42mm COLORBOND Roofing', foundationWidth + 10, 50);
    ctx.fillText('Trimdek Profile', foundationWidth + 10, 65);
    ctx.fillText('Monument Color', foundationWidth + 10, 80);

    // Dimension lines
    drawDimensionLine(ctx, 0, 520, foundationWidth, 520, '600mm');
    drawDimensionLine(ctx, -30, 500 - slabThickness, -30, 500, '150mm');
    drawDimensionLine(ctx, -50, 500 - slabThickness - columnHeight, -50, 500 - slabThickness, '4000mm');

    ctx.restore();
  };

  const drawLeftAnnexSection = (ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) => {
    ctx.save();
    ctx.translate(x, y);

    // Title
    ctx.font = 'bold 16px Arial';
    ctx.fillText('LEFT ANNEX CONNECTION', 0, -20);
    ctx.fillText('Scale 1:20', 0, -5);
    ctx.font = '12px Arial';

    // Main structure (simplified)
    const mainHeight = 4000 * scale;
    const mainWidth = 200 * scale;
    
    ctx.fillStyle = '#E8E8E8';
    ctx.fillRect(0, 500 - mainHeight, mainWidth, mainHeight);
    ctx.strokeRect(0, 500 - mainHeight, mainWidth, mainHeight);
    
    // Connection beam (300x200 UB)
    const beamWidth = 300 * scale;
    const beamDepth = 200 * scale;
    
    ctx.fillStyle = '#FF6B6B';
    ctx.fillRect(mainWidth, 300, beamWidth, beamDepth);
    ctx.strokeRect(mainWidth, 300, beamWidth, beamDepth);
    
    // Beam annotation
    ctx.fillText('300UB Connection Beam', beamWidth + mainWidth + 10, 320);
    ctx.fillText('Grade 350 Steel', beamWidth + mainWidth + 10, 335);
    ctx.fillText('Welded Connection', beamWidth + mainWidth + 10, 350);

    // Annex structure
    const annexHeight = 3000 * scale;
    const annexWidth = 150 * scale;
    
    ctx.fillStyle = '#D0D0D0';
    ctx.fillRect(mainWidth + beamWidth, 500 - annexHeight, annexWidth, annexHeight);
    ctx.strokeRect(mainWidth + beamWidth, 500 - annexHeight, annexWidth, annexHeight);
    
    // Annex annotation
    ctx.fillText('Annex Structure', beamWidth + mainWidth + 10, 280);
    ctx.fillText('150UC Columns', beamWidth + mainWidth + 10, 295);

    // Flashing detail
    ctx.fillStyle = '#34495E';
    ctx.fillRect(mainWidth - 50 * scale, 300 - 25 * scale, beamWidth + 100 * scale, 50 * scale);
    ctx.strokeRect(mainWidth - 50 * scale, 300 - 25 * scale, beamWidth + 100 * scale, 50 * scale);
    
    // Flashing annotation
    ctx.fillText('Structural Flashing', beamWidth + mainWidth + 10, 250);
    ctx.fillText('0.55mm Colorbond', beamWidth + mainWidth + 10, 265);

    // Sealant detail
    ctx.fillStyle = '#2C3E50';
    ctx.fillRect(mainWidth - 10 * scale, 290, 20 * scale, 40);
    ctx.fillRect(mainWidth + beamWidth - 10 * scale, 290, 20 * scale, 40);
    
    // Sealant annotation
    ctx.fillText('Structural Sealant', beamWidth + mainWidth + 10, 200);
    ctx.fillText('Weather Seal', beamWidth + mainWidth + 10, 215);

    // Expansion joint
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(mainWidth + beamWidth / 2, 250);
    ctx.lineTo(mainWidth + beamWidth / 2, 400);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Expansion joint annotation
    ctx.fillText('20mm Expansion Joint', beamWidth + mainWidth + 10, 150);
    ctx.fillText('Flexible Sealant', beamWidth + mainWidth + 10, 165);

    // Dimension lines
    drawDimensionLine(ctx, mainWidth, 520, mainWidth + beamWidth, 520, '300mm');
    drawDimensionLine(ctx, -30, 500 - annexHeight, -30, 500, '3000mm');

    ctx.restore();
  };

  const drawRightAnnexSection = (ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) => {
    ctx.save();
    ctx.translate(x, y);

    // Title
    ctx.font = 'bold 16px Arial';
    ctx.fillText('RIGHT ANNEX CONNECTION', 0, -20);
    ctx.fillText('Scale 1:20', 0, -5);
    ctx.font = '12px Arial';

    // Main structure (simplified)
    const mainHeight = 4000 * scale;
    const mainWidth = 200 * scale;
    
    ctx.fillStyle = '#E8E8E8';
    ctx.fillRect(200 * scale, 500 - mainHeight, mainWidth, mainHeight);
    ctx.strokeRect(200 * scale, 500 - mainHeight, mainWidth, mainHeight);

    // Stepped connection detail
    const stepHeight = 500 * scale;
    const stepWidth = 100 * scale;
    
    ctx.fillStyle = '#E74C3C';
    ctx.fillRect(400 * scale, 350, stepWidth, stepHeight);
    ctx.strokeRect(400 * scale, 350, stepWidth, stepHeight);
    
    // Step annotation
    ctx.fillText('Stepped Connection', 520, 380);
    ctx.fillText('Height Transition', 520, 395);

    // Annex structure (different height)
    const annexHeight = 2500 * scale;
    const annexWidth = 150 * scale;
    
    ctx.fillStyle = '#D0D0D0';
    ctx.fillRect(500 * scale, 500 - annexHeight, annexWidth, annexHeight);
    ctx.strokeRect(500 * scale, 500 - annexHeight, annexWidth, annexHeight);
    
    // Annex annotation
    ctx.fillText('Lower Annex', 520, 350);
    ctx.fillText('125UC Columns', 520, 365);

    // Transition flashing
    ctx.fillStyle = '#34495E';
    ctx.beginPath();
    ctx.moveTo(400 * scale, 350);
    ctx.lineTo(500 * scale, 350);
    ctx.lineTo(500 * scale, 500 - annexHeight);
    ctx.lineTo(400 * scale, 500 - annexHeight);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Transition annotation
    ctx.fillText('Transition Flashing', 520, 300);
    ctx.fillText('Custom Profile', 520, 315);
    ctx.fillText('Weather Sealed', 520, 330);

    // Gutter detail
    const gutterWidth = 200 * scale;
    const gutterDepth = 100 * scale;
    
    ctx.fillStyle = '#7F8C8D';
    ctx.fillRect(450 * scale, 350 - gutterDepth, gutterWidth, gutterDepth);
    ctx.strokeRect(450 * scale, 350 - gutterDepth, gutterWidth, gutterDepth);
    
    // Gutter annotation
    ctx.fillText('200mm Box Gutter', 520, 250);
    ctx.fillText('0.55mm Colorbond', 520, 265);
    ctx.fillText('Fall 1:100', 520, 280);

    // Downpipe connection
    const downpipeSize = 100 * scale;
    ctx.fillStyle = '#2C3E50';
    ctx.fillRect(550 * scale - downpipeSize/2, 350, downpipeSize, 150);
    ctx.strokeRect(550 * scale - downpipeSize/2, 350, downpipeSize, 150);
    
    // Downpipe annotation
    ctx.fillText('100mm Downpipe', 520, 200);
    ctx.fillText('Colorbond Finish', 520, 215);

    // Dimension lines
    drawDimensionLine(ctx, 400 * scale, 520, 500 * scale, 520, '100mm');
    drawDimensionLine(ctx, 500 * scale, 520, 650 * scale, 520, '150mm');
    drawDimensionLine(ctx, -30, 500 - annexHeight, -30, 500, '2500mm');

    ctx.restore();
  };

  const drawDimensionLine = (ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, text: string) => {
    // Draw dimension line
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    
    // Draw arrows
    const arrowSize = 5;
    ctx.beginPath();
    ctx.moveTo(x1 - arrowSize, y1 - arrowSize);
    ctx.lineTo(x1, y1);
    ctx.lineTo(x1 - arrowSize, y1 + arrowSize);
    ctx.moveTo(x2 + arrowSize, y2 - arrowSize);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x2 + arrowSize, y2 + arrowSize);
    ctx.stroke();
    
    // Draw text
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;
    ctx.fillText(text, midX - 20, midY - 5);
  };

  const drawTitleBlock = (ctx: CanvasRenderingContext2D) => {
    // Title block
    ctx.strokeRect(50, 950, 400, 200);
    
    ctx.font = 'bold 18px Arial';
    ctx.fillText('DETAILED WALL SECTIONS', 60, 980);
    
    ctx.font = '14px Arial';
    ctx.fillText('Project: Multi-Bay Steel Building', 60, 1005);
    ctx.fillText('Drawing: Wall Construction Details', 60, 1025);
    ctx.fillText('Scale: 1:20', 60, 1045);
    ctx.fillText('Date: ' + new Date().toLocaleDateString(), 60, 1065);
    
    ctx.font = '12px Arial';
    ctx.fillText('All dimensions in millimeters unless noted', 60, 1090);
    ctx.fillText('Refer to structural drawings for beam sizes', 60, 1105);
    ctx.fillText('All steel to be galvanized unless noted', 60, 1120);
    ctx.fillText('Comply with AS/NZS 1170 for loading', 60, 1135);
  };

  const drawMaterialLegend = (ctx: CanvasRenderingContext2D) => {
    const legendX = 500;
    const legendY = 950;
    
    ctx.strokeRect(legendX, legendY, 300, 200);
    
    ctx.font = 'bold 14px Arial';
    ctx.fillText('MATERIAL LEGEND', legendX + 10, legendY + 25);
    
    ctx.font = '12px Arial';
    
    // Concrete
    ctx.fillStyle = '#CCCCCC';
    ctx.fillRect(legendX + 10, legendY + 35, 20, 15);
    ctx.strokeRect(legendX + 10, legendY + 35, 20, 15);
    ctx.fillStyle = '#000000';
    ctx.fillText('Reinforced Concrete', legendX + 40, legendY + 47);
    
    // Steel
    ctx.fillStyle = '#FF6B6B';
    ctx.fillRect(legendX + 10, legendY + 55, 20, 15);
    ctx.strokeRect(legendX + 10, legendY + 55, 20, 15);
    ctx.fillStyle = '#000000';
    ctx.fillText('Structural Steel', legendX + 40, legendY + 67);
    
    // Cladding
    ctx.fillStyle = '#45B7D1';
    ctx.fillRect(legendX + 10, legendY + 75, 20, 15);
    ctx.strokeRect(legendX + 10, legendY + 75, 20, 15);
    ctx.fillStyle = '#000000';
    ctx.fillText('Colorbond Cladding', legendX + 40, legendY + 87);
    
    // Insulation
    ctx.fillStyle = '#FFE66D';
    ctx.fillRect(legendX + 10, legendY + 95, 20, 15);
    ctx.strokeRect(legendX + 10, legendY + 95, 20, 15);
    ctx.fillStyle = '#000000';
    ctx.fillText('Insulation', legendX + 40, legendY + 107);
    
    // Lining
    ctx.fillStyle = '#F8F8F8';
    ctx.fillRect(legendX + 10, legendY + 115, 20, 15);
    ctx.strokeRect(legendX + 10, legendY + 115, 20, 15);
    ctx.fillStyle = '#000000';
    ctx.fillText('Internal Lining', legendX + 40, legendY + 127);
    
    // Flashing
    ctx.fillStyle = '#34495E';
    ctx.fillRect(legendX + 10, legendY + 135, 20, 15);
    ctx.strokeRect(legendX + 10, legendY + 135, 20, 15);
    ctx.fillStyle = '#000000';
    ctx.fillText('Flashing/Sealant', legendX + 40, legendY + 147);
  };

  const drawNotes = (ctx: CanvasRenderingContext2D) => {
    const notesX = 850;
    const notesY = 950;
    
    ctx.strokeRect(notesX, notesY, 400, 200);
    
    ctx.font = 'bold 14px Arial';
    ctx.fillText('CONSTRUCTION NOTES', notesX + 10, notesY + 25);
    
    ctx.font = '11px Arial';
    const notes = [
      '1. All structural steel to AS/NZS 3679',
      '2. Welding to AS/NZS 1554.1',
      '3. Galvanizing to AS/NZS 4680',
      '4. Cladding to AS/NZS 2179',
      '5. Insulation to AS/NZS 4859.1',
      '6. Sealants to AS/NZS 2841',
      '7. Flashing to AS/NZS 2179.1',
      '8. Foundation concrete N20 minimum',
      '9. Slab concrete N25 minimum',
      '10. All connections to be detailed',
      '11. Expansion joints every 30m max',
      '12. Vapor barriers continuous',
      '13. Thermal bridging minimized',
      '14. Weather sealing complete'
    ];
    
    notes.forEach((note, index) => {
      ctx.fillText(note, notesX + 10, notesY + 45 + index * 12);
    });
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = 'wall-sections-detailed.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="p-6 bg-white">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Detailed Wall Sections</h1>
          <p className="text-gray-600">Complete construction details at 1:20 scale</p>
        </div>
        <button
          onClick={handleDownload}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Download className="w-4 h-4" />
          <span>Download Sections</span>
        </button>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <div className="flex items-center space-x-2 mb-2">
          <Info className="w-5 h-5 text-blue-600" />
          <span className="font-medium text-gray-800">Section Details</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-700">
          <div>
            <h3 className="font-medium mb-1">Main Wall Section</h3>
            <ul className="space-y-1">
              <li>• Complete vertical composition</li>
              <li>• Foundation to roof details</li>
              <li>• All material layers shown</li>
              <li>• Structural elements detailed</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-1">Left Annex Connection</h3>
            <ul className="space-y-1">
              <li>• Structural beam connections</li>
              <li>• Flashing and sealing details</li>
              <li>• Expansion joint provisions</li>
              <li>• Weather protection systems</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-1">Right Annex Connection</h3>
            <ul className="space-y-1">
              <li>• Height transition details</li>
              <li>• Stepped connection system</li>
              <li>• Gutter and drainage</li>
              <li>• Custom flashing profiles</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border border-gray-300 rounded-lg overflow-hidden">
        <canvas
          ref={canvasRef}
          className="w-full h-auto bg-white"
          style={{ maxWidth: '100%', height: 'auto' }}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Ruler className="w-5 h-5 text-yellow-600" />
            <span className="font-medium text-yellow-800">Assembly Sequence</span>
          </div>
          <ol className="text-sm text-yellow-700 space-y-1">
            <li>1. Excavate and pour foundations</li>
            <li>2. Install anchor bolts and DPM</li>
            <li>3. Pour concrete slab with mesh</li>
            <li>4. Erect steel frame structure</li>
            <li>5. Install roof structure and cladding</li>
            <li>6. Install wall purlins and girts</li>
            <li>7. Apply external cladding</li>
            <li>8. Install insulation and vapor barrier</li>
            <li>9. Fix internal lining</li>
            <li>10. Install flashing and sealants</li>
            <li>11. Complete connections and joints</li>
            <li>12. Final weather sealing</li>
          </ol>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Info className="w-5 h-5 text-green-600" />
            <span className="font-medium text-green-800">Building Code References</span>
          </div>
          <ul className="text-sm text-green-700 space-y-1">
            <li>• AS/NZS 1170 - Structural Design Actions</li>
            <li>• AS/NZS 3679 - Structural Steel</li>
            <li>• AS/NZS 1554.1 - Welding Standards</li>
            <li>• AS/NZS 4680 - Hot-dip Galvanizing</li>
            <li>• AS/NZS 2179 - Weatherboard Cladding</li>
            <li>• AS/NZS 4859.1 - Thermal Insulation</li>
            <li>• AS/NZS 2841 - Sealants</li>
            <li>• AS 3600 - Concrete Structures</li>
            <li>• AS 2870 - Residential Slabs</li>
            <li>• BCA - Building Code of Australia</li>
            <li>• Local Council Requirements</li>
            <li>• Wind Load Classifications</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default WallSections;