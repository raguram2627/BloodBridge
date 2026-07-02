const mongoose = require("mongoose");

const donorSchema = new mongoose.Schema({
    role: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    bloodGroup: {
        type: String,
        required: true
    },
    department: {
        type: String,
        required: true
    },
    year: {
        type: String
    },
    registerNumber: {
        type: String,
        unique: true,
        sparse: true // Allows multiple null/missing values
    },
    facultyId: {
        type: String,
        unique: true,
        sparse: true // Allows multiple null/missing values
    },
    mobile: {
        type: String,
        required: true,
        unique: true // Prevents duplicate phone numbers
    },
    email: {
        type: String,
        required: true,
        unique: true // Prevents duplicate emails
    },
    weight: {
        type: Number
    },
    address: {
        type: String
    },
    residenceType: {
        type: String
    },
    hasDonatedBefore: {
        type: Boolean,
        default: false
    },
    lastDonationDate: {
        type: Date
    },
    available: {
        type: Boolean,
        default: true
    },
    donationHistory: [
        {
            date: Date,
            hospital: String
        }
    ]
}, { timestamps: true });

module.exports = mongoose.model("Donor", donorSchema);