const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
dns.setDefaultResultOrder('ipv4first');
require('dotenv').config();
const { initTelegramBot, sendTelegramMessage } = require('./telegramService');

async function test() {
  initTelegramBot();
  await new Promise(r => setTimeout(r, 1000));
  
  const messageText = `🩸 BLOODBRIDGE EMERGENCY ALERT\n\nBlood Required\n\nBlood Groups:\nO+\n\nHospital:\nTest Hospital\n\nUnits Needed:\n2\n\nPlease respond immediately.\n\n👇 Public Response Link\nhttp://localhost:5173/request/66928e1d2c2ecf045a133464`;
  
  try {
    const res = await sendTelegramMessage('7056917835', messageText);
    console.log('Message sent successfully!');
  } catch (err) {
    console.error('Error sending message:', err.message);
  }
  process.exit(0);
}

test();
