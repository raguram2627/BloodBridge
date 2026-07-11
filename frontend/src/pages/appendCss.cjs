const fs = require('fs');

const cssAdditions = `
/* ==========================================================================
   NEW LAYOUT ARCHITECTURE (REFACTORED)
   ========================================================================== */

/* 1. DISTINCT TABS ROW */
.dashboardTabsRow {
  display: flex;
  gap: 15px;
  margin-bottom: 25px;
  flex-wrap: wrap;
}

.dashboardTabsRow .panelBtn {
  flex: 1;
  min-width: 180px;
  text-align: center;
  justify-content: center;
}

/* 2. UNIFIED SEARCH & FILTER BAR */
.unifiedFilterBar {
  display: flex;
  gap: 15px;
  background: white;
  padding: 20px;
  border-radius: 20px;
  border: 1px solid #f3dcdc;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.02);
  margin-bottom: 35px;
  flex-wrap: wrap;
  align-items: center;
}

.unifiedFilterBar .filterInput {
  flex: 2;
  min-width: 220px;
}

.unifiedFilterBar .filterSelect {
  flex: 1;
  min-width: 150px;
}

.unifiedFilterBar .filterResetBtn {
  flex: 0 0 auto;
  width: auto;
  padding: 12px 24px;
  background: #fdf2f2;
  color: #b00020;
  border-color: #fca9a9;
  border-radius: 12px;
}

.unifiedFilterBar .filterResetBtn:hover {
  background: #b00020;
  color: white;
}

/* 3. TWO COLUMN MAIN LAYOUT */
.dashboardMainColumns {
  display: flex;
  gap: 35px;
  align-items: flex-start;
}

.dashboardLeftCol {
  flex: 0 0 350px; /* Approximately 25-30% */
}

.dashboardRightCol {
  flex: 1;
  min-width: 0; /* Prevents flex blowout */
}

.stickyPanel {
  position: sticky;
  top: 20px;
  /* Maintains visual presence without disappearing */
}

/* 4. DONOR CARD REFINEMENTS */
.dataCard.donorCard {
  padding: 20px 25px !important;
  border-radius: 20px !important;
}

/* Make action buttons fully single line on desktop */
.cardActionRow {
  flex-wrap: nowrap !important;
  justify-content: flex-start !important;
}

.actionBtnLeftGroup, .actionBtnRightGroup {
  flex-wrap: nowrap !important;
}

.actionBtnRightGroup {
  margin-left: auto !important;
}

/* Responsiveness adjustments */
@media (max-width: 1100px) {
  .dashboardMainColumns {
    flex-direction: column;
  }
  
  .dashboardLeftCol, .dashboardRightCol {
    flex: 1 1 100%;
    width: 100%;
  }
  
  .stickyPanel {
    position: relative;
    top: 0;
  }
}

@media (max-width: 768px) {
  .cardActionRow {
    flex-wrap: wrap !important;
  }
  
  .actionBtnLeftGroup, .actionBtnRightGroup {
    flex-wrap: wrap !important;
  }
}
`;

fs.appendFileSync('c:/Users/ragur/BloodBridge/frontend/src/pages/AdminDashboard.css', cssAdditions);
console.log("Appended CSS successfully");
