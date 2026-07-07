import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./RegisterPage.css";

function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [email, setEmail] = useState("");
  const [weight, setWeight] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [department, setDepartment] = useState("");
  const [year, setYear] = useState("");
  const [registerNumber, setRegisterNumber] = useState("");
  const [mobile, setMobile] = useState("");
  const [address, setAddress] = useState("");
  const [residenceType, setResidenceType] = useState("");
  const [hasDonatedBefore, setHasDonatedBefore] = useState(false);
  const [lastDonationDate, setLastDonationDate] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const resetForm = () => {
    setName("");
    setAge("");
    setEmail("");
    setWeight("");
    setBloodGroup("");
    setDepartment("");
    setYear("");
    setRegisterNumber("");
    setMobile("");
    setAddress("");
    setResidenceType("");
    setHasDonatedBefore(false);
    setLastDonationDate("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !name ||
      !age ||
      !email ||
      !weight ||
      !bloodGroup ||
      !department ||
      !year ||
      !registerNumber ||
      !mobile ||
      !address ||
      !residenceType
    ) {
      alert("Please fill all fields");
      return;
    }

    const donorData = {
      role: "student",
      name,
      age,
      email,
      weight,
      bloodGroup,
      department,
      year,
      registerNumber,
      mobile,
      address,
      residenceType,
      hasDonatedBefore,
      lastDonationDate:
        hasDonatedBefore && lastDonationDate ? lastDonationDate : null,
    };

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(donorData),
      });

      // Handle duplicate entries explicitly
      if (response.status === 409) {
        alert("Registration failed: This Email, Mobile, or Register Number is already in use.");
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
  }
  return (
    <div className="registerPage">
      {showSuccess && (
        <div className="successOverlay" onClick={() => setShowSuccess(false)}>
          <div className="successCard" onClick={(e) => e.stopPropagation()}>
            <div className="successIconRing">
              <span className="successIcon">❤️</span>
            </div>
            <h2 className="successTitle">Thank You for Joining Us!</h2>
            <p className="successSlogan">
              You're now part of BloodBridge — a lifeline that connects heroes with those who need them most.
            </p>
            <p className="successSubtext">
              Your registration helps save lives during emergencies. Every drop counts.
            </p>
            <button className="successBtn" onClick={() => {
              setShowSuccess(false);
              navigate("/profile");
            }}>
              Continue →
            </button>
          </div>
        </div>
      )}

      <div className="registerCard">
        <h1>❤️ Become a Blood Donor</h1>
        <p className="subtitle">
          Join BloodBridge and help save lives during emergencies
        </p>

        <form onSubmit={handleSubmit}>
          <div className="section">
            <h3>👤 Personal Information</h3>

            <input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
            <input type="number" placeholder="Age" value={age} onChange={(e) => setAge(e.target.value)} required />
            <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input type="number" placeholder="Weight (kg)" value={weight} onChange={(e) => setWeight(e.target.value)} required />

            <select value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)} required>
              <option value="">Select Blood Group</option>
              <option>A+</option><option>A-</option>
              <option>B+</option><option>B-</option>
              <option>AB+</option><option>AB-</option>
              <option>O+</option><option>O-</option>
            </select>
          </div>

          <div className="section">
            <h3>🎓 Academic Details</h3>

            <select value={department} onChange={(e) => setDepartment(e.target.value)} required>
              <option value="">Select Department</option>
              <option>CSE</option>
              <option>IT</option>
              <option>ECE</option>
              <option>EEE</option>
              <option>MECH</option>
              <option>CIVIL</option>
            </select>

            <select value={year} onChange={(e) => setYear(e.target.value)} required>
              <option value="">Select Year</option>
              <option value="I">I Year</option>
              <option value="II">II Year</option>
              <option value="III">III Year</option>
              <option value="IV">IV Year</option>
            </select>

            <input
              type="text"
              placeholder="Register Number"
              value={registerNumber}
              onChange={(e) => setRegisterNumber(e.target.value)}
              required
            />
          </div>

          <div className="section">
            <h3>📞 Contact Details</h3>

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

            <select value={residenceType} onChange={(e) => setResidenceType(e.target.value)} required>
              <option value="">Select Residence Type</option>
              <option>Hosteller</option>
              <option>Day Scholar</option>
            </select>
          </div>

          <div className="section">
            <h3>🩸 Donation History</h3>

            <select
              value={hasDonatedBefore ? "Yes" : "No"}
              onChange={(e) =>
                setHasDonatedBefore(e.target.value === "Yes")
              }
            >
              <option value="No">No</option>
              <option value="Yes">Yes</option>
            </select>

            {hasDonatedBefore && (
              <input
                type="date"
                value={lastDonationDate}
                onChange={(e) => setLastDonationDate(e.target.value)}
              />
            )}
          </div>

          <button type="submit" className="submitBtn">
            Register Donor ❤️
          </button>
        </form>
      </div>
    </div>
  );
}

export default RegisterPage;
