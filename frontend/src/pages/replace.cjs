const fs = require('fs');

let content = fs.readFileSync('AdminDashboard.jsx', 'utf-8');

if (!content.includes('FiUsers')) {
  content = content.replace('import { useState, useEffect } from "react";', 'import { useState, useEffect } from "react";\nimport { FiUsers, FiAward, FiActivity, FiFileText, FiShield, FiAlertCircle, FiDroplet, FiPhone, FiCheckCircle, FiXCircle, FiGrid, FiLock, FiX, FiRefreshCw, FiMessageCircle, FiTrendingUp, FiSearch, FiInfo } from "react-icons/fi";\nimport { FaGraduationCap, FaChalkboardTeacher } from "react-icons/fa";');
}

const emojiMap = {
  '>🩸<': '><FiDroplet className="dashboardIcon" /><',
  ' 🩸 ': ' <FiDroplet className="dashboardIcon" /> ',
  '🩸 ': '<FiDroplet className="dashboardIcon" /> ',
  '>🔄<': '><FiRefreshCw className="dashboardIcon" /><',
  '>⚠️<': '><FiAlertCircle className="dashboardIcon" /><',
  '>👥<': '><FiUsers className="dashboardIcon" /><',
  '>🎓<': '><FaGraduationCap className="dashboardIcon" /><',
  '>👨‍🏫<': '><FaChalkboardTeacher className="dashboardIcon" /><',
  '>🚨<': '><FiAlertCircle className="dashboardIcon" /><',
  '🚨 ': '<FiAlertCircle className="dashboardIcon" /> ',
  '>📋 ': '><FiGrid className="dashboardIcon" /> ',
  '>🏆 ': '><FiAward className="dashboardIcon" /> ',
  '>📜 ': '><FiFileText className="dashboardIcon" /> ',
  '>📢 ': '><FiActivity className="dashboardIcon" /> ',
  '>🔒 ': '><FiLock className="dashboardIcon" /> ',
  '>🧹 ': '><FiXCircle className="dashboardIcon" /> ',
  '>✅ ': '><FiCheckCircle className="dashboardIcon" /> ',
  '>❌ ': '><FiXCircle className="dashboardIcon" /> ',
  '>📞 ': '><FiPhone className="dashboardIcon" /> ',
  '>📱 ': '><FiMessageCircle className="dashboardIcon" /> ',
  '>📊 ': '><FiTrendingUp className="dashboardIcon" /> ',
  '>🛡️<': '><FiShield className="dashboardIcon" /><',
  '🛡️': '<FiShield className="dashboardIcon" />',
  '>🥇<': '><FiAward style={{color: "#FFD700"}} /><',
  '>🥈<': '><FiAward style={{color: "#C0C0C0"}} /><',
  '>🥉<': '><FiAward style={{color: "#CD7F32"}} /><',
  '["🥇", "🥈", "🥉"]': '[<FiAward style={{color: "#FFD700"}} />, <FiAward style={{color: "#C0C0C0"}} />, <FiAward style={{color: "#CD7F32"}} />]',
  '🔄 ': '<FiRefreshCw className="dashboardIcon" /> ',
  '⚠️ ': '<FiAlertCircle className="dashboardIcon" /> ',
  '✅ ': '<FiCheckCircle className="dashboardIcon" /> ',
  '❌ ': '<FiXCircle className="dashboardIcon" /> ',
  '📋 ': '<FiGrid className="dashboardIcon" /> ',
  '🎓 ': '<FaGraduationCap className="dashboardIcon" /> ',
  '👨‍🏫 ': '<FaChalkboardTeacher className="dashboardIcon" /> ',
  '🏆 ': '<FiAward className="dashboardIcon" /> ',
  '📜 ': '<FiFileText className="dashboardIcon" /> ',
  '📢 ': '<FiActivity className="dashboardIcon" /> ',
  '🔒 ': '<FiLock className="dashboardIcon" /> ',
  '🧹 ': '<FiXCircle className="dashboardIcon" /> ',
  '📞 ': '<FiPhone className="dashboardIcon" /> ',
  '📱 ': '<FiMessageCircle className="dashboardIcon" /> ',
  '📊 ': '<FiTrendingUp className="dashboardIcon" /> ',
  '✔️': '<FiCheckCircle className="dashboardIcon" />'
};

for (const [key, value] of Object.entries(emojiMap)) {
  content = content.split(key).join(value);
}

if (!content.includes('.dashboardIcon')) {
  content = content.replace('.dashboardHeader h1 {', '.dashboardIcon { display: inline-block; vertical-align: middle; margin-right: 6px; }\n        .dashboardHeader h1 {');
}

fs.writeFileSync('AdminDashboard.jsx', content, 'utf-8');
console.log("Done");
