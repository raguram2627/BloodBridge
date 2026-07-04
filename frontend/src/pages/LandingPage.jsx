import { useState } from "react";
import "./LandingPage.css";

function LandingPage({ setPage }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [signupRegisterNumber, setSignupRegisterNumber] = useState("");
  const [signupMobile, setSignupMobile] = useState("");
  const [loginRegisterNumber, setLoginRegisterNumber] = useState("");
  const [loginMobile, setLoginMobile] = useState("");

  const checkSignup = async () => {
    const res = await fetch("http://localhost:5000/donors");
    const donors = await res.json();
    const exists = donors.find(
      (d) => d.registerNumber === signupRegisterNumber
    );
    if (exists) {
      alert("You are already registered. Please login.");
      return;
    }
    setShowSignup(false);
    setPage("chooseRole");
  };

  const loginDonor = async () => {
    const res = await fetch("http://localhost:5000/donors");
    const donors = await res.json();
    const donor = donors.find(
      (d) =>
        d.registerNumber === loginRegisterNumber && d.mobile === loginMobile
    );
    if (!donor) {
      alert("Invalid Register Number or Mobile Number");
      return;
    }
    localStorage.setItem("loggedInDonor", JSON.stringify(donor));
    alert("Login Successful");
    setShowLogin(false);
  };

  return (
    <div className="landing">

      {/* MENU */}

      <div className="menuIcon" onClick={() => setMenuOpen(!menuOpen)}>
        ☰
      </div>

      {menuOpen && (
        <div className="dropdownMenu">

          <button onClick={() => setMenuOpen(false)}>
            🏠 Home
          </button>

          <button onClick={() => setMenuOpen(false)}>
            ⭐ Features
          </button>

          <button onClick={() => setMenuOpen(false)}>
            📊 Statistics
          </button>

          <button onClick={() => setMenuOpen(false)}>
            ℹ About
          </button>

          <hr />

          <button
            className="adminBtn"
            onClick={() => setPage("admin")}
          >
            🔒 Admin Login
          </button>

        </div>
      )}

      <div className="overlay">

        <div className="hero">

          <div className="logo">
            🩸
          </div>

          <h1>BloodBridge</h1>

          <h2>
            Donate Blood.
            <br />
            Save Lives.
          </h2>

          <p className="subtitle">
            Connecting student and faculty blood donors
            with people in emergency situations.
            <br />
            Every donation can save up to <b>3 lives.</b>
          </p>

          <div className="features">

            <div className="featureCard">
              ⚡
              <h3>Fast Search</h3>
              <p>
                Find available donors within seconds.
              </p>
            </div>

            <div className="featureCard">
              ❤️
              <h3>Emergency Support</h3>
              <p>
                Instantly contact willing blood donors.
              </p>
            </div>

            <div className="featureCard">
              🏥
              <h3>College Network</h3>
              <p>
                Students and faculty united for a noble cause.
              </p>
            </div>

          </div>

          <div className="buttons">

            <button
              className="primaryBtn"
              onClick={() => setShowSignup(true)}
            >
              Sign Up
            </button>

            <button
              className="secondaryBtn"
              onClick={() => setShowLogin(true)}
            >
              Login
            </button>

          </div>

        </div>

      </div>

      {showSignup && (
        <div className="popupOverlay">
          <div className="popupBox">
            <h2>Create Account</h2>
            <input
              placeholder="Register Number"
              value={signupRegisterNumber}
              onChange={(e) => setSignupRegisterNumber(e.target.value)}
            />
            <input
              placeholder="Mobile Number"
              type="password"
              value={signupMobile}
              onChange={(e) => setSignupMobile(e.target.value)}
            />
            <button className="primaryBtn" onClick={checkSignup}>
              Continue
            </button>
            <button
              className="secondaryBtn"
              onClick={() => {
                setShowSignup(false);
                setShowLogin(true);
              }}
            >
              Already Registered? Login
            </button>
            <button className="closeBtn" onClick={() => setShowSignup(false)}>
              ✕
            </button>
          </div>
        </div>
      )}

      {showLogin && (
        <div className="popupOverlay">
          <div className="popupBox">
            <h2>Donor Login</h2>
            <input
              placeholder="Register Number"
              value={loginRegisterNumber}
              onChange={(e) => setLoginRegisterNumber(e.target.value)}
            />
            <input
              placeholder="Mobile Number"
              type="password"
              value={loginMobile}
              onChange={(e) => setLoginMobile(e.target.value)}
            />
            <button className="primaryBtn" onClick={loginDonor}>
              Login
            </button>
            <button
              className="secondaryBtn"
              onClick={() => {
                setShowLogin(false);
                setShowSignup(true);
              }}
            >
              Create Account
            </button>
            <button className="closeBtn" onClick={() => setShowLogin(false)}>
              ✕
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default LandingPage;