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
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/choose-role" element={<ChooseRolePage />} />
        <Route path="/register-student" element={<RegisterPage />} />
        <Route path="/register-faculty" element={<FacultyRegisterPage />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/profile" element={<MyProfilePage />} />
        <Route path="/request/:id" element={<EmergencyRequestPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;