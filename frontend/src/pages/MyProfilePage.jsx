import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./MyProfilePage.css";

function MyProfilePage() {
  const navigate = useNavigate();
  const [donor, setDonor] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    const storedDonor = localStorage.getItem("loggedInDonor");
    if (storedDonor) {
      const parsedDonor = JSON.parse(storedDonor);
      setDonor(parsedDonor);
      setFormData(parsedDonor);
    } else {
      navigate("/");
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/donors/${donor._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error("Failed to update profile");
      }

      const updatedData = await res.json();
      localStorage.setItem("loggedInDonor", JSON.stringify(updatedData.donor));
      setDonor(updatedData.donor);
      alert("Profile updated successfully!");
    } catch (err) {
      alert("Error updating profile. Please try again.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("loggedInDonor");
    navigate("/");
  };

  if (!donor) return <div>Loading...</div>;

  return (
    <div className="profilePage">
      <div className="profileContainer">
        <div className="profileHeader">
          <button className="backHomeBtn" onClick={() => navigate("/")}>← Home</button>
          <h1>My Profile</h1>
          <p>Update your details below to stay ready for emergencies</p>
          <button className="logoutBtn" onClick={handleLogout}>Logout</button>
        </div>

        <div className="profileContent">
          <form onSubmit={handleSave}>
            <h3 className="sectionTitle">Personal Details</h3>
            <div className="profileGrid">
              <div className="inputGroup">
                <label>Full Name</label>
                <input name="name" value={formData.name || ""} onChange={handleChange} required />
              </div>
              <div className="inputGroup">
                <label>Age</label>
                <input name="age" type="number" value={formData.age || ""} onChange={handleChange} required />
              </div>
              <div className="inputGroup">
                <label>Email Address</label>
                <input name="email" type="email" value={formData.email || ""} onChange={handleChange} required />
              </div>
              <div className="inputGroup">
                <label>Mobile Number</label>
                <input name="mobile" value={formData.mobile || ""} onChange={handleChange} required />
              </div>
              <div className="inputGroup">
                <label>Weight (kg)</label>
                <input name="weight" type="number" value={formData.weight || ""} onChange={handleChange} required />
              </div>
              <div className="inputGroup">
                <label>Blood Group</label>
                <input name="bloodGroup" value={formData.bloodGroup || ""} readOnly />
              </div>
            </div>

            <h3 className="sectionTitle">Academic & Address</h3>
            <div className="profileGrid">
              <div className="inputGroup">
                <label>Register Number / Faculty ID</label>
                <input name="registerNumber" value={formData.registerNumber || formData.facultyId || ""} readOnly />
              </div>
              <div className="inputGroup">
                <label>Department</label>
                <input name="department" value={formData.department || ""} onChange={handleChange} required />
              </div>
              <div className="inputGroup fullWidth">
                <label>Full Address</label>
                <textarea name="address" value={formData.address || ""} onChange={handleChange} required rows={3}></textarea>
              </div>
            </div>

            <h3 className="sectionTitle">Telegram Notifications</h3>
            <div className="profileGrid">
              {formData.telegramConnected === false || formData.telegramConnected === undefined ? (
                <div className="inputGroup fullWidth">
                  <p style={{ marginBottom: "10px", fontSize: "14px", color: "#666" }}>Connect your Telegram account to receive instant notifications for emergency broadcasts.</p>
                  <button 
                    type="button" 
                    className="saveBtn" 
                    style={{ background: "#0088cc", width: "auto" }}
                    onClick={() => {
                      window.location.href = `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/connect-telegram/${formData.registerNumber || formData.facultyId}`;
                    }}
                  >
                    Connect Telegram
                  </button>
                </div>
              ) : (
                <div className="inputGroup fullWidth">
                  <p style={{ fontSize: "14px", color: "green", fontWeight: "600" }}>✓ Telegram Connected</p>
                </div>
              )}
            </div>

            <div className="profileActions">
              <button type="submit" className="saveBtn">Save Changes</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default MyProfilePage;
