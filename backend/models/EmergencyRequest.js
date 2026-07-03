const mongoose = require("mongoose");

const emergencyRequestSchema =
  new mongoose.Schema({
    bloodGroup: {
      type: String,
      required: true,
    },

    hospital: {
      type: String,
      required: true,
    },

    unitsNeeded: {
      type: Number,
      required: true,
    },

    adminPhone: {
      type: String,
      required: true,
    },

    willingDonors: [
  {
    donorName: String,
    mobile: String,
    department: String,
    year: String,
    registerNumber: String,
    bloodGroup: String,
    respondedAt: {
      type: Date,
      default: Date.now,
    },
  },
],

unavailableDonors: [
  {
    donorName: String,
    mobile: String,
    department: String,
    year: String,
    registerNumber: String,
    bloodGroup: String,
    respondedAt: {
      type: Date,
      default: Date.now,
    },
  },
],

    status: {
      type: String,
      default: "ACTIVE",
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  });

module.exports = mongoose.model(
  "EmergencyRequest",
  emergencyRequestSchema
);