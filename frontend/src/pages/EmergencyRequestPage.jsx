import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./EmergencyRequestPage.css";

const ALL_BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

function EmergencyRequestPage() {
  const { id } = useParams();

  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registerNumber, setRegisterNumber] = useState("");
  const [donor, setDonor] = useState(null);
  const [selectedResponseBloodGroup, setSelectedResponseBloodGroup] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const loadRequest = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/emergency-request/${id}`);
        const data = await res.json();
        setRequest(data);
        const groups = data?.bloodGroup === "ALL"
          ? ALL_BLOOD_GROUPS
          : data?.bloodGroup?.split(",").map((g) => g.trim()).filter(Boolean) || [];
        if (groups.length === 1) {
          setSelectedResponseBloodGroup(groups[0]);
        }
      } catch (error) {
        console.log(error);
      }
      setLoading(false);
    };

    loadRequest();
  }, [id]);

  const fetchDonor = async () => {
    if (!registerNumber) {
      alert("Please enter your Register / Faculty Number");
      return;
    }
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/donors`);
      const data = await res.json();
      const found = data.find((d) => d.registerNumber === registerNumber);
      if (!found) {
        alert("Donor profile not found in network registries.");
        return;
      }
      setDonor(found);
      if (requestBloodGroupOptions.includes(found.bloodGroup)) {
        setSelectedResponseBloodGroup(found.bloodGroup);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const respondWilling = async () => {
    if (!donor) {
      alert("Please authenticate and fetch your profile details first.");
      return;
    }
    if (!selectedResponseBloodGroup) {
      alert("Please select your blood group from the required list before responding.");
      return;
    }
    if (donor.bloodGroup !== selectedResponseBloodGroup) {
      alert("Please select the blood group that matches your registered donor profile.");
      return;
    }
    await fetch(`${import.meta.env.VITE_API_URL}/emergency-request/${id}/willing`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        donorName: donor.name,
        mobile: donor.mobile,
        department: donor.department,
        year: donor.year,
        registerNumber: donor.registerNumber,
        bloodGroup: selectedResponseBloodGroup,
      }),
    });
    setSubmitted(true);
  };

  const respondUnavailable = async () => {
    if (!donor) {
      alert("Please authenticate and fetch your profile details first.");
      return;
    }
    if (!selectedResponseBloodGroup) {
      alert("Please select your blood group from the required list before responding.");
      return;
    }
    if (donor.bloodGroup !== selectedResponseBloodGroup) {
      alert("Please select the blood group that matches your registered donor profile.");
      return;
    }
    await fetch(`${import.meta.env.VITE_API_URL}/emergency-request/${id}/unavailable`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        donorName: donor.name,
        mobile: donor.mobile,
        department: donor.department,
        year: donor.year,
        registerNumber: donor.registerNumber,
        bloodGroup: selectedResponseBloodGroup,
      }),
    });
    setSubmitted(true);
  };

  if (loading) {
    return (
      <div className="stateContainer">
        <div className="statusLoadingSpinner">🔄</div>
        <p className="statusText">Resolving Triage Vector...</p>
      </div>
    );
  }

  if (request?.status === "CLOSED") {
    return (
      <div className="stateContainer textCenter">
        <div className="statusIcon closed">✅</div>
        <h1 className="statusHeading success">Requirement Fulfilled</h1>
        <p className="statusMessage">This emergency broadcast has been successfully addressed and closed by system dispatchers. Thank you for your readiness.</p>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="stateContainer textCenter">
        <div className="statusIcon acknowledged">❤️</div>
        <h1 className="statusHeading acknowledged">Response Registered</h1>
        <p className="statusMessage">Your deployment availability matrix code was appended to the supervisor stream safely. The command center has been synchronized.</p>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="stateContainer textCenter">
        <div className="statusIcon error">⚠️</div>
        <h1 className="statusHeading error">Request Invalid</h1>
        <p className="statusMessage">The active routing identifier could not find any active emergency parameters matching this digital key header.</p>
      </div>
    );
  }

  const requestBloodGroupOptions = request?.bloodGroup === "ALL"
    ? ALL_BLOOD_GROUPS
    : request?.bloodGroup?.split(",").map((g) => g.trim()).filter(Boolean) || [];

  const bloodGroupDisplay =
    request.bloodGroup === "ALL"
      ? "ALL GROUPS"
      : requestBloodGroupOptions.join(" · ");

  return (
    <div className="emergencyPage">
      <div className="emergencyCard">
        {/* Header Alert Flag */}
        <div className="crisisBanner">
          <span className="pulseCircle"></span>
          CRITICAL EMERGENCY REQUEST
        </div>

        {/* Essential Core Attributes */}
        <div className="bloodGroupContainer">
          <div className="bloodLabel">REQUIRED TYPE</div>
          <div className={`bloodValue ${request.bloodGroup === "ALL" || request.bloodGroup.includes(",") ? "multiGroup" : ""}`}>{bloodGroupDisplay}</div>
        </div>

        <div className="requestDataBlock">
          <div className="dataRowItem">
            <span className="rowLabel">🏥 Institution Hub</span>
            <span className="rowValue highlight">{request.hospital}</span>
          </div>
          <div className="dataRowItem">
            <span className="rowLabel">🩸 Volume Allocation</span>
            <span className="rowValue highlight">{request.unitsNeeded} Units</span>
          </div>
        </div>

        <div className="verificationSection">
          <h3>🔐 Verify Identity Network Handle</h3>
          <p className="fieldCaption">Verify your credentials to choose your response vector state safely.</p>
          
          <div className="searchBarInline">
            <input
              placeholder="Enter Register / Staff ID"
              value={registerNumber}
              onChange={(e) => setRegisterNumber(e.target.value)}
              className="emergencyInput"
            />
            <button onClick={fetchDonor} className="verifyBtn">
              Fetch Profile
            </button>
          </div>
        </div>

        {donor && (
          <div className="bloodGroupSelectSection">
            <label className="selectLabel">🩸 Enter your blood group</label>
            <select
              className="bloodGroupSelect"
              value={selectedResponseBloodGroup}
              onChange={(e) => setSelectedResponseBloodGroup(e.target.value)}
            >
              <option value="">Select blood group</option>
              {requestBloodGroupOptions.map((group) => (
                <option key={group} value={group}>
                  {group}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Dynamically Render Verified Individual Data Card */}
        {donor && (
          <div className="donorVerificationTicket animateFadeIn">
            <div className="ticketHeader">🔒 Synchronized Network Profile</div>
            <div className="ticketGrid">
              <p><strong>Identity:</strong> {donor.name}</p>
              <p><strong>Registry Type:</strong> {donor.bloodGroup}</p>
              <p><strong>Sector:</strong> {donor.department}</p>
              <p><strong>Matrix Year:</strong> {donor.year || "Faculty Chair"}</p>
              <p className="fullWidth"><strong>Routing Line:</strong> {donor.mobile}</p>
            </div>
          </div>
        )}

        {/* Unified Mobile Touch Control Footprint */}
        <div className="triageActionFootprint">
          <button onClick={respondWilling} className="triageBtn willing">
            ✅ Confirm Immediate Deployment
          </button>
          <button onClick={respondUnavailable} className="triageBtn unavailable">
            ❌ Declare Out-of-Service Profile
          </button>
        </div>
      </div>
    </div>
  );
}

export default EmergencyRequestPage;