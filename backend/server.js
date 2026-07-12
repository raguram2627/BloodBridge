const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
dns.setDefaultResultOrder('ipv4first');

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const Donor = require("./models/Donor");
const EmergencyRequest =
  require("./models/EmergencyRequest");

const parseRequestBloodGroups = (bloodGroupField) => {
  if (!bloodGroupField || bloodGroupField === "ALL") return null;
  return bloodGroupField.split(",").map((g) => g.trim()).filter(Boolean);
};

const isDonorEligibleForEmergency = (donor, today) => {
  const ninetyDaysAgo = new Date(today);
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  ninetyDaysAgo.setHours(0, 0, 0, 0);

  if (donor.donationHistory?.some((entry) => new Date(entry.date) >= ninetyDaysAgo)) {
    return false;
  }

  if (donor.lastDonationDate && new Date(donor.lastDonationDate) >= ninetyDaysAgo) {
    return false;
  }

  return true;
};

const app = express();
const axios = require("axios");

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
        // Handle MongoDB duplicate key error
        if (error.code === 11000) {
            return res.status(409).json({
                message: "Registration failed: A donor with this Email, Mobile, or ID already exists."
            });
        }

        res.status(500).json({
            message: "An unexpected error occurred: " + error.message
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

        if (!donor) {
            return res.status(404).json({
                message: "Donor not found"
            });
        }

        const donationDate = req.body.date
            ? new Date(req.body.date)
            : new Date();

        donor.donationHistory.push({
            date: donationDate,
            hospital: req.body.hospital
        });

        donor.lastDonationDate = donationDate;

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

app.put("/donors/:id", async (req, res) => {
    try {
        const donor = await Donor.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true }
        );

        if (!donor) {
            return res.status(404).json({
                message: "Donor not found"
            });
        }

        res.json({
            message: "Profile updated successfully",
            donor
        });
    } catch (error) {
        // Handle MongoDB duplicate key error for edits
        if (error.code === 11000) {
            return res.status(409).json({
                message: "Update failed: A donor with this Email, Mobile, or ID already exists."
            });
        }
        res.status(500).json({
            message: error.message
        });
    }
});
app.get("/donors/frequent", async (req, res) => {
  try {
    const donors = await Donor.find();

    const frequentDonors = donors
      .filter(donor => donor.donationHistory.length > 0)
      .sort(
        (a, b) =>
          b.donationHistory.length - a.donationHistory.length
      );

    res.json(frequentDonors);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
});

app.post(
  "/emergency-request",
  async (req, res) => {
    console.log("Emergency request route hit!");
    console.log("Request body:", req.body);
    try {

      const request =
        new EmergencyRequest({
          bloodGroup:
            req.body.bloodGroup,
          hospital:
            req.body.hospital,
          unitsNeeded:
            req.body.unitsNeeded,
          adminPhone:
            req.body.adminPhone,
        });

      await request.save();
      console.log("Request saved successfully");

      const donors = await Donor.find();
      const today = new Date();
      const requestedGroups = parseRequestBloodGroups(req.body.bloodGroup);
      const matchingDonors = donors.filter((d) => {
        if (requestedGroups && !requestedGroups.includes(d.bloodGroup)) {
          return false;
        }
        return isDonorEligibleForEmergency(d, today);
      });

      console.log("Matching donors count:", matchingDonors.length);
      console.log("About to send response with matchingCount");

      const responseData = {
        message:
          "Emergency Request Created",

        request,

        matchingCount:
          matchingDonors.length,

        eligibleDonors:
          matchingDonors,
      };
      
      console.log("Response data:", JSON.stringify(responseData, null, 2));
      res.json(responseData);

    } catch (error) {

      console.error("ERROR in emergency-request:", error);
      res.status(500).json({
        message: error.message,
      });

    }
  }
);

app.get(
  "/emergency-request/active",
  async (req, res) => {
    try {
      const requests = await EmergencyRequest.find({
        status: "ACTIVE",
      }).sort({
        createdAt: -1,
      });
      res.json(requests);
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Failed to load active requests",
      });
    }
  }
);

app.get(
  "/emergency-request/:id",
  async (req, res) => {
    try {
      const request =
        await EmergencyRequest.findById(
          req.params.id
        );
      res.json(request);
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  }
);

app.get(
  "/emergency",
  async (req, res) => {
    try {
      const requests = await EmergencyRequest.find();
      res.json(requests);
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  }
);

app.get(
  "/emergency/:id",
  async (req, res) => {
    try {
      const request =
        await EmergencyRequest.findById(
          req.params.id
        );
      res.json(request);
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  }
);

app.patch(
  "/emergency-request/:id/willing",
  async (req, res) => {
    try {

      const request =
        await EmergencyRequest.findById(
          req.params.id
        );

      request.willingDonors.push({
        donorName:
          req.body.donorName,
        mobile:
          req.body.mobile,
        department:
          req.body.department,
        year:
          req.body.year,
        registerNumber:
          req.body.registerNumber,
        bloodGroup:
          req.body.bloodGroup,
      });

      await request.save();

      res.json({
        message:
          "Response Saved",
      });

    } catch (error) {

      res.status(500).json({
        message: error.message,
      });

    }
  }
);

app.patch(
  "/emergency-request/:id/unavailable",
  async (req, res) => {
    try {

      const request =
        await EmergencyRequest.findById(
          req.params.id
        );

      request.unavailableDonors.push({
        donorName:
          req.body.donorName,
        mobile:
          req.body.mobile,
        department:
          req.body.department,
        year:
          req.body.year,
        registerNumber:
          req.body.registerNumber,
        bloodGroup:
          req.body.bloodGroup,
      });

      await request.save();

      res.json({
        message:
          "Response Saved",
      });

    } catch (error) {

      res.status(500).json({
        message: error.message,
      });

    }
  }
);

app.patch(
  "/emergency-request/:id/close",
  async (req, res) => {
    try {
      const request = await EmergencyRequest.findById(req.params.id);

      if (!request) {
        return res.status(404).json({
          message: "Emergency request not found",
        });
      }

      request.status = "CLOSED";
      await request.save();

      res.json({
        message: "Request closed successfully",
        request,
      });
    } catch (error) {
      console.error("SERVER ERROR in close route:", error);
      if (error.name === "CastError") {
        return res.status(400).json({
          message: "Invalid emergency request id",
        });
      }
      res.status(500).json({
        message: error.message,
      });
    }
  }
);

app.patch(
  "/emergency-request/close-all",
  async (req, res) => {
    try {
      const result = await EmergencyRequest.updateMany(
        { status: "ACTIVE" },
        { $set: { status: "CLOSED" } }
      );

      res.json({
        message: "All active requests closed successfully",
        count: result.modifiedCount,
      });
    } catch (error) {
      console.error("SERVER ERROR in close-all route:", error);
      res.status(500).json({
        message: error.message,
      });
    }
  }
);

app.get(
  "/emergency-stats",
  async (req, res) => {
    try {
      const requests =
        await EmergencyRequest.find();
      const totalRequests =
        requests.length;
      const activeRequests =
        requests.filter(
          r => r.status === "ACTIVE"
        ).length;
      const closedRequests =
        requests.filter(
          r => r.status === "CLOSED"
        ).length;
      let willing = 0;
      let unavailable = 0;
      requests.forEach(r => {
        willing +=
          r.willingDonors?.length || 0;
        unavailable +=
          r.unavailableDonors?.length || 0;
      });
      res.json({
        totalRequests,
        activeRequests,
        closedRequests,
        willing,
        unavailable,
      });
    } catch (error) {
      res.status(500).json(error);
    }
  }
);

app.get(  "/emergency-request/:id/responses",  async (req, res) => {    try {      const request =        await EmergencyRequest.findById(          req.params.id        );      res.json({        willingDonors:          request.willingDonors,        unavailableDonors:          request.unavailableDonors,      });    } catch (error) {      res.status(500).json({        message: error.message,      });    }  });


app.post("/test-whatsapp", async (req, res) => {
  try {
    const { phone } = req.body;

    const response = await axios.post(
      `https://graph.facebook.com/v23.0/${process.env.PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to: phone,
        type: "text",
        text: {
          body:
            "🩸 BloodBridge Test\n\nCongratulations! Your WhatsApp integration is working successfully."
        }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );

    res.json(response.data);

  } catch (error) {
    console.log(
      error.response?.data || error.message
    );

    res.status(500).json(
      error.response?.data || {
        error: error.message
      }
    );
  }
});


// Import Telegram Bot Service
const { initTelegramBot } = require('./telegramService');


app.post("/donor/login", async (req, res) => {
  try {
    const { registerNumber, mobile } = req.body;

    const donor = await Donor.findOne({
      registerNumber,
      mobile,
    });

    if (!donor) {
      return res.status(401).json({
        success: false,
        message: "Invalid Register Number or Mobile Number",
      });
    }

    res.json({
      success: true,
      donor,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
});

app.get("/connect-telegram/:registerNumber", async (req, res) => {
  try {
    const donor = await Donor.findOne({ registerNumber: req.params.registerNumber });
    if (!donor) {
      return res.status(404).json({ message: "Donor not found" });
    }
    res.redirect(`https://t.me/Bloodbridgehq_bot?start=${req.params.registerNumber}`);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Initialize Telegram Bot Service
initTelegramBot();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});