import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiHeart, FiPhone } from "react-icons/fi";
import { FaChalkboardTeacher } from "react-icons/fa";
import { MdBloodtype } from "react-icons/md";
import "./FacultyRegisterPage.css";

function FacultyRegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [email, setEmail] = useState("");
  const [facultyId, setFacultyId] = useState("");
  const [weight, setWeight] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [department, setDepartment] = useState("");
  const [mobile, setMobile] = useState("");
  const [address, setAddress] = useState("");
  const [hasDonatedBefore, setHasDonatedBefore] = useState(false);
  const [lastDonationDate, setLastDonationDate] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const resetForm = () => {
    setName("");
    setAge("");
    setEmail("");
    setFacultyId("");
    setWeight("");
    setBloodGroup("");
    setDepartment("");
    setMobile("");
    setAddress("");
    setHasDonatedBefore(false);
    setLastDonationDate("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !name ||
      !age ||
      !email ||
      !facultyId ||
      !weight ||
      !bloodGroup ||
      !department ||
      !mobile ||
      !address
    ) {
      alert("Please fill all fields");
      return;
    }

    const donorData = {
      role: "faculty",
      name,
      age,
      email,
      facultyId,
      weight,
      bloodGroup,
      department,
      mobile,
      address,
      hasDonatedBefore,
      lastDonationDate:
        hasDonatedBefore && lastDonationDate
          ? lastDonationDate
          : null,
    };

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(donorData),
      });

      // Handle duplicate entries explicitly
      if (response.status === 409) {
        alert("Registration failed: This Email, Mobile, or Faculty ID is already in use.");
        return;
      }

      if (!response.ok) {
        throw new Error("Registration failed");
      }

      const responseData = await response.json();
      localStorage.setItem("loggedInDonor", JSON.stringify(responseData.donor));

      resetForm();
      setShowSuccess(true);
    } catch (error) {
      console.log(error);
      alert("Registration Failed: Please check your internet connection or try again later.");
    }
  };

  return (
    <div className="registerPage">
      {showSuccess && (
        <div className="successOverlay" onClick={() => setShowSuccess(false)}>
          <div className="successCard" onClick={(e) => e.stopPropagation()}>
            <div className="successIconRing">
              <span className="successIcon"><FiHeart color="#b00020" size={32} /></span>
            </div>
            <h2 className="successTitle">Thank You for Joining Us!</h2>
            <p className="successSlogan">
              Welcome to BloodBridge — where faculty leaders inspire a culture of life-saving generosity.
            </p>
            <p className="successSubtext" style={{ color: "#0088cc", fontWeight: "600", marginTop: "15px" }}>
              Action Required: You must connect your Telegram account to receive emergency alerts.
            </p>
            <button className="successBtn" style={{ background: "#0088cc", marginTop: "15px" }} onClick={() => {
              const donor = JSON.parse(localStorage.getItem("loggedInDonor"));
              window.location.href = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/connect-telegram/${donor.facultyId}`;
            }}>
              Connect Telegram Now
            </button>
            <button className="successBtn" style={{ background: "transparent", color: "#666", marginTop: "10px", padding: "5px" }} onClick={() => {
              setShowSuccess(false);
              navigate("/profile");
            }}>
              Skip for now
            </button>
          </div>
        </div>
      )}

      <div className="registerCard">
        <h1 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}><FiHeart color="#b00020" /> Become a Faculty Donor</h1>
        <p className="subtitle">
          Join the BloodBridge network to guide and support our emergency community.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="section">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FaChalkboardTeacher /> Profile Information</h3>
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <input
              type="number"
              placeholder="Age"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              required
            />

            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <input
              type="text"
              placeholder="Faculty ID"
              value={facultyId}
              onChange={(e) => setFacultyId(e.target.value)}
              required
            />

            <input
              type="number"
              placeholder="Weight (kg)"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              required
            />

            <select
              name="bloodGroup"
              value={bloodGroup}
              onChange={(e) => setBloodGroup(e.target.value)}
              required
            >
              <option value="">Select Blood Group</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
            </select>

            <select
              name="department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              required
            >
              <option value="">Select Department</option>
              <option value="CSE">CSE</option>
              <option value="IT">IT</option>
              <option value="ECE">ECE</option>
              <option value="EEE">EEE</option>
              <option value="MECH">MECH</option>
              <option value="CIVIL">CIVIL</option>
              <option value="AI&DS">AI&DS</option>
              <option value="MBA">MBA</option>
            </select>
          </div>

          <div className="section">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FiPhone /> Contact Details</h3>
            <input
              type="text"
              placeholder="Mobile Number"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              required
            />

            <textarea
              placeholder="Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>

          <div className="section">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MdBloodtype /> Donation History</h3>
            <label className="fieldLabel">Have you donated blood before?</label>
            <select
              value={hasDonatedBefore ? "Yes" : "No"}
              onChange={(e) => setHasDonatedBefore(e.target.value === "Yes")}
            >
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </select>

            {hasDonatedBefore && (
              <div className="datePickerContainer">
                <label className="fieldLabel">Last Donation Date</label>
                <input
                  type="date"
                  value={lastDonationDate}
                  onChange={(e) => setLastDonationDate(e.target.value)}
                />
              </div>
            )}
          </div>

          <button type="submit" className="submitBtn">
            Register Faculty Member →
          </button>
        </form>
      </div>
    </div>
  );
}

export default FacultyRegisterPage;
