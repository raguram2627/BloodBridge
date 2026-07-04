import { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import ChooseRolePage from "./pages/ChooseRolePage";
import RegisterPage from "./pages/RegisterPage";
import FacultyRegisterPage from "./pages/FacultyRegisterPage";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import EmergencyRequestPage from "./pages/EmergencyRequestPage";
import MyProfilePage from "./pages/MyProfilePage";

function App() {
  const [page, setPage] = useState("landing");

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            page === "landing" ? (
              <LandingPage setPage={setPage} />
            ) : page === "chooseRole" ? (
              <ChooseRolePage setPage={setPage} />
            ) : page === "studentRegister" ? (
              <RegisterPage setPage={setPage} />
            ) : page === "facultyRegister" ? (
              <FacultyRegisterPage setPage={setPage} />
            ) : page === "admin" ? (
              <AdminLogin setPage={setPage} />
            ) : page === "dashboard" ? (
              <AdminDashboard />
            ) : page === "myProfile" ? (
              <MyProfilePage setPage={setPage} />
            ) : (
              <LandingPage setPage={setPage} />
            )
          }
        />
        <Route
          path="/request/:id"
          element={<EmergencyRequestPage />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;