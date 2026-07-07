const fs = require('fs');
let content = fs.readFileSync('AdminDashboard.jsx', 'utf-8');

// Add new imports
if (!content.includes('MdBloodtype')) {
  content = content.replace('import { FaGraduationCap, FaChalkboardTeacher } from "react-icons/fa";', 'import { FaGraduationCap, FaChalkboardTeacher } from "react-icons/fa";\nimport { MdBloodtype, MdOutlineSensors } from "react-icons/md";');
}

// Replace FiDroplet with MdBloodtype
content = content.split('FiDroplet').join('MdBloodtype');

// The tileIcon for active requests is at line ~1676, but let's replace all `<FiAlertCircle` inside `metricTile critical` block if possible.
// Or just replace `<FiAlertCircle className="dashboardIcon" />` with `<MdOutlineSensors className="dashboardIcon" />` specifically for the Active Live Request
content = content.replace('<span className="tileIcon"><FiAlertCircle className="dashboardIcon" /></span>\n          <div className="tileData">\n            <h3>{activeRequests.length}</h3>', '<span className="tileIcon"><MdOutlineSensors className="dashboardIcon" /></span>\n          <div className="tileData">\n            <h3>{activeRequests.length}</h3>');

// Also update the dashboardLayout CSS
let cssOld = `.dashboardLayout {
          display: grid;
          grid-template-columns: 380px 1fr;
          gap: 35px;
          align-items: start;
        }`;

let cssNew = `.dashboardLayout {
          display: grid;
          grid-template-columns: 380px 1fr;
          gap: 35px;
          align-items: stretch;
        }`;

content = content.replace(cssOld, cssNew);

let dataStreamOld = `.dataStreamPanel {
          max-height: calc(100vh - 220px);
          overflow-y: auto;
          padding-right: 15px;
        }`;

let dataStreamNew = `.dataStreamPanel {
          min-height: 0;
          display: flex;
          flex-direction: column;
        }

        .horizontalSearchBlock {
          position: sticky;
          top: 0;
          z-index: 10;
        }
        
        .panelSectionTitle {
          position: sticky;
          top: 0;
          z-index: 10;
          background: #fcf8f8;
          padding-top: 10px;
          padding-bottom: 10px;
        }

        .cardsContainer {
          overflow-y: auto;
          flex: 1 1 0;
          min-height: 0;
          padding-right: 15px;
        }
        
        .cardsContainer::-webkit-scrollbar {
          width: 8px;
        }
        .cardsContainer::-webkit-scrollbar-track {
          background: #fcf8f8;
          border-radius: 10px;
        }
        .cardsContainer::-webkit-scrollbar-thumb {
          background: #f0d5d9;
          border-radius: 10px;
        }
        .cardsContainer::-webkit-scrollbar-thumb:hover {
          background: #b00020;
        }`;

content = content.replace(dataStreamOld, dataStreamNew);

// Remove the old scrollbar CSS for dataStreamPanel
content = content.replace(`.dataStreamPanel::-webkit-scrollbar {
          width: 8px;
        }

        .dataStreamPanel::-webkit-scrollbar-track {
          background: #fcf8f8;
          border-radius: 10px;
        }

        .dataStreamPanel::-webkit-scrollbar-thumb {
          background: #f0d5d9;
          border-radius: 10px;
        }

        .dataStreamPanel::-webkit-scrollbar-thumb:hover {
          background: #b00020;
        }`, '');

// In case horizontalSearchBlock was already styled, let's make sure it doesn't duplicate but we just appended position sticky to a new class definition which CSS will cascade. Actually it's better to replace the original.
// We'll let CSS cascade handle it since we added `.horizontalSearchBlock { position: sticky; top: 0; z-index: 10; }`.

// Wait, the mobile media query had `.dataStreamPanel { max-height: 85vh; }`. Let's update that to `.cardsContainer`.
content = content.replace(`.dataStreamPanel {\n             max-height: 85vh;\n          }`, `.cardsContainer {\n             max-height: 85vh;\n          }`);

fs.writeFileSync('AdminDashboard.jsx', content, 'utf-8');
console.log("Done");
