const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
dns.setDefaultResultOrder('ipv4first');
const mongoose = require('mongoose');
require('dotenv').config();
const Donor = require('./models/Donor');
const EmergencyRequest = require('./models/EmergencyRequest');

const parseRequestBloodGroups = (bloodGroupField) => {
  if (!bloodGroupField || bloodGroupField === 'ALL') return null;
  return bloodGroupField.split(',').map((g) => g.trim()).filter(Boolean);
};

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const request = await EmergencyRequest.findOne().sort({ createdAt: -1 });
    const requestedGroups = parseRequestBloodGroups(request.bloodGroup);
    
    const donors = await Donor.find({ 
      available: true, 
      telegramConnected: true, 
      telegramChatId: { $exists: true, $ne: '' } 
    });

    console.log('MongoDB found:', donors.length, 'donors.');

    const matchingDonors = donors.filter(d => {
      if (requestedGroups && !requestedGroups.includes(d.bloodGroup)) {
        return false;
      }
      return true;
    });
    
    console.log('Matching Donors count:', matchingDonors.length);
    process.exit(0);
});
