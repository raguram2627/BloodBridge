const fs = require('fs');
let content = fs.readFileSync('AdminDashboard.jsx', 'utf8');

content = content.replace(
  '<h2>{viewMode === "frequent" ? "<FiAward style={{ marginRight: \\"8px\\" }} /> Frequent Donors" : "📋 Registered Donors List"}</h2>',
  '<h2>{viewMode === "frequent" ? <><FiAward style={{ marginRight: "8px" }} /> Frequent Donors</> : <><FiClipboard style={{ marginRight: "8px" }} /> Registered Donors List</>}</h2>'
);

content = content.replace(
  '<h2>{viewMode === "frequent" ? "<FiAward style={{ marginRight: \\"8px\\" }} /> Frequent Donors" : "<FiClipboard style={{ marginRight: \\"8px\\" }} /> Registered Donors List"}</h2>',
  '<h2>{viewMode === "frequent" ? <><FiAward style={{ marginRight: "8px" }} /> Frequent Donors</> : <><FiClipboard style={{ marginRight: "8px" }} /> Registered Donors List</>}</h2>'
);

fs.writeFileSync('AdminDashboard.jsx', content);
