import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminLogin.css";

function AdminLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (username === "admin" && password === "admin123") {
      navigate("/admin-dashboard");
    } else {
      alert("Invalid Credentials");
    }
  };

  return (
    <div className="loginPage">
      <div className="loginCard">
        <div className="loginHeader">
          <div className="adminIcon">🛡️</div>
          <h1>Admin Control Portal</h1>
          <p className="subtitle">Secure access terminal for BloodBridge management</p>
        </div>

        <div className="loginForm">
          <div className="inputGroup">
            <label className="inputLabel">Username</label>
            <input
              type="text"
              placeholder="Enter admin username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="inputGroup">
            <label className="inputLabel">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button className="loginBtn" onClick={handleLogin}>
            Sign In to Dashboard →
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;