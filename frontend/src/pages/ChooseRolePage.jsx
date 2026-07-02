import "./ChooseRolePage.css";

function ChooseRolePage({ setPage }) {
  return (
    <div className="chooseRolePage">
      <div className="roleContainer">

        <h1>❤️ Join BloodBridge</h1>

        <h2>Become a Blood Donor</h2>

        <p className="roleSubtitle">
          Select your role to register as a donor and
          become part of our emergency blood donation
          network.
        </p>

        <div className="roleCards">

          <div
            className="roleCard"
            onClick={() => setPage("studentRegister")}
          >
            <div className="roleIcon">
              🎓
            </div>

            <h3>Student Donor</h3>

            <p>
              Register using your college details and
              help save lives whenever emergencies occur.
            </p>

            <button className="roleButton">
              Register →
            </button>
          </div>

          <div
            className="roleCard"
            onClick={() => setPage("facultyRegister")}
          >
            <div className="roleIcon">
              👨‍🏫
            </div>

            <h3>Faculty Donor</h3>

            <p>
              Join the BloodBridge faculty network and
              support students and the community during
              urgent blood requirements.
            </p>

            <button className="roleButton">
              Register →
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}

export default ChooseRolePage;