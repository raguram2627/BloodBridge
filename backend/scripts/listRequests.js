require('dotenv').config();
const mongoose = require('mongoose');
const EmergencyRequest = require('../models/EmergencyRequest');

async function main(){
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const requests = await EmergencyRequest.find().lean();
    console.log(JSON.stringify(requests, null, 2));
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

main();
