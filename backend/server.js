const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
dns.setDefaultResultOrder('ipv4first');

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const Donor = require("./models/Donor");

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log("MongoDB connected successfully");
})
.catch((error) => {
    console.log("MongoDB connection error:", error);
});

app.get("/", (req, res) => {
    res.send("BloodBridge Backend Running");
});

app.post("/register", async (req, res) => {

    try {

        const donor = new Donor(req.body);

        await donor.save();

        res.json({
            message: "Donor registered successfully",
            donor: donor
        });

    } catch(error) {

        res.status(500).json({
            message: error.message
        });

    }

});

app.get("/donors", async (req, res) => {
    try {
        const donors = await Donor.find();

        res.json(donors);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

app.get("/donors/bloodgroup/:group", async (req, res) => {

    try {

        const donors = await Donor.find({
            bloodGroup: req.params.group
        });

        res.json(donors);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

});

app.get("/donors/role/:role", async (req, res) => {

    try {

        const donors = await Donor.find({
            role: req.params.role
        });

        res.json(donors);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

});

app.get("/donors/search", async (req, res) => {

    try {

        const query = {};

        if (req.query.bloodGroup) {
            query.bloodGroup = req.query.bloodGroup;
        }

        if (req.query.role) {
            query.role = req.query.role;
        }

        const donors = await Donor.find(query);

        res.json(donors);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

});

app.patch("/donors/:id/availability", async (req, res) => {

    try {

        const donor = await Donor.findByIdAndUpdate(
            req.params.id,
            {
                available: req.body.available
            },
            {
                new: true
            }
        );

        res.json({
            message: "Availability updated successfully",
            donor
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

});

app.patch("/donors/:id/donate", async (req, res) => {

    try {

        const donor = await Donor.findById(req.params.id);

        donor.donationHistory.push({
            date: new Date(),
            hospital: req.body.hospital
        });

        donor.lastDonationDate = new Date();

        donor.available = false;

        await donor.save();

        res.json({
            message: "Donation recorded successfully",
            donor
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

});

app.get("/donors/frequent", async (req, res) => {

    try {

        const donors = await Donor.find();

        const frequentDonors = donors.sort(
            (a, b) => b.donationHistory.length - a.donationHistory.length
        );

        res.json(frequentDonors);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

});

app.listen(5000, () => {
    console.log("Server running on port 5000");
});