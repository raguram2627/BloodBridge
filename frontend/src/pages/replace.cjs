const fs = require('fs');

const content = fs.readFileSync('c:/Users/ragur/BloodBridge/frontend/src/pages/AdminDashboard.jsx', 'utf8');

const startStr = '<div className="dashboardLayout">';
const endStr = '{viewMode === "history" ? (';

const startIndex = content.indexOf(startStr);
const endIndex = content.indexOf(endStr);

if (startIndex === -1 || endIndex === -1) {
  console.log("Could not find boundaries");
  process.exit(1);
}

// Extract Emergency Form Block
const emMatch = content.match(/<div className="controlBlock emergencySection">([\s\S]*?)<\/div>\s*<\/div>\s*<div className="dataStreamPanel">/);
if (!emMatch) {
  console.log("Could not find emergency section");
  process.exit(1);
}
const emergencyForm = emMatch[1];


const newLayout = `      <div className="unifiedDashboardLayout">
        
        {/* 1. DISTINCT TABS */}
        <div className="dashboardTabsRow">
          <button className={\`panelBtn \${viewMode === "all" ? "active" : ""}\`} onClick={() => setViewMode("all")}><FiClipboard style={{ marginRight: "8px" }} /> View All Donors</button>
          <button className={\`panelBtn \${viewMode === "student" ? "active" : ""}\`} onClick={() => setViewMode("student")}><FaGraduationCap style={{ marginRight: "8px" }} /> Filter Students</button>
          <button className={\`panelBtn \${viewMode === "faculty" ? "active" : ""}\`} onClick={() => setViewMode("faculty")}><FaChalkboardTeacher style={{ marginRight: "8px" }} /> Filter Faculty</button>
          <button className={\`panelBtn \${viewMode === "frequent" ? "active" : ""}\`} onClick={() => setViewMode("frequent")}><FiAward style={{ marginRight: "8px" }} /> Frequent Donors</button>
          <button className={\`panelBtn \${viewMode === "history" ? "active" : ""}\`} onClick={() => setViewMode("history")}><FiClock style={{ marginRight: "8px" }} /> Donation History Log</button>
        </div>

        {/* 2. UNIFIED SEARCH & FILTER BAR */}
        {viewMode !== "history" && viewMode !== "emergency_console" && (
          <div className="unifiedFilterBar">
            <input type="text" placeholder="Search by Name..." value={searchName} onChange={(e) => setSearchName(e.target.value)} className="dashboardInput textInputBold filterInput" />
            <input type="text" placeholder="Search by Reg No..." value={searchRegNo} onChange={(e) => setSearchRegNo(e.target.value)} className="dashboardInput textInputBold filterInput" />
            
            <select value={selectedBloodGroup} onChange={(e) => setSelectedBloodGroup(e.target.value)} className="dashboardInput textInputBold filterSelect">
              <option value="">Blood Group</option>
              <option value="A+">A+</option><option value="A-">A-</option>
              <option value="B+">B+</option><option value="B-">B-</option>
              <option value="AB+">AB+</option><option value="AB-">AB-</option>
              <option value="O+">O+</option><option value="O-">O-</option>
            </select>
            
            <select value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)} className="dashboardInput textInputBold filterSelect">
              <option value="">Department</option>
              <option value="CSE">CSE</option><option value="IT">IT</option>
              <option value="ECE">ECE</option><option value="EEE">EEE</option>
              <option value="MECH">MECH</option><option value="CIVIL">CIVIL</option>
            </select>
            
            <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="dashboardInput textInputBold filterSelect">
              <option value="">Year</option>
              <option value="I">I Year</option><option value="II">II Year</option>
              <option value="III">III Year</option><option value="IV">IV Year</option>
            </select>
            
            <select value={selectedUserType} onChange={(e) => setSelectedUserType(e.target.value)} className="dashboardInput textInputBold filterSelect">
              <option value="">Role</option>
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
            </select>

            <button className="panelBtn filterResetBtn" onClick={() => { setSearchName(""); setSearchRegNo(""); setSelectedBloodGroup(""); setSelectedDepartment(""); setSelectedYear(""); setSelectedUserType(""); }}>
               Reset
            </button>
          </div>
        )}

        {/* 3. TWO-COLUMN MAIN LAYOUT */}
        <div className="dashboardMainColumns">
          
          {/* LEFT COLUMN: Emergency Panel */}
          <div className="dashboardLeftCol">
            <div className="controlBlock emergencySection stickyPanel">
              ${emergencyForm}
            </div>
          </div>

          {/* RIGHT COLUMN: Main Content */}
          <div className="dashboardRightCol dataStreamPanel">
            
            {viewMode === "history" ? (`;

const newContent = content.substring(0, startIndex) + newLayout + content.substring(endIndex + endStr.length);
fs.writeFileSync('c:/Users/ragur/BloodBridge/frontend/src/pages/AdminDashboard.jsx', newContent);
console.log("Success");
