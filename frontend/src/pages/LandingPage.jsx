import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./LandingPage.css";

function LandingPage({ setPage }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [signupRegisterNumber, setSignupRegisterNumber] = useState("");
  const [signupMobile, setSignupMobile] = useState("");
  const [loginRegisterNumber, setLoginRegisterNumber] = useState("");
  const [loginMobile, setLoginMobile] = useState("");
  
  const [activeRequests, setActiveRequests] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [targetRequestId, setTargetRequestId] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const donor = localStorage.getItem("loggedInDonor");
    if (donor) {
      setIsLoggedIn(true);
    }
    fetchActiveRequests();
  }, []);

  useEffect(() => {
    if (activeRequests.length > 1) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % activeRequests.length);
      }, 4000);
      return () => clearInterval(timer);
    }
  }, [activeRequests]);

  const fetchActiveRequests = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/emergency-request/active`);
      if (res.ok) {
        const data = await res.json();
        setActiveRequests(data);
      }
    } catch (err) {
      console.log("Failed to fetch active requests", err);
    }
  };

  const checkSignup = async () => {
    if (!signupRegisterNumber || !signupMobile) return alert("Enter both fields");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/donors`);
      const donors = await res.json();
      const exists = donors.find((d) => d.registerNumber === signupRegisterNumber || d.facultyId === signupRegisterNumber);
      if (exists) {
        alert("You are already registered. Please login.");
        return;
      }
      setShowSignup(false);
      setPage("chooseRole");
    } catch (err) {
      console.error(err);
    }
  };

  const loginDonor = async () => {
    if (!loginRegisterNumber || !loginMobile) return alert("Enter both fields");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/donor/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registerNumber: loginRegisterNumber, mobile: loginMobile })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem("loggedInDonor", JSON.stringify(data.donor));
        setIsLoggedIn(true);
        setShowLogin(false);
        if (targetRequestId) {
          navigate(`/request/${targetRequestId}`);
        } else {
          setPage("myProfile");
        }
      } else {
        alert("Invalid credentials");
      }
    } catch (err) {
      console.error(err);
      alert("Login failed due to server error");
    }
  };

  const handleRequestClick = (reqId) => {
    if (isLoggedIn) {
      navigate(`/request/${reqId}`);
    } else {
      setTargetRequestId(reqId);
      setShowLogin(true);
    }
  };

  const scrollToSection = (id) => {
    setMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="landingPageWrapper">
      {/* HAMBURGER MENU */}
      <div className="menuIcon" onClick={() => setMenuOpen(!menuOpen)}>
        <div className={`bar ${menuOpen ? "open1" : ""}`}></div>
        <div className={`bar ${menuOpen ? "open2" : ""}`}></div>
        <div className={`bar ${menuOpen ? "open3" : ""}`}></div>
      </div>

      {menuOpen && (
        <div className="dropdownMenu">
          <button onClick={() => { setMenuOpen(false); window.scrollTo(0,0); }}>🏠 Home</button>
          <button onClick={() => scrollToSection("features")}>⭐ Features</button>
          <button onClick={() => scrollToSection("statistics")}>📊 Statistics</button>
          <button onClick={() => scrollToSection("about")}>ℹ About</button>
          <hr />
          <button className="adminBtn" onClick={() => setPage("admin")}>🔒 Admin Login</button>
        </div>
      )}

      {/* HERO SECTION */}
      <section className="heroSection">
        <div className="heroContent">
          <div className="heroText">
            <div className="logo">🩸 BloodBridge</div>
            <h1>Donate Blood.<br/><span className="highlight">Save Lives.</span></h1>
            <p className="heroSubtitle">
              Connecting student and faculty blood donors with people in emergency situations. 
              Every donation can save up to 3 lives. Be the hero someone is praying for.
            </p>
            
            <div className="heroActions">
              {!isLoggedIn ? (
                <>
                  <button className="primaryHeroBtn" onClick={() => setShowSignup(true)}>Sign Up</button>
                  <button className="secondaryHeroBtn" onClick={() => setShowLogin(true)}>Login</button>
                </>
              ) : (
                <>
                  <button className="primaryHeroBtn" onClick={() => setPage("myProfile")}>Visit My Profile</button>
                  <button className="secondaryHeroBtn" onClick={() => {
                    localStorage.removeItem("loggedInDonor");
                    setIsLoggedIn(false);
                  }}>Logout</button>
                </>
              )}
            </div>
          </div>
          <div className="heroImage">
            <img src="/app_logo.png" alt="BloodBridge Logo" className="appLogoHero" />
          </div>
        </div>
      </section>

      {/* FLOATING ACTIVE REQUESTS */}
      {activeRequests.length > 0 && (
        <div className="activeRequestsTicker">
          <div className="tickerLabel">🚨 LIVE EMERGENCIES</div>
          <div className="tickerSlider">
            {activeRequests.map((req, index) => (
              <div 
                key={req._id} 
                className={`tickerCard ${index === currentSlide ? "active" : ""}`}
                onClick={() => handleRequestClick(req._id)}
              >
                <div className="tickerContent">
                  <strong>URGENT: {req.bloodGroup}</strong> needed at {req.hospital}
                  <span className="tickerAction">Click to Respond →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FEATURES SECTION */}
      <section id="features" className="featuresSection">
        <h2 className="sectionTitle">Why BloodBridge?</h2>
        <div className="featuresGrid">
          <div className="featureItem">
            <div className="featureIcon">⚡</div>
            <h3>Fast Search</h3>
            <p>Find available donors within seconds using our optimized algorithm.</p>
          </div>
          <div className="featureItem">
            <div className="featureIcon">❤️</div>
            <h3>Emergency Support</h3>
            <p>Instantly broadcast requests to eligible donors in the network.</p>
          </div>
          <div className="featureItem">
            <div className="featureIcon">🏥</div>
            <h3>College Network</h3>
            <p>Students and faculty united for a noble cause to support local hospitals.</p>
          </div>
          <div className="featureItem">
            <div className="featureIcon">🔒</div>
            <h3>Secure Profiles</h3>
            <p>Your data is protected. Only authorized admins can request blood.</p>
          </div>
          <div className="featureItem">
            <div className="featureIcon">📊</div>
            <h3>Live Tracking</h3>
            <p>Monitor emergency request responses in real-time from the dashboard.</p>
          </div>
          <div className="featureItem">
            <div className="featureIcon">🏆</div>
            <h3>Donor Recognition</h3>
            <p>Top donors are recognized for their life-saving contributions.</p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section id="howitworks" className="worksSection">
        <h2 className="sectionTitle">How BloodBridge Works</h2>
        <div className="worksSteps">
          <div className="step">
            <div className="stepNum">1</div>
            <h3>Sign Up</h3>
            <p>Register as a student or faculty using your ID and basic details.</p>
          </div>
          <div className="stepLine"></div>
          <div className="step">
            <div className="stepNum">2</div>
            <h3>Get Notified</h3>
            <p>Receive alerts when there is an emergency matching your blood group.</p>
          </div>
          <div className="stepLine"></div>
          <div className="step">
            <div className="stepNum">3</div>
            <h3>Save a Life</h3>
            <p>Respond to the request and donate blood at the designated hospital.</p>
          </div>
        </div>
      </section>

      {/* STATISTICS SECTION */}
      <section id="statistics" className="statsSection">
        <div className="statsContainer">
          <div className="statBox">
            <h2>3,500+</h2>
            <p>Lives Impacted</p>
          </div>
          <div className="statBox">
            <h2>800+</h2>
            <p>Successful Requests</p>
          </div>
          <div className="statBox">
            <h2>20+</h2>
            <p>Partner Hospitals</p>
          </div>
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section id="about" className="aboutSection">
        <div className="aboutContent">
          <h2 className="sectionTitle">About Us</h2>
          <p>
            BloodBridge was founded with a simple yet powerful mission: to eliminate the gap between blood donors and those in desperate need. By leveraging the strong community within educational institutions, we've created a rapid-response network that operates faster than traditional blood banks.
          </p>
          <p>
            Every second counts in an emergency. Join our mission today.
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footerLogo">🩸 BloodBridge</div>
        <p>© 2026 BloodBridge Initiative. All rights reserved.</p>
      </footer>

      {/* POPUPS */}
      {showSignup && (
        <div className="authOverlay">
          <div className="authBox">
            <h2>Create Account</h2>
            <p>Join the lifesaver network</p>
            <input placeholder="Register Number / Faculty ID" value={signupRegisterNumber} onChange={(e) => setSignupRegisterNumber(e.target.value)} />
            <input placeholder="Mobile Number" type="password" value={signupMobile} onChange={(e) => setSignupMobile(e.target.value)} />
            <button className="authPrimaryBtn" onClick={checkSignup}>Continue →</button>
            <button className="authSecondaryBtn" onClick={() => { setShowSignup(false); setShowLogin(true); }}>Already Registered? Login</button>
            <button className="authCloseBtn" onClick={() => setShowSignup(false)}>✕</button>
          </div>
        </div>
      )}

      {showLogin && (
        <div className="authOverlay">
          <div className="authBox">
            <h2>Donor Login</h2>
            <p>{targetRequestId ? "Login to respond to this emergency" : "Welcome back, lifesaver"}</p>
            <input placeholder="Register Number / Faculty ID" value={loginRegisterNumber} onChange={(e) => setLoginRegisterNumber(e.target.value)} />
            <input placeholder="Mobile Number" type="password" value={loginMobile} onChange={(e) => setLoginMobile(e.target.value)} />
            <button className="authPrimaryBtn" onClick={loginDonor}>Login</button>
            <button className="authSecondaryBtn" onClick={() => { setShowLogin(false); setShowSignup(true); }}>Create Account</button>
            <button className="authCloseBtn" onClick={() => { setShowLogin(false); setTargetRequestId(null); }}>✕</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default LandingPage;