import "./LandingPage.css";

function LandingPage({ setPage }) {
  return (
    <div className="landing">

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
              onClick={() => setPage("chooseRole")}
            >
              Become a Donor
            </button>

            <button
              className="secondaryBtn"
              onClick={() => setPage("admin")}
            >
              Admin Login
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

export default LandingPage;