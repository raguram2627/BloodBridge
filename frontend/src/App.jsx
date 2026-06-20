import "./App.css";
import { useState } from "react";

function App() {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [department, setDepartment] = useState("");
  const [registerNumber, setRegisterNumber] = useState("");
  const [mobile, setMobile] = useState("");
  const [donors, setDonors] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const donorData = {
      role: "student",
      name,
      age,
      bloodGroup,
      department,
      registerNumber,
      mobile,
    };

    try {
      const response = await fetch(
        "http://localhost:5000/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(donorData),
        }
      );

      const data = await response.json();

      console.log(data);

      alert("Donor Registered Successfully");

      setName("");
      setAge("");
      setBloodGroup("");
      setDepartment("");
      setRegisterNumber("");
      setMobile("");
    } catch (error) {
      console.log(error);
      alert("Registration Failed");
    }
  };

  const fetchDonors = async () => {
    try {
      const response = await fetch(
        "http://localhost:5000/donors"
      );

      const data = await response.json();

      setDonors(data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="container">
      <h1>BloodBridge</h1>

      <h2>Student Registration</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="number"
          placeholder="Age"
          value={age}
          onChange={(e) => setAge(e.target.value)}
        />

        <input
          type="text"
          placeholder="Blood Group"
          value={bloodGroup}
          onChange={(e) => setBloodGroup(e.target.value)}
        />

        <input
          type="text"
          placeholder="Department"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
        />

        <input
          type="text"
          placeholder="Register Number"
          value={registerNumber}
          onChange={(e) => setRegisterNumber(e.target.value)}
        />

        <input
          type="text"
          placeholder="Mobile Number"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
        />

        <button type="submit">
          Register Donor
        </button>

        <button
          type="button"
          onClick={fetchDonors}
        >
          View Donors
        </button>
      </form>

      <h2>Donor List</h2>

      {donors.map((donor) => (
        <div key={donor._id}>
          <p><strong>Name:</strong> {donor.name}</p>
          <p><strong>Blood Group:</strong> {donor.bloodGroup}</p>
          <p><strong>Department:</strong> {donor.department}</p>
          <hr />
        </div>
      ))}
    </div>
  );
}

export default App;