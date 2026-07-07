import { useState, useEffect } from "react";
import { FiUsers, FiAward, FiActivity, FiFileText, FiShield, FiAlertCircle, FiPhone, FiCheckCircle, FiXCircle, FiGrid, FiLock, FiX, FiRefreshCw, FiMessageCircle, FiTrendingUp, FiSearch, FiInfo } from "react-icons/fi";
import { FaGraduationCap, FaChalkboardTeacher } from "react-icons/fa";
import { MdBloodtype, MdOutlineSensors } from "react-icons/md";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const getPublicRequestLink = (requestId) => {
  const base = import.meta.env.VITE_PUBLIC_URL || window.location.origin;
  return `${base}/request/${requestId}`;
};

const parseRequestBloodGroups = (bloodGroupField) => {
  if (!bloodGroupField || bloodGroupField === "ALL") return "ALL";
  return bloodGroupField.split(",").map((g) => g.trim()).filter(Boolean);
};

const donorMatchesRequestBloodGroup = (donorBloodGroup, requestBloodGroup) => {
  const groups = parseRequestBloodGroups(requestBloodGroup);
  if (groups === "ALL") return true;
  return groups.includes(donorBloodGroup);
};

const isDonorUnavailableWithin90Days = (donor) => {
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  ninetyDaysAgo.setHours(0, 0, 0, 0);

  if (donor.donationHistory?.some((h) => new Date(h.date) >= ninetyDaysAgo)) {
    return true;
  }
  if (donor.lastDonationDate && new Date(donor.lastDonationDate) >= ninetyDaysAgo) {
    return true;
  }
  return false;
};

const computeDonorPools = (donorsList, requestBloodGroup) => {
  const targetedPool = donorsList.filter((d) =>
    donorMatchesRequestBloodGroup(d.bloodGroup, requestBloodGroup)
  );
  const available = [];
  const unavailable = [];
  targetedPool.forEach((donor) => {
    if (isDonorUnavailableWithin90Days(donor)) {
      unavailable.push(donor);
    } else {
      available.push(donor);
    }
  });
  return { available, unavailable };
};

const formatRequestBloodGroupLabel = (bloodGroup) => {
  if (!bloodGroup || bloodGroup === "ALL") return "ALL GROUPS";
  return bloodGroup;
};

const parseBloodGroupList = (bloodGroupField) => {
  if (!bloodGroupField || bloodGroupField === "ALL") {
    return ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
  }
  return bloodGroupField
    .split(",")
    .map((g) => g.trim())
    .filter(Boolean);
};

const groupResponseCounts = (responses = []) => {
  return responses.reduce((acc, item) => {
    const group = item?.bloodGroup || "UNKNOWN";
    acc[group] = (acc[group] || 0) + 1;
    return acc;
  }, {});
};

function AdminDashboard() {
  const [donors, setDonors] = useState([]);
  const [results, setResults] = useState([]);

  const [totalDonors, setTotalDonors] = useState(0);
  const [studentCount, setStudentCount] = useState(0);
  const [facultyCount, setFacultyCount] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [viewMode, setViewMode] = useState("all"); 

  const [selectedDonor, setSelectedDonor] = useState(null);
  const [detailsDonor, setDetailsDonor] = useState(null);

  const [donationDonor, setDonationDonor] = useState(null);
  const [hospital, setHospital] = useState("");
  const [donationDate, setDonationDate] = useState("");
  const [donationUnits, setDonationUnits] = useState("");

  const [showGlobalLogger, setShowGlobalLogger] = useState(false);
  const [manualRegNo, setManualRegNo] = useState("");
  const [manualDonorFound, setManualDonorFound] = useState(null);

  const [selectedYear, setSelectedYear] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedBloodGroup, setSelectedBloodGroup] = useState("");
  const [selectedUserType, setSelectedUserType] = useState("");
  
  const [searchName, setSearchName] = useState("");
  const [searchRegNo, setSearchRegNo] = useState("");

  const [requestBloodGroups, setRequestBloodGroups] = useState([]);
  const [allBloodGroupsSelected, setAllBloodGroupsSelected] = useState(false);
  const [requestHospital, setRequestHospital] = useState("");
  const [requestUnits, setRequestUnits] = useState("");
  const [requestPhone, setRequestPhone] = useState("");

  const [activeRequests, setActiveRequests] = useState([]);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [availabilityView, setAvailabilityView] = useState("available");
  const [responseView, setResponseView] = useState("willing");

  const [toast, setToast] = useState({ show: false, message: "", type: "info" });
  const [confirmDialog, setConfirmDialog] = useState({ show: false, title: "", message: "", onConfirm: null });

  const buttonMotionStyle = {
    transition: "all 0.2s ease",
    cursor: "pointer",
    outline: "none"
  };

  const MEDAL_EMOJIS = [<FiAward style={{color: "#FFD700"}} />, <FiAward style={{color: "#C0C0C0"}} />, <FiAward style={{color: "#CD7F32"}} />];

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "info" });
    }, 4500);
  };

  const triggerConfirm = (title, message, onConfirm) => {
    setConfirmDialog({
      show: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmDialog({ show: false, title: "", message: "", onConfirm: null });
      }
    });
  };

  const loadAll = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/donors`);
      const data = await res.json();
      setDonors(data);
      setTotalDonors(data.length);
      setStudentCount(data.filter((d) => d.role === "student").length);
      setFacultyCount(data.filter((d) => d.role === "faculty").length);
    } catch {
      setError("Failed to load metrics data");
      showToast("Critical: Failed to communicate with database.", "error");
    } finally {
      setLoading(false);
    }
  };

  const syncEmergencyRequests = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/emergency-request/active`);
      const data = await res.json();
      
      const mappedRequests = data.map((req) => {
        const { available, unavailable } = computeDonorPools(donors, req.bloodGroup);

        return {
          ...req,
          availableDonors: available,
          unavailableDonorsList: unavailable,
          isNotified: req.isNotified ?? true,
          showLiveTriage: req.showLiveTriage ?? false,
          link: getPublicRequestLink(req._id)
        };
      });

      setActiveRequests(mappedRequests);
      localStorage.setItem("bloodbridge_active_requests", JSON.stringify(mappedRequests));
      
      if (mappedRequests.length > 0 && !selectedRequestId) {
        setSelectedRequestId(mappedRequests[0]._id);
      }
    } catch (err) {
      const saved = localStorage.getItem("bloodbridge_active_requests");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          const updated = parsed.map(req => {
            const { available, unavailable } = computeDonorPools(donors, req.bloodGroup);
            return {
              ...req,
              availableDonors: available,
              unavailableDonorsList: unavailable,
              link: getPublicRequestLink(req._id)
            };
          });
          setActiveRequests(updated);
          if (updated.length > 0 && !selectedRequestId) {
            setSelectedRequestId(updated[0]._id);
          }
        } catch (e) {
          console.log("Local Storage fallback parsing failed", e);
        }
      }
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    if (donors.length > 0) {
      syncEmergencyRequests();
    }
  }, [donors]);

  useEffect(() => {
    if (!manualRegNo.trim()) {
      setManualDonorFound(null);
      return;
    }
    const match = donors.find(
      (d) => d.registerNumber?.toLowerCase() === manualRegNo.trim().toLowerCase()
    );
    setManualDonorFound(match || null);
  }, [manualRegNo, donors]);

  useEffect(() => {
    let basePool = [...donors];

    if (viewMode === "student") {
      basePool = basePool.filter((d) => d.role === "student");
    } else if (viewMode === "faculty") {
      basePool = basePool.filter((d) => d.role === "faculty");
    } else if (viewMode === "frequent") {
      basePool = basePool
        .map((d) => ({ ...d, donationCount: d.donationHistory?.length || 0 }))
        .filter((d) => d.donationCount > 0)
        .sort((a, b) => b.donationCount - a.donationCount);
    }

    const filtered = basePool.filter((d) => {
      const bloodMatch = !selectedBloodGroup || d.bloodGroup === selectedBloodGroup;
      const yearMatch = !selectedYear || d.year === selectedYear;
      const departmentMatch = !selectedDepartment || d.department === selectedDepartment;
      const userTypeMatch = !selectedUserType || d.role === selectedUserType;
      
      const nameMatch = !searchName || d.name?.toLowerCase().includes(searchName.toLowerCase());
      const regNoMatch = !searchRegNo || d.registerNumber?.toLowerCase().includes(searchRegNo.toLowerCase());

      return bloodMatch && yearMatch && departmentMatch && userTypeMatch && nameMatch && regNoMatch;
    });

    setResults(filtered);
  }, [donors, viewMode, selectedBloodGroup, selectedYear, selectedDepartment, selectedUserType, searchName, searchRegNo]);

  const updateActiveRequest = (id, fields) => {
    setActiveRequests(prev => {
      const updated = prev.map(r => r._id === id ? { ...r, ...fields } : r);
      localStorage.setItem("bloodbridge_active_requests", JSON.stringify(updated));
      return updated;
    });
  };

  const toggleBloodGroupSelection = (group) => {
    if (allBloodGroupsSelected) {
      setAllBloodGroupsSelected(false);
      setRequestBloodGroups([group]);
      return;
    }
    setRequestBloodGroups((prev) =>
      prev.includes(group) ? prev.filter((g) => g !== group) : [...prev, group]
    );
  };

  const toggleAllBloodGroupsSelection = () => {
    if (allBloodGroupsSelected) {
      setAllBloodGroupsSelected(false);
      setRequestBloodGroups([]);
    } else {
      setAllBloodGroupsSelected(true);
      setRequestBloodGroups([]);
    }
  };

  const createEmergencyRequest = async () => {
    const bloodGroupPayload = allBloodGroupsSelected ? "ALL" : requestBloodGroups.join(", ");

    if ((!allBloodGroupsSelected && requestBloodGroups.length === 0) || !requestHospital || !requestUnits || !requestPhone) {
      showToast("Please fill all dispatch parameters completely.", "error");
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/emergency-request`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bloodGroup: bloodGroupPayload,
          hospital: requestHospital,
          unitsNeeded: requestUnits,
          adminPhone: requestPhone,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to create emergency request");
      }

      const newReq = data.request || data;

      showToast(`Emergency alert successfully deployed for ${formatRequestBloodGroupLabel(bloodGroupPayload)}!`, "success");
      
      setRequestBloodGroups([]);
      setAllBloodGroupsSelected(false);
      setRequestUnits("");

      const { available: computedAvailable, unavailable: computedUnavailable } =
        computeDonorPools(donors, newReq.bloodGroup);

      const processedNewRequest = {
        ...newReq,
        availableDonors: computedAvailable,
        unavailableDonorsList: computedUnavailable,
        isNotified: false,
        showLiveTriage: false,
        willingDonors: [],
        unavailableDonors: [],
        link: getPublicRequestLink(newReq._id)
      };

      const updatedRequests = [...activeRequests, processedNewRequest];
      setActiveRequests(updatedRequests);
      localStorage.setItem("bloodbridge_active_requests", JSON.stringify(updatedRequests));
      
      setSelectedRequestId(newReq._id);
      setViewMode("emergency_console");
      loadAll();
    } catch (err) {
      console.error(err);
      showToast("Critical: Failed to register emergency dispatch channel.", "error");
    }
  };

  const currentRequest = activeRequests.find(r => r._id === selectedRequestId);

  const handleNotifyDonors = (id) => {
    updateActiveRequest(id, { isNotified: true });
    showToast("Dispatched active alert broadcasts to the matching donor pool!", "success");
  };

  const handleRefreshResponses = async () => {
    if (!selectedRequestId) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/emergency-request/${selectedRequestId}`);
      const data = await res.json();
      
      updateActiveRequest(selectedRequestId, {
        willingDonors: data.willingDonors || [],
        unavailableDonors: data.unavailableDonors || [],
        showLiveTriage: true
      });
      showToast("Synchronized response metrics successfully.", "success");
    } catch (error) {
      showToast("Failed to refresh response data.", "error");
    }
  };

  const handleCloseBroadcastChannel = (id) => {
    const requestId = id || selectedRequestId;

    if (!requestId) {
      showToast("No active request selected to close.", "error");
      return;
    }

    triggerConfirm(
      "Confirm Closing Thread", 
      "Are you sure you want to shut down this emergency dispatch line? Match stats and tracking entries for this blood type will be moved off the operational deck.",
      async () => {
        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL}/emergency-request/${requestId}/close`, { method: "PATCH" });
          if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.message || "Failed to close request");
          }

          showToast("Broadcast terminated and archived.", "success");
          
          const filtered = activeRequests.filter(r => r._id !== requestId);
          setActiveRequests(filtered);
          localStorage.setItem("bloodbridge_active_requests", JSON.stringify(filtered));

          setSelectedRequestId(filtered.length > 0 ? filtered[0]._id : null);
          setViewMode("all");
          loadAll();
        } catch (error) {
          showToast(error.message || "Failed to gracefully terminate broadcast route.", "error");
        }
      }
    );
  };

  const handleCloseAllActiveRequests = () => {
    if (!activeRequests.length) {
      showToast("There are no active requests to close.", "error");
      return;
    }

    triggerConfirm(
      "Close All Active Requests",
      "This will close every live emergency request currently shown in the dashboard.",
      async () => {
        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL}/emergency-request/close-all`, { method: "PATCH" });
          if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.message || "Failed to close all active requests");
          }
          const data = await response.json();

          setActiveRequests([]);
          setSelectedRequestId(null);
          setViewMode("all");
          localStorage.setItem("bloodbridge_active_requests", JSON.stringify([]));
          showToast(`${data.count || 0} active requests closed.`, "success");
          loadAll();
        } catch (error) {
          showToast(error.message || "Failed to close all active requests.", "error");
        }
      }
    );
  };

  const getHistory = () => {
    let history = [];
    donors.forEach((d) => {
      d.donationHistory?.forEach((h) => {
        history.push({ donor: d, date: h.date, hospital: h.hospital, units: h.units || "N/A" });
      });
    });
    return history.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  // Maps lightweight triage payloads safely to standard registered donor profiles
  const getDonorProfile = (name, mobile) => {
    const matched = donors.find(d => d.mobile === mobile || d.name?.toLowerCase() === name?.toLowerCase());
    if (matched) return matched;
    return {
      name: name || "Unknown Operational Response",
      age: "N/A",
      email: "N/A",
      weight: "N/A",
      mobile: mobile || "N/A",
      department: "Emergency Triage",
      role: "student",
      bloodGroup: currentRequest?.bloodGroup || "N/A",
      address: "Identified via active triage telemetry.",
      registerNumber: "N/A",
      facultyId: "N/A",
      year: "N/A",
      residenceType: "N/A",
      hasDonatedBefore: false,
      lastDonationDate: null,
      donationHistory: []
    };
  };

  const displayValue = (value, fallback = "N/A") => {
    if (value === null || value === undefined || value === "") return fallback;
    return value;
  };

  const recordDonation = async () => {
    if (!hospital || !donationDate || !donationUnits) {
      showToast("Donation parameters must be complete.", "error");
      return;
    }
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/donors/${donationDonor._id}/donate`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hospital, date: donationDate, units: donationUnits }),
      });
      showToast("Donation successfully recorded inside donor historical profile.", "success");
      setDonationDonor(null);
      setHospital(""); setDonationDate(""); setDonationUnits("");
      loadAll();
    } catch {
      showToast("Failed to complete donation entry.", "error");
    }
  };

  const recordGlobalManualDonation = async () => {
    if (!manualDonorFound || !hospital || !donationDate || !donationUnits) {
      showToast("Please fill all manual logs fields correctly.", "error");
      return;
    }
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/donors/${manualDonorFound._id}/donate`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hospital, date: donationDate, units: donationUnits }),
      });
      showToast("External record verified and written to Master Logbook.", "success");
      setShowGlobalLogger(false);
      setManualRegNo(""); setHospital(""); setDonationDate(""); setDonationUnits("");
      loadAll();
    } catch {
      showToast("System failure linking record details.", "error");
    }
  };

  return (
    <div className="dashboardContainer">
      {/* Injected Stylesheet to completely eliminate Esbuild resolution errors 
        resulting from standalone stdin bundle processing of local CSS files
      */}
      <style dangerouslySetInnerHTML={{ __html: `
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }

        body {
          background-color: #fcf8f8;
        }

        .dashboardContainer {
          padding: 40px;
          max-width: 1600px;
          margin: 0 auto;
          background: 
            radial-gradient(circle at top left, #ffe9ec 0%, transparent 25%),
            radial-gradient(circle at bottom right, #ffe5e8 0%, transparent 30%),
            linear-gradient(135deg, #fcf8f8, #ffffff, #fffcfc);
          min-height: 100vh;
        }

        .dashboardHeader {
          margin-bottom: 35px;
          border-bottom: 2px solid #f3dcdc;
          padding-bottom: 20px;
        }

        .dashboardIcon { display: inline-block; vertical-align: middle; margin-right: 6px; }
        .dashboardHeader h1 {
          color: #b00020;
          font-size: 38px;
          font-weight: 800;
          letter-spacing: -0.5px;
        }

        .dashboardSubtitle {
          color: #666;
          font-size: 16px;
          margin-top: 5px;
        }

        .loadingAlert {
          background: rgba(220, 20, 60, 0.05);
          border: 1px dashed #d62839;
          padding: 15px 20px;
          border-radius: 12px;
          color: #b00020;
          font-weight: 600;
          margin-bottom: 25px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .spinner {
          display: inline-block;
          animation: spin 2s linear infinite;
        }

        @keyframes spin {
          100% { transform: rotate(360deg); }
        }

        .errorAlert {
          background: #fdf2f2;
          border-left: 5px solid #d62839;
          padding: 15px 20px;
          border-radius: 8px;
          color: #b00020;
          font-weight: 600;
          margin-bottom: 25px;
        }

        .metricsGrid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 25px;
          margin-bottom: 40px;
        }

        .metricTile {
          background: white;
          padding: 25px;
          border-radius: 20px;
          border: 1px solid #f3dcdc;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.03);
          display: flex;
          align-items: center;
          gap: 20px;
          transition: transform 0.3s ease;
        }

        .metricTile:hover {
          transform: translateY(-4px);
        }

        .metricTile.critical {
          background: linear-gradient(135deg, #fff5f5, #ffebe3);
          border-color: #fbc2c2;
        }

        .tileIcon {
          font-size: 40px;
          background: #fff0f2;
          padding: 12px;
          border-radius: 16px;
          display: block;
        }

        .metricTile.critical .tileIcon {
          background: #ffe3e3;
        }

        .tileData h3 {
          font-size: 32px;
          color: #b00020;
          font-weight: 800;
          line-height: 1.1;
        }

        .tileData p {
          color: #666;
          font-size: 14px;
          font-weight: 500;
          margin-top: 4px;
        }

        .dashboardLayout {
          display: grid;
          grid-template-columns: 380px 1fr;
          gap: 35px;
          align-items: stretch;
        }

        .bloodGroupResponseSummary {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 12px;
          margin-bottom: 24px;
        }

        .responseGroupBadge {
          background: #fff5f7;
          border: 1px solid rgba(193, 18, 31, 0.12);
          border-radius: 18px;
          padding: 14px 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
        }

        .groupLabel {
          font-size: 0.95rem;
          font-weight: 700;
          color: #b00020;
        }

        .groupStats {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .statItem {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.85rem;
          font-weight: 700;
          padding: 6px 10px;
          border-radius: 999px;
        }

        .statItem.willingCount {
          background: rgba(34, 197, 94, 0.12);
          color: #166534;
        }

        .statItem.unavailableCount {
          background: rgba(185, 28, 28, 0.12);
          color: #7f1d1d;
        }

        .dataStreamPanel {
          max-height: calc(100vh - 220px);
          overflow-y: auto;
          padding-right: 15px;
        }

        .cardsContainer::-webkit-scrollbar {
          width: 8px;
        }

        .cardsContainer::-webkit-scrollbar-track {
          background: #fcf8f8;
          border-radius: 10px;
        }

        .cardsContainer::-webkit-scrollbar-thumb {
          background: #f0d5d9;
          border-radius: 10px;
        }

        .cardsContainer::-webkit-scrollbar-thumb:hover {
          background: #b00020;
        }

        @media (max-width: 1100px) {
          .dashboardLayout {
            grid-template-columns: 1fr;
          }
          .dataStreamPanel {
             max-height: 85vh;
          }
        }

        .controlPanel {
          display: flex;
          flex-direction: column;
          gap: 30px;
        }

        .controlBlock {
          background: white;
          padding: 30px;
          border-radius: 24px;
          border: 1px solid #f3dcdc;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.02);
        }

        .controlBlock.emergencySection {
          background: #fffdfd;
          border: 2px solid #fbc2c2;
          box-shadow: 0 15px 35px rgba(176, 0, 32, 0.04);
        }

        .controlBlock h3 {
          color: #b00020;
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 20px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .actionButtonGroup {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .panelBtn {
          width: 100%;
          padding: 14px 18px;
          border: 1px solid #f0d5d9;
          background: white;
          color: #444;
          text-align: left;
          font-size: 15px;
          font-weight: 600;
          border-radius: 12px;
          cursor: pointer;
          transition: transform 0.15s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .panelBtn:hover {
          background: #fff0f1;
          color: #b00020;
          border-color: #fbc2c2;
        }

        .panelBtn:active {
          transform: scale(0.97);
          box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.03);
        }

        .panelBtn.active {
          background: linear-gradient(90deg, #b00020, #d62839);
          color: white;
          border-color: transparent;
        }

        .panelBtn.active:active {
          transform: scale(0.97);
        }

        .formSet {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .dashboardInput {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid #e1cbd0;
          border-radius: 12px;
          outline: none;
          font-size: 15px;
          background: white;
          color: #333;
          transition: border 0.25s ease;
        }

        .dashboardInput:focus {
          border-color: #d62839;
          box-shadow: 0 0 0 3px rgba(214, 40, 57, 0.1);
        }

        .disabledInput {
          background: #f7eded;
          color: #b00020;
          font-weight: 600;
          cursor: copy;
        }

        .actionTriggerBtn {
          width: 100%;
          padding: 14px;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .actionTriggerBtn.emergency {
          background: linear-gradient(90deg, #d90429, #ef233c);
          color: white;
          box-shadow: 0 6px 20px rgba(217, 4, 41, 0.15);
        }

        .actionTriggerBtn.emergency:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(217, 4, 41, 0.3);
        }

        .actionTriggerBtn.emergency:active {
          transform: translateY(1px) scale(0.97);
          box-shadow: 0 3px 10px rgba(217, 4, 41, 0.1);
        }

        .secondaryActionBtn {
          width: 100%;
          background: #1e5e3a;
          color: white;
          border: none;
          border-radius: 8px;
          padding: 10px;
          margin-top: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.15s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.2s ease, box-shadow 0.2s ease;
        }

        .secondaryActionBtn:hover {
          background: #154228;
        }

        .secondaryActionBtn:active {
          transform: scale(0.96);
          box-shadow: 0 2px 8px rgba(30, 94, 58, 0.2);
        }

        .closeBroadcastBtn {
          width: 100%;
          padding: 14px;
          background: #333;
          color: white;
          font-weight: bold;
          border: none;
          border-radius: 12px;
          margin-top: 25px;
          cursor: pointer;
          transition: transform 0.15s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.2s ease, box-shadow 0.2s ease;
        }

        .closeBroadcastBtn:hover {
          background: #222;
        }

        .closeBroadcastBtn:active {
          transform: scale(0.96);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .dynamicClickEffect {
          transition: transform 0.12s cubic-bezier(0.4, 0, 0.2, 1), filter 0.15s ease, background-color 0.15s ease !important;
        }

        .dynamicClickEffect:hover {
          filter: brightness(0.93);
        }

        .dynamicClickEffect:active {
          transform: scale(0.95) !important;
        }

        .dataStreamPanel {
          display: flex;
          flex-direction: column;
        }

        .panelSectionTitle {
          margin-bottom: 25px;
        }

        .panelSectionTitle h2 {
          color: #333;
          font-size: 24px;
          font-weight: 700;
        }

        .resultsCounter {
          color: #666;
          font-size: 14px;
          margin-top: 4px;
        }

        .cardsContainer {
          display: flex !important;
          flex-direction: column !important;
          gap: 20px !important;
          padding: 10px 0 !important;
          width: 100% !important;
        }

        .dataCard {
          background: white;
          border: 1px solid #f3dcdc;
          border-top: 5px solid #b00020 !important;
          border-radius: 16px;
          padding: 25px;
          box-shadow: 0 5px 20px rgba(0, 0, 0, 0.01);
          width: 100%;
          transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s ease-in-out;
          cursor: pointer;
        }

        .dataCard:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 28px rgba(176, 0, 32, 0.06);
        }

        .dataCard:active {
          transform: translateY(1px) scale(0.99);
          box-shadow: 0 4px 10px rgba(176, 0, 32, 0.03);
        }

        .emptyStateCard {
          text-align: center;
          padding: 40px;
          color: #777;
          border: 1px dashed #f3dcdc;
          border-radius: 16px;
          background: #ffffff;
          cursor: default;
        }
        .emptyStateCard:hover { transform: none; box-shadow: none; }

        .dataCard.logCard {
          background: #ffffff !important;
          display: flex;
          flex-direction: column;
        }

        .donorCardTop {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }

        .donorCardTop h3 {
          font-size: 20px;
          color: #333;
          font-weight: 700;
          display: inline-block;
        }

        .roleTag {
          display: inline-block;
          background: #f3f3f3;
          color: #666;
          font-size: 11px;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 6px;
          margin-left: 10px;
          text-transform: uppercase;
        }

        .bloodTypeBadge {
          background: #fff0f1;
          color: #b00020;
          font-size: 18px;
          font-weight: 800;
          padding: 6px 14px;
          border-radius: 12px;
          border: 1px solid #fbc2c2;
        }

        .donorCardDetailsGrid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 10px;
          padding: 12px 0;
          border-top: 1px solid #fff0f1;
          border-bottom: 1px solid #fff0f1;
          font-size: 14px;
          color: #555;
        }

        .logCardHeader {
          display: flex !important;
          justify-content: space-between !important;
          align-items: center !important;
          border-bottom: 2px solid #fff0f1 !important;
          padding-bottom: 12px !important;
          margin-bottom: 15px !important;
        }

        .logBadge {
          font-size: 11px !important;
          font-weight: 700 !important;
          letter-spacing: 1px !important;
          text-transform: uppercase;
        }

        .logDate {
          font-size: 15px !important;
          font-weight: 800 !important;
          color: #b00020 !important;
          margin: 0 !important;
          background: #fff0f1 !important;
          padding: 6px 14px !important;
          border-radius: 8px !important;
          letter-spacing: 0.2px;
        }

        .logDonor, .logHospital {
          font-size: 16px !important;
          color: #333333 !important;
          font-weight: 700 !important;
          line-height: 1.6 !important;
          margin-bottom: 10px !important;
        }

        .logDonor strong, .logHospital strong {
          font-weight: 700 !important;
          color: #4e4e4e !important;
          display: inline-block;
          margin-right: 6px;
        }

        .commsLink {
          text-decoration: none;
        }

        .cardActionRow {
          display: flex !important;
          justify-content: space-between !important;
          align-items: center !important;
          flex-wrap: wrap !important;
          gap: 15px !important;
          margin-top: 22px !important;
          padding-top: 15px !important;
          border-top: 1px solid #fff0f1 !important;
        }

        .actionBtnLeftGroup {
          display: flex !important;
          align-items: center !important;
          gap: 10px !important;
          flex-wrap: wrap !important;
        }

        .actionBtnRightGroup {
          display: flex !important;
          align-items: center !important;
          gap: 12px !important;
          flex-wrap: wrap !important;
          margin-left: auto !important;
        }

        .cardActionBtn {
          padding: 11px 18px !important;
          border: 1px solid #fca9a9 !important;
          border-radius: 10px !important;
          font-size: 13px !important;
          font-weight: 700 !important;
          cursor: pointer !important;
          background: #fff0f1 !important;
          color: #b00020 !important;
          transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1) !important;
          display: inline-flex !important;
          align-items: center !important;
          gap: 6px !important;
        }

        .cardActionBtn:hover {
          background: #b00020 !important;
          color: white !important;
          border-color: transparent !important;
          transform: translateY(-1px) !important;
        }

        .cardActionBtn:active {
          transform: translateY(1px) scale(0.96) !important;
        }

        .cardActionBtn.actionBtnHistory {
          background: #ffffff !important;
          border: 1px solid #e1cbd0 !important;
          color: #444444 !important;
        }

        .cardActionBtn.actionBtnHistory:hover {
          background: #fff0f1 !important;
          border-color: #fca9a9 !important;
          color: #b00020 !important;
        }

        .cardActionBtn.actionBtnRecord {
          background: linear-gradient(135deg, #d90429, #ef233c) !important;
          color: white !important;
          border-color: transparent !important;
          box-shadow: 0 4px 12px rgba(217, 4, 41, 0.15) !important;
        }

        .cardActionBtn.actionBtnRecord:hover {
          background: linear-gradient(135deg, #b00020, #d90429) !important;
          box-shadow: 0 6px 16px rgba(217, 4, 41, 0.25) !important;
        }

        @media (max-width: 768px) {
          .cardActionRow {
            flex-direction: column !important;
            align-items: stretch !important;
          }
          .actionBtnLeftGroup, .actionBtnRightGroup {
            width: 100% !important;
            margin-left: 0 !important;
          }
          .actionBtnLeftGroup .cardActionBtn, .actionBtnRightGroup .cardActionBtn {
            flex: 1 !important;
            justify-content: center !important;
          }
        }

        .modalOverlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(43, 45, 66, 0.45);
          backdrop-filter: blur(4px);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          padding: 20px;
        }

        .modalWindow {
          background: white;
          padding: 35px;
          border-radius: 24px;
          width: 100%;
          max-width: 520px;
          max-height: 85vh;
          overflow-y: auto;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
          border: 1px solid #f3dcdc;
          animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .modalWindow.detailsModal {
          max-width: 560px;
        }

        @keyframes slideUp {
          from { transform: translateY(15px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .modalWindowHeader {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          border-bottom: 1px solid #fff0f1;
          padding-bottom: 12px;
        }

        .modalWindowHeader h2 {
          color: #333;
          font-size: 20px;
          font-weight: 700;
        }

        .modalCloseCorner {
          background: none; border: none; font-size: 18px; color: #aaa; cursor: pointer;
        }

        .modalSubheaderInfo {
          color: #b00020; font-weight: bold; margin-bottom: 15px; font-size: 14px;
        }

        .historyTimeline.professionalTimeline {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .timelineNode.professionalNode {
          background: #ffffff !important;
          border: 1px solid #f3dcdc !important;
          border-left: 4px solid #b00020 !important;
          border-radius: 12px !important;
          padding: 16px !important;
        }

        .fullDetailsList {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .detailRow {
          display: flex;
          justify-content: space-between;
          font-size: 15px;
          padding-bottom: 8px;
          border-bottom: 1px dashed #eee;
        }

        .detailRow span { color: #666; }
        .highlightRed { color: #b00020; }
        .textLarge { font-size: 18px; }
        .capitalizeText { text-transform: capitalize; }

        .donationTargetTitle { margin-bottom: 20px; font-size: 15px; color: #444; }
        .formGroupInline { margin-bottom: 15px;}
        .modalInputLabel { display: block; font-size: 13px; font-weight: 600; color: #555; margin-bottom: 6px;}

        .closeModalBtn {
          width: 100%;
          padding: 14px;
          background: #333;
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: bold;
          cursor: pointer;
        }

        .closeModalBtn.inlineBtn {
          width: auto;
          padding: 12px 20px;
        }

        .modalWindowFooter {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          margin-top: 25px;
          border-top: 1px solid #fff0f1;
          padding-top: 15px;
        }

        .secondaryBtn { background: #f3f3f3; color: #555;}
        .primaryBtn { background: linear-gradient(90deg, #d90429, #ef233c); color: white;}

        .alignedDetailsGrid {
          display: grid !important;
          grid-template-columns: repeat(2, 1fr) !important;
          gap: 12px 40px !important;
          padding: 16px 0 !important;
          max-width: 100% !important;
        }

        .detailsGridRow {
          display: flex;
          justify-content: flex-start;
          align-items: center;
        }

        .detailsGridLabel {
          width: 140px;
          color: #666;
          font-weight: 600;
          font-size: 14px;
        }

        .detailsGridValue {
          color: #333;
          font-weight: 600;
          font-size: 14px;
        }

        .horizontalSearchBlock {
          background: white;
          border: 1px solid #f3dcdc;
          border-radius: 20px;
          padding: 20px;
          margin-bottom: 25px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.01);
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .searchFilterRow {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 15px;
        }

        .searchFilterRow.doubleGrid {
          grid-template-columns: repeat(2, 1fr);
        }

        @media (max-width: 768px) {
          .searchFilterRow, .searchFilterRow.doubleGrid {
            grid-template-columns: 1fr;
          }
        }

        .textInputBold {
          font-weight: 700 !important;
          color: #333 !important;
        }

        .panelSectionTitle.historySectionTitle {
          display: flex !important;
          justify-content: space-between !important;
          align-items: center !important;
          gap: 20px;
          flex-wrap: wrap;
        }

        .globalLogDonationBtn {
          background: linear-gradient(135deg, #2b2d42, #1d1e2c);
          color: white;
          border: none;
          padding: 12px 22px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(43, 45, 110, 0.1);
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .realtimeVerifyFeedback {
          margin-top: 8px;
          font-size: 13px;
          font-weight: 600;
          padding: 8px 12px;
          border-radius: 8px;
        }

        .realtimeVerifyFeedback.matched {
          background: #edf7ed;
          color: #1e4620;
          border-left: 3px solid #2e7d32;
        }

        .realtimeVerifyFeedback.failed {
          background: #fdf2f2;
          color: #611a1a;
          border-left: 3px solid #c62828;
        }

        .requestTrackTabBar {
          display: flex !important;
          gap: 12px !important;
          overflow-x: auto !important;
          padding: 8px 0 16px 0 !important;
          margin-bottom: 25px !important;
          border-bottom: 2px solid #fff0f1 !important;
        }

        .requestTrackTabBar::-webkit-scrollbar {
          height: 5px;
        }
        .requestTrackTabBar::-webkit-scrollbar-thumb {
          background: #fbc2c2;
          border-radius: 10px;
        }

        .trackTabItem {
          background: white;
          border: 1px solid #f0d5d9;
          padding: 12px 20px;
          border-radius: 12px;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          min-width: 150px;
          text-align: left;
          transition: transform 0.15s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
        }

        .trackTabItem:hover {
          background: #fff0f1;
          border-color: #fbc2c2;
        }

        .trackTabItem.activeTrack {
          background: linear-gradient(135deg, #b00020, #d62839) !important;
          color: white !important;
          border-color: transparent !important;
          box-shadow: 0 4px 15px rgba(176, 0, 32, 0.15) !important;
        }

        .tabBloodDrop {
          font-size: 16px;
          font-weight: 800;
          margin-bottom: 4px;
        }

        .tabHospitalLabel {
          font-size: 12px;
          font-weight: 600;
          color: #666;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          width: 100%;
        }

        .trackTabItem.activeTrack .tabHospitalLabel {
          color: #ffd6db;
        }

        .toastBanner {
          position: fixed;
          top: 30px;
          right: 30px;
          background: white;
          border-radius: 14px;
          padding: 16px 24px;
          box-shadow: 0 10px 30px rgba(43, 45, 66, 0.12);
          display: flex;
          align-items: center;
          gap: 12px;
          z-index: 99999;
          border: 1px solid #f3dcdc;
          border-left: 6px solid #b00020;
          animation: slideInToast 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes slideInToast {
          from { transform: translateX(40px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }

        .toastBanner.error {
          border-left-color: #b00020;
          background: #fffbfa;
        }

        .toastIcon {
          font-size: 20px;
        }

        .toastMessage {
          font-size: 14px;
          font-weight: 700;
          color: #333;
        }

        .modalWindow.confirmDialog {
          max-width: 440px !important;
          text-align: center;
        }

        .confirmTitle {
          color: #b00020;
          font-size: 18px;
          font-weight: 800;
          margin-bottom: 12px;
        }

        .confirmMsg {
          font-size: 14px;
          color: #666;
          line-height: 1.5;
          margin-bottom: 20px;
        }

        .eligibilityVerticalStack, .triageVerticalStack {
          display: flex !important;
          flex-direction: column !important;
          gap: 30px !important;
          width: 100% !important;
        }

        .availableColumn, .unavailableColumn, .triageSection {
          width: 100% !important;
          display: flex !important;
          flex-direction: column !important;
        }

        .frequentDonorMedal {
          font-size: 26px;
          line-height: 1;
        }

        .donationCountGold {
          color: #D4AF37 !important;
          font-weight: 800 !important;
          font-size: 16px !important;
        }

        .totalDonationRow .detailsGridLabel {
          color: #B8860B;
          font-weight: 700;
        }

        .bloodGroupSelector {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
        }

        .bloodGroupOption {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          border: 1px solid #e1cbd0;
          border-radius: 10px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          background: white;
          transition: border-color 0.2s ease, background-color 0.2s ease;
        }

        .bloodGroupOption:hover {
          border-color: #fbc2c2;
          background: #fff8f9;
        }

        .bloodGroupOption.selected {
          border-color: #b00020;
          background: #fff0f1;
          color: #b00020;
        }

        .bloodGroupOption input {
          accent-color: #b00020;
        }

        .bloodGroupOption.allGroups {
          grid-column: span 2;
          justify-content: center;
        }

        .availabilityHeaderBar,
        .responseHeaderBar {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 22px;
        }

        .sectionToggleBtn {
          flex: 1;
          border: 1px solid #f0d5d9;
          background: white;
          color: #555;
          border-radius: 12px;
          padding: 14px 20px;
          font-weight: 700;
          font-size: 15px;
          letter-spacing: 0.3px;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
          transition: transform 0.15s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
        }

        .sectionToggleBtn:hover {
          background: #fff0f1;
          color: #b00020;
          border-color: #fbc2c2;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(176, 0, 32, 0.08);
        }

        .sectionToggleBtn:active {
          transform: translateY(1px) scale(0.97);
          box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.03);
        }

        .sectionToggleBtn.active {
          background: linear-gradient(135deg, #b00020, #d62839);
          color: white;
          border-color: transparent;
          box-shadow: 0 4px 15px rgba(176, 0, 32, 0.15);
        }

        .sectionToggleBtn.active:active {
          transform: scale(0.97);
        }
      `}} />

      <div className="dashboardHeader">
        <h1><MdBloodtype className="dashboardIcon" /> BloodBridge Command Center</h1>
        <p className="dashboardSubtitle">Real-time metrics, donor tracking, and live emergency network map</p>
      </div>

      {loading && <div className="loadingAlert"><span className="spinner"><FiRefreshCw className="dashboardIcon" /></span> Updating database records...</div>}
      {error && <div className="errorAlert"><FiAlertCircle className="dashboardIcon" /> System Error: {error}</div>}

      <div className="metricsGrid">
        <div className="metricTile">
          <span className="tileIcon"><FiUsers className="dashboardIcon" /></span>
          <div className="tileData"><h3>{totalDonors}</h3><p>Total Registered</p></div>
        </div>
        <div className="metricTile">
          <span className="tileIcon"><FaGraduationCap className="dashboardIcon" /></span>
          <div className="tileData"><h3>{studentCount}</h3><p>Students</p></div>
        </div>
        <div className="metricTile">
          <span className="tileIcon"><FaChalkboardTeacher className="dashboardIcon" /></span>
          <div className="tileData"><h3>{facultyCount}</h3><p>Faculty & Staff</p></div>
        </div>
        
        <div 
          className={`metricTile critical clickableTrackBtn dynamicClickEffect ${viewMode === "emergency_console" ? "activeConsoleCard" : ""}`}
          onClick={() => { if (activeRequests.length > 0) setViewMode("emergency_console"); }}
          style={{ cursor: activeRequests.length > 0 ? "pointer" : "default", ...buttonMotionStyle }}
        >
          <span className="tileIcon"><FiAlertCircle className="dashboardIcon" /></span>
          <div className="tileData">
            <h3>{activeRequests.length}</h3>
            <p>{activeRequests.length === 1 ? "Active Live Request" : "Active Live Requests"}</p>
          </div>
        </div>
      </div>

      <div className="dashboardLayout">
        <div className="controlPanel">
          <div className="controlBlock">
            <h3>Navigation & Filters</h3>
            <div className="actionButtonGroup">
              <button className={`panelBtn ${viewMode === "all" ? "active" : ""}`} onClick={() => setViewMode("all")}><FiGrid className="dashboardIcon" /> View All Donors</button>
              <button className={`panelBtn ${viewMode === "student" ? "active" : ""}`} onClick={() => setViewMode("student")}><FaGraduationCap className="dashboardIcon" /> Filter Students</button>
              <button className={`panelBtn ${viewMode === "faculty" ? "active" : ""}`} onClick={() => setViewMode("faculty")}><FaChalkboardTeacher className="dashboardIcon" /> Filter Faculty</button>
              <button className={`panelBtn ${viewMode === "frequent" ? "active" : ""}`} onClick={() => setViewMode("frequent")}><FiAward className="dashboardIcon" /> Frequent Donors</button>
              <button className={`panelBtn ${viewMode === "history" ? "active" : ""}`} onClick={() => setViewMode("history")}><FiFileText className="dashboardIcon" /> Donation History Log</button>
            </div>
          </div>

          <div className="controlBlock emergencySection">
            <h3><FiAlertCircle className="dashboardIcon" /> Launch Emergency Broadcast</h3>
            <div className="formSet">
              <div className="bloodGroupHeader">
                <h4><MdBloodtype className="dashboardIcon" /> Select Required Blood Groups</h4>
                <p>Choose one or more blood groups to notify donors.</p>
              </div>
              <div className="bloodGroupSelector">
                <button
                  type="button"
                  className={`bloodGroupOption allGroups ${allBloodGroupsSelected ? "selected" : ""}`}
                  onClick={toggleAllBloodGroupsSelection}
                >
                  <span className="bloodGroupIcon"><MdBloodtype className="dashboardIcon" /></span>
                  <span className="bloodGroupText">All Blood Groups</span>
                </button>
                {BLOOD_GROUPS.map((group) => (
                  <button
                    key={group}
                    type="button"
                    className={`bloodGroupOption ${!allBloodGroupsSelected && requestBloodGroups.includes(group) ? "selected" : ""}`}
                    disabled={allBloodGroupsSelected}
                    onClick={() => toggleBloodGroupSelection(group)}
                  >
                    <span className="bloodGroupIcon"><MdBloodtype className="dashboardIcon" /></span>
                    <span className="bloodGroupText">{group}</span>
                  </button>
                ))}
              </div>
              <input placeholder="Hospital Name" value={requestHospital} onChange={(e) => setRequestHospital(e.target.value)} className="dashboardInput" />
              <input placeholder="Units Needed" value={requestUnits} onChange={(e) => setRequestUnits(e.target.value)} className="dashboardInput" />
              <input placeholder="Admin Mobile Number" value={requestPhone} onChange={(e) => setRequestPhone(e.target.value)} className="dashboardInput" />

              <button className="actionTriggerBtn emergency" onClick={createEmergencyRequest}>
                Create Request
              </button>
            </div>
          </div>
        </div>

        <div className="dataStreamPanel">
          {viewMode === "emergency_console" ? (
            <div className="emergencyConsoleWorkspace">
              <div className="panelSectionTitle">
                <h2><FiAlertCircle className="dashboardIcon" /> Concurrent Emergency Operations</h2>
                <p>Track multiple active broadcast streams contextually without closing or locking background operations.</p>
              </div>

              {/* Multi-Request selector bar tabs */}
              <div className="requestTrackTabBar">
                {activeRequests.map((req) => (
                  <button 
                    key={req._id} 
                    className={`trackTabItem dynamicClickEffect ${selectedRequestId === req._id ? "activeTrack" : ""}`}
                    onClick={() => { setSelectedRequestId(req._id); }}
                    style={buttonMotionStyle}
                  >
                    <span className="tabBloodDrop"><MdBloodtype className="dashboardIcon" /> {formatRequestBloodGroupLabel(req.bloodGroup)}</span>
                    <span className="tabHospitalLabel">{req.hospital}</span>
                  </button>
                ))}
              </div>

              {currentRequest ? (
                <div className="activeTrackContentArea">
                  {!currentRequest.showLiveTriage ? (
                    <>
                      <div className="consoleActionHeader" style={{ marginBottom: "20px", padding: "15px", background: "#fdf2f2", borderRadius: "12px" }}>
                        <div style={{ display: "flex", gap: "15px", alignItems: "center", flexWrap: "wrap" }}>
                          <div style={{ flex: 1 }}>
                            <label className="modalInputLabel" style={{ marginBottom: "4px" }}>Broadcast Public Response Link:</label>
                            <input value={currentRequest.link} readOnly className="dashboardInput" onClick={(e) => e.target.select()} style={{ background: "#fff", border: "1px solid #ecc" }} />
                          </div>
                          
                          <div style={{ display: "flex", gap: "10px", alignSelf: "flex-end" }}>
                            <button 
                              className="actionTriggerBtn emergency dynamicClickEffect"
                              style={{ width: "auto", padding: "12px 20px" }}
                              onClick={() => handleNotifyDonors(currentRequest._id)}
                            >
                              <FiActivity className="dashboardIcon" /> Notify Donors
                            </button>

                            {currentRequest.isNotified && (
                              <button 
                                className="secondaryActionBtn dynamicClickEffect" 
                                style={{ ...buttonMotionStyle, width: "auto", margin: 0, padding: "12px 20px" }} 
                                onClick={() => {
                                  updateActiveRequest(currentRequest._id, { showLiveTriage: true });
                                  handleRefreshResponses();
                                }}
                              >
                                Track Live Responses →
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="availabilityHeaderBar premiumHeader">
                        <button
                          className={`sectionToggleBtn ${availabilityView === "available" ? "active" : ""}`}
                          onClick={() => setAvailabilityView("available")}
                        >
                          Available ({currentRequest.availableDonors?.length || 0})
                        </button>
                        <button
                          className={`sectionToggleBtn ${availabilityView === "unavailable" ? "active" : ""}`}
                          onClick={() => setAvailabilityView("unavailable")}
                        >
                          Unavailable ({currentRequest.unavailableDonorsList?.length || 0})
                        </button>
                      </div>

                      {availabilityView === "available" ? (
                        <div className="eligibilityVerticalStack">
                          <div className="availableColumn">
                            <h3 style={{ borderBottom: "3px solid green", paddingBottom: "8px", marginBottom: "15px", color: "green" }}>
                              Available Donors ({currentRequest.availableDonors?.length || 0})
                            </h3>
                            <div className="cardsContainer">
                              {currentRequest.availableDonors?.map(d => (
                                <div key={d._id} className="dataCard donorCard">
                                  <div className="donorCardTop">
                                    <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                                      <h3 style={{ margin: 0, fontWeight: "700" }}>{d.name}</h3>
                                      <span className="roleTag">{d.role}</span>
                                      <span className="bloodTypeBadge">{d.bloodGroup}</span>
                                    </div>
                                  </div>

                                  <div className="donorCardDetailsGrid alignedDetailsGrid">
                                    <div className="detailsGridRow"><span className="detailsGridLabel">Department:</span> <span className="detailsGridValue">{d.department}</span></div>
                                    <div className="detailsGridRow"><span className="detailsGridLabel">Year Level:</span> <span className="detailsGridValue">{d.year || "N/A"}</span></div>
                                    <div className="detailsGridRow"><span className="detailsGridLabel">Mobile Terminal:</span> <span className="detailsGridValue">{d.mobile}</span></div>
                                    <div className="detailsGridRow"><span className="detailsGridLabel">Register Number:</span> <span className="detailsGridValue">{d.registerNumber || "N/A"}</span></div>
                                  </div>

                                  <div className="cardActionRow">
                                    <div className="actionBtnLeftGroup">
                                      <button className="cardActionBtn" onClick={() => setDetailsDonor(d)}><FiTrendingUp className="dashboardIcon" /> Details</button>
                                      <a href={`tel:${d.mobile}`} className="commsLink"><button className="cardActionBtn"><FiPhone className="dashboardIcon" /> Call</button></a>
                                      <a href={`https://wa.me/91${d.mobile}`} target="_blank" rel="noreferrer" className="commsLink"><button className="cardActionBtn"><FiMessageCircle className="dashboardIcon" /> WhatsApp</button></a>
                                    </div>
                                    <div className="actionBtnRightGroup">
                                      <button className="cardActionBtn actionBtnHistory" onClick={() => setSelectedDonor(d)}><FiFileText className="dashboardIcon" /> History</button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                              {currentRequest.availableDonors?.length === 0 && <p className="neutralSubText">No available matching assets located.</p>}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="eligibilityVerticalStack">
                          <div className="unavailableColumn">
                            <h3 style={{ borderBottom: "3px solid #b00020", paddingBottom: "8px", marginBottom: "15px", color: "#b00020" }}>
                              Unavailable Donors ({currentRequest.unavailableDonorsList?.length || 0})
                            </h3>
                            <div className="cardsContainer">
                              {currentRequest.unavailableDonorsList?.map(d => (
                                <div key={d._id} className="dataCard donorCard" style={{ opacity: 0.85 }}>
                                  <div className="donorCardTop">
                                    <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                                      <h3 style={{ margin: 0, fontWeight: "700" }}>{d.name}</h3>
                                      <span className="roleTag">{d.role}</span>
                                      <span className="bloodTypeBadge">{d.bloodGroup}</span>
                                    </div>
                                  </div>

                                  <div className="donorCardDetailsGrid alignedDetailsGrid">
                                    <div className="detailsGridRow"><span className="detailsGridLabel">Department:</span> <span className="detailsGridValue">{d.department}</span></div>
                                    <div className="detailsGridRow"><span className="detailsGridLabel">Year Level:</span> <span className="detailsGridValue">{d.year || "N/A"}</span></div>
                                    <div className="detailsGridRow"><span className="detailsGridLabel">Mobile Terminal:</span> <span className="detailsGridValue">{d.mobile}</span></div>
                                    <div className="detailsGridRow"><span className="detailsGridLabel">Register Number:</span> <span className="detailsGridValue">{d.registerNumber || "N/A"}</span></div>
                                  </div>

                                  <div className="cardActionRow">
                                    <div className="actionBtnLeftGroup">
                                      <button className="cardActionBtn" onClick={() => setDetailsDonor(d)}><FiTrendingUp className="dashboardIcon" /> Details</button>
                                      <a href={`tel:${d.mobile}`} className="commsLink"><button className="cardActionBtn"><FiPhone className="dashboardIcon" /> Call</button></a>
                                      <a href={`https://wa.me/91${d.mobile}`} target="_blank" rel="noreferrer" className="commsLink"><button className="cardActionBtn"><FiMessageCircle className="dashboardIcon" /> WhatsApp</button></a>
                                    </div>
                                    <div className="actionBtnRightGroup">
                                      <button className="cardActionBtn actionBtnHistory" onClick={() => setSelectedDonor(d)}><FiFileText className="dashboardIcon" /> History</button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                              {currentRequest.unavailableDonorsList?.length === 0 && <p className="neutralSubText">No matching locked assets.</p>}
                            </div>
                          </div>
                        </div>
                      )}

                      <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginTop: "30px" }}>
                        <button
                          className="closeBroadcastBtn dynamicClickEffect"
                          style={{ ...buttonMotionStyle, background: "#b00020", marginTop: 0 }}
                          onClick={() => handleCloseBroadcastChannel(currentRequest._id)}
                        >
                          <FiLock className="dashboardIcon" /> Close Request Thread
                        </button>
                        <button
                          className="closeBroadcastBtn dynamicClickEffect"
                          style={{ ...buttonMotionStyle, background: "#7b1fa2", marginTop: 0 }}
                          onClick={handleCloseAllActiveRequests}
                        >
                          <FiXCircle className="dashboardIcon" /> Close All Active Requests
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="liveTriageTrackingView">
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
                        <h3><FiTrendingUp className="dashboardIcon" /> Triage Tracker: Request Group [{formatRequestBloodGroupLabel(currentRequest.bloodGroup)}]</h3>
                        <div style={{ display: "flex", gap: "10px" }}>
                          <button className="panelBtn dynamicClickEffect" style={{ ...buttonMotionStyle, background: "#0056b3", color: "#fff", width: "auto" }} onClick={handleRefreshResponses}><FiRefreshCw className="dashboardIcon" /> Refresh</button>
                          <button className="panelBtn dynamicClickEffect" style={{ ...buttonMotionStyle, width: "auto" }} onClick={() => updateActiveRequest(currentRequest._id, { showLiveTriage: false })}>← Back</button>
                        </div>
                      </div>

                      <div className="bloodGroupResponseSummary">
                        {(() => {
                          const willingCounts = groupResponseCounts(currentRequest.willingDonors || []);
                          const unavailableCounts = groupResponseCounts(currentRequest.unavailableDonors || []);
                          return parseBloodGroupList(currentRequest.bloodGroup).map((group) => (
                            <div key={group} className="responseGroupBadge">
                              <span className="groupLabel">{group}</span>
                              <div className="groupStats">
                                <span className="statItem willingCount"><FiCheckCircle className="dashboardIcon" /> {willingCounts[group] || 0}</span>
                                <span className="statItem unavailableCount"><FiXCircle className="dashboardIcon" /> {unavailableCounts[group] || 0}</span>
                              </div>
                            </div>
                          ));
                        })()}
                      </div>

                      <div className="responseHeaderBar">
                        <button
                          className={`sectionToggleBtn ${responseView === "willing" ? "active" : ""}`}
                          onClick={() => setResponseView("willing")}
                        >
                          <FiCheckCircle className="dashboardIcon" /> Willing ({currentRequest.willingDonors?.length || 0})
                        </button>
                        <button
                          className={`sectionToggleBtn ${responseView === "declined" ? "active" : ""}`}
                          onClick={() => setResponseView("declined")}
                        >
                          <FiXCircle className="dashboardIcon" /> Declined ({currentRequest.unavailableDonors?.length || 0})
                        </button>
                        <button
                          className={`sectionToggleBtn ${responseView === "pending" ? "active" : ""}`}
                          onClick={() => setResponseView("pending")}
                        >
                          ⏳ Pending Contact ({Math.max(0, (currentRequest.availableDonors?.length || 0) - (currentRequest.willingDonors?.length || 0) - (currentRequest.unavailableDonors?.length || 0))})
                        </button>
                      </div>

                      {/* One by One layout for responses sequentially: Willing -> Declined -> Pending */}
                      <div className="triageVerticalStack" style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
                        {responseView === "willing" && (
                          <div className="triageSection">
                            <h4 style={{ color: "green", borderBottom: "2px solid green", paddingBottom: "6px", marginBottom: "15px" }}>
                              <FiCheckCircle className="dashboardIcon" /> Willing ({currentRequest.willingDonors?.length || 0})
                            </h4>
                            <div className="cardsContainer">
                              {currentRequest.willingDonors?.map((w, i) => {
                                const d = getDonorProfile(w.donorName, w.mobile);
                                return (
                                  <div key={i} className="dataCard donorCard">
                                    <div className="donorCardTop">
                                      <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                                        <h3 style={{ margin: 0, fontWeight: "700" }}>{d.name}</h3>
                                        <span className="roleTag">{d.role}</span>
                                        <span className="bloodTypeBadge">{d.bloodGroup}</span>
                                      </div>
                                    </div>

                                    <div className="donorCardDetailsGrid alignedDetailsGrid">
                                      <div className="detailsGridRow"><span className="detailsGridLabel">Department:</span> <span className="detailsGridValue">{d.department}</span></div>
                                      <div className="detailsGridRow"><span className="detailsGridLabel">Year Level:</span> <span className="detailsGridValue">{d.year || "N/A"}</span></div>
                                      <div className="detailsGridRow"><span className="detailsGridLabel">Mobile Terminal:</span> <span className="detailsGridValue">{d.mobile}</span></div>
                                      <div className="detailsGridRow"><span className="detailsGridLabel">Register Number:</span> <span className="detailsGridValue">{d.registerNumber || "N/A"}</span></div>
                                    </div>

                                    <div className="cardActionRow">
                                      <div className="actionBtnLeftGroup">
                                        <button className="cardActionBtn" onClick={() => setDetailsDonor(d)}><FiTrendingUp className="dashboardIcon" /> Details</button>
                                        <a href={`tel:${d.mobile}`} className="commsLink"><button className="cardActionBtn"><FiPhone className="dashboardIcon" /> Call</button></a>
                                        <a href={`https://wa.me/91${d.mobile}`} target="_blank" rel="noreferrer" className="commsLink"><button className="cardActionBtn"><FiMessageCircle className="dashboardIcon" /> WhatsApp</button></a>
                                      </div>
                                      <div className="actionBtnRightGroup">
                                        <button className="cardActionBtn actionBtnRecord" onClick={() => setDonationDonor(d)}>➕ Log Donation</button>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                              {(!currentRequest.willingDonors || currentRequest.willingDonors.length === 0) && <p className="neutralSubText">No willing responses recorded yet.</p>}
                            </div>
                          </div>
                        )}

                        {responseView === "declined" && (
                          <div className="triageSection">
                            <h4 style={{ color: "#b00020", borderBottom: "2px solid #b00020", paddingBottom: "6px", marginBottom: "15px" }}>
                              <FiXCircle className="dashboardIcon" /> Declined ({currentRequest.unavailableDonors?.length || 0})
                            </h4>
                            <div className="cardsContainer">
                              {currentRequest.unavailableDonors?.map((un, i) => {
                                const d = getDonorProfile(un.donorName, un.mobile);
                                return (
                                  <div key={i} className="dataCard donorCard" style={{ opacity: 0.85 }}>
                                    <div className="donorCardTop">
                                      <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                                        <h3 style={{ margin: 0, fontWeight: "700" }}>{d.name}</h3>
                                        <span className="roleTag">{d.role}</span>
                                        <span className="bloodTypeBadge">{d.bloodGroup}</span>
                                      </div>
                                    </div>

                                    <div className="donorCardDetailsGrid alignedDetailsGrid">
                                      <div className="detailsGridRow"><span className="detailsGridLabel">Department:</span> <span className="detailsGridValue">{d.department}</span></div>
                                      <div className="detailsGridRow"><span className="detailsGridLabel">Year Level:</span> <span className="detailsGridValue">{d.year || "N/A"}</span></div>
                                      <div className="detailsGridRow"><span className="detailsGridLabel">Mobile Terminal:</span> <span className="detailsGridValue">{d.mobile}</span></div>
                                      <div className="detailsGridRow"><span className="detailsGridLabel">Register Number:</span> <span className="detailsGridValue">{d.registerNumber || "N/A"}</span></div>
                                    </div>

                                    <div className="cardActionRow">
                                      <div className="actionBtnLeftGroup">
                                        <button className="cardActionBtn" onClick={() => setDetailsDonor(d)}><FiTrendingUp className="dashboardIcon" /> Details</button>
                                        <a href={`tel:${d.mobile}`} className="commsLink"><button className="cardActionBtn"><FiPhone className="dashboardIcon" /> Call</button></a>
                                        <a href={`https://wa.me/91${d.mobile}`} target="_blank" rel="noreferrer" className="commsLink"><button className="cardActionBtn"><FiMessageCircle className="dashboardIcon" /> WhatsApp</button></a>
                                      </div>
                                      <div className="actionBtnRightGroup">
                                        <button className="cardActionBtn actionBtnHistory" onClick={() => setSelectedDonor(un)}><FiFileText className="dashboardIcon" /> History</button>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                              {(!currentRequest.unavailableDonors || currentRequest.unavailableDonors.length === 0) && <p className="neutralSubText">No decline responses logged.</p>}
                            </div>
                          </div>
                        )}

                        {responseView === "pending" && (
                          <div className="triageSection">
                            <h4 style={{ color: "#666", borderBottom: "2px solid #666", paddingBottom: "6px", marginBottom: "15px" }}>
                              ⏳ Pending Contact ({
                                Math.max(0, (currentRequest.availableDonors?.length || 0) - (currentRequest.willingDonors?.length || 0) - (currentRequest.unavailableDonors?.length || 0))
                              })
                            </h4>
                            <div className="cardsContainer">
                              {currentRequest.availableDonors
                                ?.filter(d => !currentRequest.willingDonors?.some(w => w.mobile === d.mobile) && !currentRequest.unavailableDonors?.some(un => un.mobile === d.mobile))
                                .map(d => (
                                  <div key={d._id} className="dataCard donorCard" style={{ opacity: 0.75 }}>
                                    <div className="donorCardTop">
                                      <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                                        <h3 style={{ margin: 0, fontWeight: "700" }}>{d.name}</h3>
                                        <span className="roleTag">{d.role}</span>
                                        <span className="bloodTypeBadge">{d.bloodGroup}</span>
                                      </div>
                                    </div>

                                    <div className="donorCardDetailsGrid alignedDetailsGrid">
                                      <div className="detailsGridRow"><span className="detailsGridLabel">Department:</span> <span className="detailsGridValue">{d.department}</span></div>
                                      <div className="detailsGridRow"><span className="detailsGridLabel">Year Level:</span> <span className="detailsGridValue">{d.year || "N/A"}</span></div>
                                      <div className="detailsGridRow"><span className="detailsGridLabel">Mobile Terminal:</span> <span className="detailsGridValue">{d.mobile}</span></div>
                                      <div className="detailsGridRow"><span className="detailsGridLabel">Register Number:</span> <span className="detailsGridValue">{d.registerNumber || "N/A"}</span></div>
                                    </div>

                                    <div className="cardActionRow">
                                      <div className="actionBtnLeftGroup">
                                        <button className="cardActionBtn" onClick={() => setDetailsDonor(d)}><FiTrendingUp className="dashboardIcon" /> Details</button>
                                        <a href={`tel:${d.mobile}`} className="commsLink"><button className="cardActionBtn"><FiPhone className="dashboardIcon" /> Call</button></a>
                                        <a href={`https://wa.me/91${d.mobile}`} target="_blank" rel="noreferrer" className="commsLink"><button className="cardActionBtn"><FiMessageCircle className="dashboardIcon" /> WhatsApp</button></a>
                                      </div>
                                      <div className="actionBtnRightGroup">
                                        <button className="cardActionBtn actionBtnHistory" onClick={() => setSelectedDonor(d)}><FiFileText className="dashboardIcon" /> History</button>
                                      </div>
                                    </div>
                                  </div>
                                ))
                              }
                            </div>
                          </div>
                        )}
                      </div>

                      <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginTop: "40px" }}>
                        <button
                          className="closeBroadcastBtn dynamicClickEffect"
                          style={{ ...buttonMotionStyle, background: "#b00020" }}
                          onClick={() => handleCloseBroadcastChannel(currentRequest._id)}
                        >
                          <FiLock className="dashboardIcon" /> Close Request Thread
                        </button>
                        <button
                          className="closeBroadcastBtn dynamicClickEffect"
                          style={{ ...buttonMotionStyle, background: "#7b1fa2" }}
                          onClick={handleCloseAllActiveRequests}
                        >
                          <FiXCircle className="dashboardIcon" /> Close All Active Requests
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="emptyState" style={{ padding: "40px", textAlign: "center" }}>All concurrent operational tasks are complete.</div>
              )}
            </div>
          ) : (
            <>
              {viewMode !== "history" && (
                <div className="horizontalSearchBlock">
                  <div className="searchFilterRow">
                    <select value={selectedBloodGroup} onChange={(e) => setSelectedBloodGroup(e.target.value)} className="dashboardInput textInputBold">
                      <option value="">All Blood Groups</option>
                      <option value="A+">A+</option><option value="A-">A-</option>
                      <option value="B+">B+</option><option value="B-">B-</option>
                      <option value="AB+">AB+</option><option value="AB-">AB-</option>
                      <option value="O+">O+</option><option value="O-">O-</option>
                    </select>
                    <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className="dashboardInput textInputBold">
                      <option value="">All Years</option>
                      <option value="I">I Year</option><option value="II">II Year</option>
                      <option value="III">III Year</option><option value="IV">IV Year</option>
                    </select>
                    <select value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)} className="dashboardInput textInputBold">
                      <option value="">All Departments</option>
                      <option value="CSE">CSE</option><option value="IT">IT</option>
                      <option value="ECE">ECE</option><option value="EEE">EEE</option>
                      <option value="MECH">MECH</option><option value="CIVIL">CIVIL</option>
                    </select>
                    <select value={selectedUserType} onChange={(e) => setSelectedUserType(e.target.value)} className="dashboardInput textInputBold">
                      <option value="">All Roles</option>
                      <option value="student">Student</option>
                      <option value="faculty">Faculty</option>
                    </select>
                  </div>

                  <div className="searchFilterRow doubleGrid">
                    <input type="text" placeholder="🔍 Search by Name..." value={searchName} onChange={(e) => setSearchName(e.target.value)} className="dashboardInput textInputBold" />
                    <input type="text" placeholder="🆔 Search by Register Number..." value={searchRegNo} onChange={(e) => setSearchRegNo(e.target.value)} className="dashboardInput textInputBold" />
                  </div>
                </div>
              )}

              {viewMode === "history" ? (
                <>
                  <div className="panelSectionTitle historySectionTitle">
                    <div>
                      <h2><FiFileText className="dashboardIcon" /> Master Donation History Logbook</h2>
                      <p>Complete historical listing of all blood donations recorded</p>
                    </div>
                    <button className="globalLogDonationBtn dynamicClickEffect" onClick={() => setShowGlobalLogger(true)}>
                      ➕ Log Manual Donation
                    </button>
                  </div>
                  
                  <div className="cardsContainer">
                    {getHistory().map((h, index) => (
                      <div key={index} className="dataCard logCard">
                        <div className="logCardHeader">
                          <span className="logBadge" style={{ background: "#fff0f1", color: "#b00020", padding: "4px 8px", borderRadius: "6px", fontWeight: "700" }}>RECORD LOGGED</span>
                          <p className="logDate">📅 {new Date(h.date).toDateString()}</p>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px", margin: "12px 0" }}>
                          <p className="logDonor" style={{ margin: 0 }}>👤 <span style={{ color: "#666" }}>Donor Asset:</span> <strong>{h.donor.name}</strong></p>
                          <p className="logHospital" style={{ margin: 0 }}>🏥 <span style={{ color: "#666" }}>Hospital:</span> <strong>{h.hospital}</strong></p>
                          <p style={{ margin: 0, fontSize: "15px" }}>💧 <span style={{ color: "#666" }}>Volume Contributed:</span> <strong style={{ color: "#b00020" }}>{h.units} Units</strong></p>
                        </div>
                        <button className="cardActionBtn" onClick={() => setDetailsDonor(h.donor)}>Full Details</button>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div className="panelSectionTitle">
                    <h2>{viewMode === "frequent" ? <><FiAward className="dashboardIcon" /> Frequent Donors</> : <><FiGrid className="dashboardIcon" /> Registered Donors List</>}</h2>
                    {viewMode === "frequent" && (
                      <p className="resultsCounter">Ranked by total donations — highest first</p>
                    )}
                  </div>

                  <div className="cardsContainer">
                    {results.map((d, index) => {
                      const donationCount = d.donationCount ?? d.donationHistory?.length ?? 0;

                      return (
                      <div key={d._id} className="dataCard donorCard">
                        <div className="donorCardTop">
                          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                            {viewMode === "frequent" && index < 3 && (
                              <span className="frequentDonorMedal" title={`Rank #${index + 1}`}>{MEDAL_EMOJIS[index]}</span>
                            )}
                            <h3 style={{ margin: 0, fontWeight: "700" }}>{d.name}</h3>
                            <span className="roleTag">{d.role}</span>
                            <span className="bloodTypeBadge">{d.bloodGroup}</span>
                          </div>
                        </div>

                        <div className="donorCardDetailsGrid alignedDetailsGrid">
                          {viewMode === "frequent" && (
                            <div className="detailsGridRow totalDonationRow">
                              <span className="detailsGridLabel">Total Donation:</span>
                              <span className="detailsGridValue donationCountGold">{donationCount}</span>
                            </div>
                          )}
                          <div className="detailsGridRow"><span className="detailsGridLabel">Department:</span> <span className="detailsGridValue">{d.department}</span></div>
                          <div className="detailsGridRow"><span className="detailsGridLabel">Year Level:</span> <span className="detailsGridValue">{d.year || "N/A"}</span></div>
                          <div className="detailsGridRow"><span className="detailsGridLabel">Mobile Terminal:</span> <span className="detailsGridValue">{d.mobile}</span></div>
                          <div className="detailsGridRow"><span className="detailsGridLabel">Register Number:</span> <span className="detailsGridValue">{d.registerNumber || "N/A"}</span></div>
                        </div>

                        <div className="cardActionRow">
                          <div className="actionBtnLeftGroup">
                            <button className="cardActionBtn" onClick={() => setDetailsDonor(d)}><FiTrendingUp className="dashboardIcon" /> Details</button>
                            <a href={`tel:${d.mobile}`} className="commsLink"><button className="cardActionBtn"><FiPhone className="dashboardIcon" /> Call</button></a>
                            <a href={`https://wa.me/91${d.mobile}`} target="_blank" rel="noreferrer" className="commsLink"><button className="cardActionBtn"><FiMessageCircle className="dashboardIcon" /> WhatsApp</button></a>
                          </div>
                          <div className="actionBtnRightGroup">
                            <button className="cardActionBtn actionBtnHistory" onClick={() => setSelectedDonor(d)}><FiFileText className="dashboardIcon" /> History</button>
                            <button className="cardActionBtn actionBtnRecord" onClick={() => setDonationDonor(d)}>➕ Log Donation</button>
                          </div>
                        </div>
                      </div>
                    );
                    })}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {showGlobalLogger && (
        <div className="modalOverlay" onClick={() => { setShowGlobalLogger(false); setManualRegNo(""); setManualDonorFound(null); }}>
          <div className="modalWindow" onClick={(e) => e.stopPropagation()}>
            <div className="modalWindowHeader">
              <h2>Log External Donation Record</h2>
              <button className="modalCloseCorner" onClick={() => { setShowGlobalLogger(false); setManualRegNo(""); setManualDonorFound(null); }}>✕</button>
            </div>
            <div className="modalWindowContent">
              <div className="formGroupInline" style={{ marginBottom: "20px" }}>
                <label className="modalInputLabel">Enter Donor Register Number</label>
                <input type="text" placeholder="e.g. 312224104001" value={manualRegNo} onChange={(e) => setManualRegNo(e.target.value)} className="dashboardInput textInputBold" />
                {manualRegNo.trim() && (
                  <div className={`realtimeVerifyFeedback ${manualDonorFound ? "matched" : "failed"}`}>
                    {manualDonorFound ? <><FiCheckCircle className="dashboardIcon" /> Found Asset: {manualDonorFound.name} ({manualDonorFound.bloodGroup})</> : <><FiXCircle className="dashboardIcon" /> No identity found matching this input</>}
                  </div>
                )}
              </div>
              <div className="formGroupInline">
                <label className="modalInputLabel">Donor Verified Name</label>
                <input type="text" value={manualDonorFound ? manualDonorFound.name : ""} readOnly placeholder="Autofilled from database profile" className="dashboardInput disabledInput" />
              </div>
              <div className="formGroupInline"><label className="modalInputLabel">Receiver Hospital</label><input placeholder="Hospital Compound Location" value={hospital} onChange={(e) => setHospital(e.target.value)} className="dashboardInput" /></div>
              <div className="formGroupInline"><label className="modalInputLabel">Donation Event Date</label><input type="date" value={donationDate} onChange={(e) => setDonationDate(e.target.value)} className="dashboardInput" /></div>
              <div className="formGroupInline"><label className="modalInputLabel">Units Donated</label><input type="number" placeholder="Number of units" value={donationUnits} onChange={(e) => setDonationUnits(e.target.value)} className="dashboardInput" /></div>
            </div>
            <div className="modalWindowFooter">
              <button className="closeModalBtn inlineBtn secondaryBtn" onClick={() => { setShowGlobalLogger(false); setManualRegNo(""); setManualDonorFound(null); }}>Cancel</button>
              <button className="closeModalBtn inlineBtn primaryBtn" onClick={recordGlobalManualDonation} disabled={!manualDonorFound} style={{ opacity: manualDonorFound ? 1 : 0.4 }}>Save Record</button>
            </div>
          </div>
        </div>
      )}

      {detailsDonor && (
        <div className="modalOverlay" onClick={() => setDetailsDonor(null)}>
          <div className="modalWindow detailsModal" onClick={(e) => e.stopPropagation()}>
            <div className="modalWindowHeader">
              <h2>Full Record Profile</h2>
              <button className="modalCloseCorner" onClick={() => setDetailsDonor(null)}>✕</button>
            </div>
            <div className="modalWindowContent">
              <div className="fullDetailsList">
                <div className="detailRow"><span>Full Name:</span> <strong>{displayValue(detailsDonor.name)}</strong></div>
                <div className="detailRow"><span>Age:</span> <strong>{displayValue(detailsDonor.age)}</strong></div>
                <div className="detailRow"><span>Email:</span> <strong>{displayValue(detailsDonor.email)}</strong></div>
                <div className="detailRow"><span>Mobile Phone:</span> <strong>{displayValue(detailsDonor.mobile)}</strong></div>
                <div className="detailRow"><span>Weight:</span> <strong>{detailsDonor.weight ? `${detailsDonor.weight} kg` : "N/A"}</strong></div>
                <div className="detailRow"><span>Blood Group:</span> <strong className="highlightRed textLarge">{displayValue(detailsDonor.bloodGroup)}</strong></div>
                <div className="detailRow"><span>System Role:</span> <strong className="capitalizeText">{displayValue(detailsDonor.role)}</strong></div>
                <div className="detailRow"><span>Department:</span> <strong>{displayValue(detailsDonor.department)}</strong></div>
                {detailsDonor.role === "student" && (
                  <>
                    <div className="detailRow"><span>Academic Year:</span> <strong>{displayValue(detailsDonor.year)}</strong></div>
                    <div className="detailRow"><span>Register Number:</span> <strong>{displayValue(detailsDonor.registerNumber)}</strong></div>
                    <div className="detailRow"><span>Residence Type:</span> <strong>{displayValue(detailsDonor.residenceType)}</strong></div>
                  </>
                )}
                {detailsDonor.role === "faculty" && (
                  <div className="detailRow"><span>Faculty ID:</span> <strong>{displayValue(detailsDonor.facultyId)}</strong></div>
                )}
                <div className="detailRow"><span>Address:</span> <strong>{displayValue(detailsDonor.address, "Not Added")}</strong></div>
                <div className="detailRow"><span>Donated Before:</span> <strong>{detailsDonor.hasDonatedBefore ? "Yes" : "No"}</strong></div>
                {detailsDonor.hasDonatedBefore && detailsDonor.lastDonationDate && (
                  <div className="detailRow"><span>Last Donation:</span> <strong>{new Date(detailsDonor.lastDonationDate).toDateString()}</strong></div>
                )}
              </div>
            </div>
            <div className="modalWindowFooter"><button className="closeModalBtn" onClick={() => setDetailsDonor(null)}>Dismiss</button></div>
          </div>
        </div>
      )}

      {selectedDonor && (
        <div className="modalOverlay" onClick={() => setSelectedDonor(null)}>
          <div className="modalWindow" onClick={(e) => e.stopPropagation()}>
            <div className="modalWindowHeader"><h2>Donation History Logs</h2><button className="modalCloseCorner" onClick={() => setSelectedDonor(null)}>✕</button></div>
            <div className="modalWindowContent">
              <h3>{selectedDonor.name}</h3>
              <p className="modalSubheaderInfo">Blood Type: {selectedDonor.bloodGroup}</p>
              <div className="historyTimeline professionalTimeline">
                {selectedDonor.donationHistory?.map((h, i) => (
                  <div key={i} className="timelineNode professionalNode">
                    <p className="nodeDate">📅 {new Date(h.date).toDateString()} — <MdBloodtype className="dashboardIcon" /> {h.units || "N/A"} Units</p>
                    <p className="timelineDesc">🏥 <strong>Location:</strong> {h.hospital}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="modalWindowFooter"><button className="closeModalBtn" onClick={() => setSelectedDonor(null)}>Close</button></div>
          </div>
        </div>
      )}

      {donationDonor && (
        <div className="modalOverlay" onClick={() => setDonationDonor(null)}>
          <div className="modalWindow" onClick={(e) => e.stopPropagation()}>
            <div className="modalWindowHeader">
              <h2>Record New Donation Event</h2>
              <button className="modalCloseCorner" onClick={() => setDonationDonor(null)}>✕</button>
            </div>
            <div className="modalWindowContent">
              <p className="donationTargetTitle">Logging details for: <strong>{donationDonor.name}</strong></p>
              <div className="formGroupInline"><label className="modalInputLabel">Receiver Hospital</label><input placeholder="Hospital Compound Name" value={hospital} onChange={(e) => setHospital(e.target.value)} className="dashboardInput" /></div>
              <div className="formGroupInline"><label className="modalInputLabel">Donation Date</label><input type="date" value={donationDate} onChange={(e) => setDonationDate(e.target.value)} className="dashboardInput" /></div>
              <div className="formGroupInline"><label className="modalInputLabel">Units Donated</label><input type="number" placeholder="Number of units (e.g. 1)" value={donationUnits} onChange={(e) => setDonationUnits(e.target.value)} className="dashboardInput" /></div>
            </div>
            <div className="modalWindowFooter">
              <button className="closeModalBtn inlineBtn secondaryBtn" onClick={() => setDonationDonor(null)}>Cancel</button>
              <button className="closeModalBtn inlineBtn primaryBtn" onClick={recordDonation}>Save Donation Records</button>
            </div>
          </div>
        </div>
      )}

      {confirmDialog.show && (
        <div className="modalOverlay" onClick={() => setConfirmDialog({ show: false, title: "", message: "", onConfirm: null })}>
          <div className="modalWindow confirmDialog" onClick={(e) => e.stopPropagation()}>
            <h3 className="confirmTitle">{confirmDialog.title}</h3>
            <p className="confirmMsg">{confirmDialog.message}</p>
            <div className="modalWindowFooter" style={{ justifyContent: "center" }}>
              <button
                className="closeModalBtn inlineBtn secondaryBtn"
                onClick={() => setConfirmDialog({ show: false, title: "", message: "", onConfirm: null })}
              >
                Cancel
              </button>
              <button className="closeModalBtn inlineBtn primaryBtn" onClick={confirmDialog.onConfirm}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {toast.show && (
        <div className={`toastBanner ${toast.type === "error" ? "error" : ""}`}>
          <span className="toastIcon">{toast.type === "error" ? "⚠️" : "✅"}</span>
          <span className="toastMessage">{toast.message}</span>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;