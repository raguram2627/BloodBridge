const fs = require('fs');

let content = fs.readFileSync('AdminDashboard.jsx', 'utf8');

// 1. Update Imports
if (!content.includes('FiUsers')) {
  content = content.replace(
    'import { useState, useEffect } from "react";',
    `import { useState, useEffect } from "react";
import { FiUsers, FiActivity, FiAlertCircle, FiClipboard, FiClock, FiShield, FiCheckCircle, FiXCircle, FiInfo, FiSearch, FiAward, FiHeart, FiPhone, FiMessageCircle, FiPlus, FiLock, FiBarChart2 } from "react-icons/fi";
import { FaGraduationCap, FaChalkboardTeacher, FaTint } from "react-icons/fa";`
  );
}

// 2. CSS updates
content = content.replace(
  `.dashboardLayout {
          display: grid;
          grid-template-columns: 380px 1fr;
          gap: 35px;
          align-items: start;
        }`,
  `.dashboardLayout {
          display: grid;
          grid-template-columns: 380px 1fr;
          gap: 35px;
          align-items: start;
        }
        
        .dataStreamPanel {
          position: sticky;
          top: 40px;
          height: calc(100vh - 80px);
          display: flex;
          flex-direction: column;
        }

        .horizontalSearchBlock {
          flex-shrink: 0;
        }
        
        .dataStreamPanel > div, .emergencyConsoleWorkspace {
          display: flex;
          flex-direction: column;
          height: 100%;
          overflow: hidden;
        }

        .eligibilityVerticalStack, .triageVerticalStack, .cardsContainerWrapper {
          flex: 1;
          overflow-y: auto;
          padding-right: 15px;
        }

        /* Scrollbar styles */
        .eligibilityVerticalStack::-webkit-scrollbar, .triageVerticalStack::-webkit-scrollbar, .cardsContainerWrapper::-webkit-scrollbar {
          width: 6px;
        }
        .eligibilityVerticalStack::-webkit-scrollbar-track, .triageVerticalStack::-webkit-scrollbar-track, .cardsContainerWrapper::-webkit-scrollbar-track {
          background: #fdf2f2;
          border-radius: 10px;
        }
        .eligibilityVerticalStack::-webkit-scrollbar-thumb, .triageVerticalStack::-webkit-scrollbar-thumb, .cardsContainerWrapper::-webkit-scrollbar-thumb {
          background: #fbc2c2;
          border-radius: 10px;
        }
        .eligibilityVerticalStack::-webkit-scrollbar-thumb:hover, .triageVerticalStack::-webkit-scrollbar-thumb:hover, .cardsContainerWrapper::-webkit-scrollbar-thumb:hover {
          background: #b00020;
        }`
);

// 3. Add .cardsContainerWrapper to History and Default Views
content = content.replace(
  `{viewMode === "history" ? (`,
  `<div className="cardsContainerWrapper">\n            {viewMode === "history" ? (`
);

content = content.replace(
  `          )}\n        </div>\n      </div>\n\n      {/* Global Manual Donation Modals */}`,
  `          )}\n          </div>\n        </div>\n      </div>\n\n      {/* Global Manual Donation Modals */}`
);

content = content.replace(
  `{showGlobalLogger && (`,
  `</div>\n        </div>\n      </div>\n\n      {showGlobalLogger && (`
);

// 4. Emojis
const replacements = [
  ['"🥇", "🥈", "🥉"', '"1st", "2nd", "3rd"'],
  ['<span className="spinner">🔄</span> Updating database records...', '<span className="spinner"><FiActivity /></span> Updating database records...'],
  ['⚠️ System Error:', '<FiAlertCircle style={{ marginRight: "8px" }} /> System Error:'],
  ['<span className="tileIcon">👥</span>', '<span className="tileIcon"><FiUsers /></span>'],
  ['<span className="tileIcon">🎓</span>', '<span className="tileIcon"><FaGraduationCap /></span>'],
  ['<span className="tileIcon">👨‍🏫</span>', '<span className="tileIcon"><FaChalkboardTeacher /></span>'],
  ['<span className="tileIcon">🚨</span>', '<span className="tileIcon"><FiAlertCircle /></span>'],
  ['📋 View All Donors', '<FiClipboard style={{ marginRight: "8px" }} /> View All Donors'],
  ['🎓 Filter Students', '<FaGraduationCap style={{ marginRight: "8px" }} /> Filter Students'],
  ['👨‍🏫 Filter Faculty', '<FaChalkboardTeacher style={{ marginRight: "8px" }} /> Filter Faculty'],
  ['🏆 Frequent Donors', '<FiAward style={{ marginRight: "8px" }} /> Frequent Donors'],
  ['📜 Donation History Log', '<FiClock style={{ marginRight: "8px" }} /> Donation History Log'],
  ['<h3>🚨 Launch Emergency Broadcast</h3>', '<h3><FiAlertCircle style={{ marginRight: "8px" }} /> Launch Emergency Broadcast</h3>'],
  ['<h2>🚨 Concurrent Emergency Operations</h2>', '<h2><FiAlertCircle style={{ marginRight: "8px" }} /> Concurrent Emergency Operations</h2>'],
  ['📢 Notify Donors', '<FiActivity style={{ marginRight: "8px" }} /> Notify Donors'],
  ['📊 Details', '<FiBarChart2 style={{ marginRight: "6px" }} /> Details'],
  ['📞 Call', '<FiPhone style={{ marginRight: "6px" }} /> Call'],
  ['📱 WhatsApp', '<FiMessageCircle style={{ marginRight: "6px" }} /> WhatsApp'],
  ['📜 History', '<FiClock style={{ marginRight: "6px" }} /> History'],
  ['🔒 Close Request Thread', '<FiLock style={{ marginRight: "8px" }} /> Close Request Thread'],
  ['🧹 Close All Active Requests', '<FiXCircle style={{ marginRight: "8px" }} /> Close All Active Requests'],
  ['<h3>📊 Triage Tracker: Request Group', '<h3><FiBarChart2 style={{ marginRight: "8px" }} /> Triage Tracker: Request Group'],
  ['🔄 Refresh', '<FiActivity style={{ marginRight: "8px" }} /> Refresh'],
  ['✅ {willingCounts', '<FiCheckCircle style={{ marginRight: "4px" }} /> {willingCounts'],
  ['❌ {unavailableCounts', '<FiXCircle style={{ marginRight: "4px" }} /> {unavailableCounts'],
  ['✅ Willing (', '<><FiCheckCircle style={{ marginRight: "6px" }} /> Willing (</>'],
  ['❌ Declined (', '<><FiXCircle style={{ marginRight: "6px" }} /> Declined (</>'],
  ['✅ Willing (', '<><FiCheckCircle style={{ marginRight: "6px" }} /> Willing (</>'],
  ['➕ Log Donation', '<FiPlus style={{ marginRight: "6px" }} /> Log Donation'],
  ['❌ Declined (', '<><FiXCircle style={{ marginRight: "6px" }} /> Declined (</>'],
  ['placeholder="🔍 Search by Name..."', 'placeholder="Search by Name..."'],
  ['placeholder="🆔 Search by Register Number..."', 'placeholder="Search by Register Number..."'],
  ['<h2>📜 Master Donation History Logbook</h2>', '<h2><FiClock style={{ marginRight: "8px" }} /> Master Donation History Logbook</h2>'],
  ['➕ Log Manual Donation', '<FiPlus style={{ marginRight: "8px" }} /> Log Manual Donation'],
  ['<p className="logDate">📅 ', '<p className="logDate"><FiClock style={{ marginRight: "6px" }} /> '],
  ['👤 <span style={{ color: "#666" }}>Donor Asset:', '<FiUsers style={{ marginRight: "6px" }} /> <span style={{ color: "#666" }}>Donor Asset:'],
  ['🏥 <span style={{ color: "#666" }}>Hospital:', '<FaTint style={{ marginRight: "6px" }} /> <span style={{ color: "#666" }}>Hospital:'],
  ['💧 <span style={{ color: "#666" }}>Volume Contributed:', '<FaTint style={{ marginRight: "6px" }} /> <span style={{ color: "#666" }}>Volume Contributed:'],
  ['<h2>{viewMode === "frequent" ? "🏆 Frequent Donors" : "📋 Registered Donors List"}</h2>', '<h2>{viewMode === "frequent" ? <><FiAward style={{ marginRight: "8px" }} /> Frequent Donors</> : <><FiClipboard style={{ marginRight: "8px" }} /> Registered Donors List</>}</h2>'],
  ['<button className="modalCloseCorner" onClick={() => { setShowGlobalLogger(false); setManualRegNo(""); setManualDonorFound(null); }}>✕</button>', '<button className="modalCloseCorner" onClick={() => { setShowGlobalLogger(false); setManualRegNo(""); setManualDonorFound(null); }}><FiXCircle /></button>'],
  ['{manualDonorFound ? `✅ Found Asset: ${manualDonorFound.name} (${manualDonorFound.bloodGroup})` : "❌ No identity found matching this input"}', '{manualDonorFound ? <><FiCheckCircle style={{ marginRight: "6px" }} /> Found Asset: {manualDonorFound.name} ({manualDonorFound.bloodGroup})</> : <><FiXCircle style={{ marginRight: "6px" }} /> No identity found matching this input</>}'],
  ['<button className="modalCloseCorner" onClick={() => setDetailsDonor(null)}>✕</button>', '<button className="modalCloseCorner" onClick={() => setDetailsDonor(null)}><FiXCircle /></button>'],
  ['<button className="modalCloseCorner" onClick={() => setSelectedDonor(null)}>✕</button>', '<button className="modalCloseCorner" onClick={() => setSelectedDonor(null)}><FiXCircle /></button>'],
  ['<p className="nodeDate">📅 ', '<p className="nodeDate"><FiClock style={{ marginRight: "6px" }} /> '],
  ['— 🩸 ', '— <FaTint style={{ marginRight: "6px" }} /> '],
  ['<p className="timelineDesc">🏥 <strong>Location:</strong> ', '<p className="timelineDesc"><FaTint style={{ marginRight: "6px" }} /> <strong>Location:</strong> '],
  ['<button className="modalCloseCorner" onClick={() => setDonationDonor(null)}>✕</button>', '<button className="modalCloseCorner" onClick={() => setDonationDonor(null)}><FiXCircle /></button>'],
  ['toast.type === "error" ? "⚠️" : "✅"', 'toast.type === "error" ? <FiAlertCircle /> : <FiCheckCircle />'],
  ['<h1>🩸 BloodBridge Command Center</h1>', '<h1><FiActivity style={{ marginRight: "12px" }} /> BloodBridge Command Center</h1>'],
  ['<h4>🩸 Select Required Blood Groups</h4>', '<h4><FaTint style={{ marginRight: "8px" }} /> Select Required Blood Groups</h4>'],
  ['<span className="bloodGroupIcon">🩸</span>', '<span className="bloodGroupIcon"><FaTint /></span>'],
  ['<span className="tabBloodDrop">🩸 ', '<span className="tabBloodDrop"><FaTint style={{ marginRight: "6px" }} /> '],
  ['<div className="adminIcon">🛡️</div>', '<div className="adminIcon"><FiShield /></div>'],
];

for (const [search, replace] of replacements) {
  content = content.split(search).join(replace);
}

fs.writeFileSync('AdminDashboard.jsx', content);
