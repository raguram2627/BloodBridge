const tgModule = require('node-telegram-bot-api');
const TelegramBot = tgModule.default || tgModule;
const Donor = require('./models/Donor');

function initTelegramBot() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  
  if (!token) {
    console.log("⚠️ TELEGRAM_BOT_TOKEN is not defined in .env, Telegram bot will not start.");
    return;
  }

  const bot = new TelegramBot(token, { polling: true });

  bot.on('polling_error', (error) => {
    console.error("Telegram Polling Error:", error.message);
  });

  console.log("🤖 Telegram Bot Service Started successfully.");

  // Listen for the /start command which includes the register number
  // Format: /start 211724040001
  bot.onText(/^\/start (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const registerNumber = match[1];

    try {
      // Find the donor
      const donor = await Donor.findOne({ registerNumber });

      if (donor) {
        // Save telegram details
        donor.telegramChatId = chatId.toString();
        donor.telegramConnected = true;
        await donor.save();

        // Send confirmation message
        bot.sendMessage(chatId, "🩸 BloodBridge\n\nYour Telegram account has been successfully connected.\n\nYou will now receive emergency blood donation alerts.");
      } else {
        // Donor not found
        bot.sendMessage(chatId, "BloodBridge account not found.");
      }
    } catch (error) {
      console.error("Error linking Telegram account:", error);
      bot.sendMessage(chatId, "An error occurred while connecting your account. Please try again later.");
    }
  });

  // Handle standard /start without a parameter just in case
  bot.onText(/^\/start$/, (msg) => {
    bot.sendMessage(msg.chat.id, "Welcome to BloodBridge! To connect your account, please click the 'Connect Telegram' button from your profile page on the BloodBridge platform.");
  });

  return bot;
}

module.exports = { initTelegramBot };
