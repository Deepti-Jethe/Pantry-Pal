import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Registration() {
  const [name, setName] = useState("");
  const [dateofbirth, setDateofbirth] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("shopkeeper");

  let navigate = useNavigate();

  const register = () => {
    axios
      .post("http://localhost:3001/auth/register", {
        name: name,
        dateofbirth: dateofbirth,
        phone: phone,
        address: address,
        city: city,
        state: state,
        pincode: pincode,
        password: password,
        role: role,
      })
      .then((response) => {
        console.log(response);
        alert("Registration Successful!");
        navigate("/");
      })
      .catch((error) => {
        console.error("Registration failed:", error);
        alert("Registration failed. Please try again.");
      });
  };

  return (
    <div className="form">
      <h1>Registration</h1>
      <label>Name: </label>
      <input type="text" onChange={(event) => setName(event.target.value)} />
      <label>Date Of Birth: </label>
      <input
        type="date"
        onChange={(event) => setDateofbirth(event.target.value)}
      />
      <label>Phone: </label>
      <input type="text" onChange={(event) => setPhone(event.target.value)} />
      <label>Address: </label>
      <input type="text" onChange={(event) => setAddress(event.target.value)} />
      <label>City: </label>
      <input type="text" onChange={(event) => setCity(event.target.value)} />
      <label>State: </label>
      <input type="text" onChange={(event) => setState(event.target.value)} />
      <label>Pincode: </label>
      <input type="text" onChange={(event) => setPincode(event.target.value)} />
      <label>Password: </label>
      <input
        type="password"
        onChange={(event) => setPassword(event.target.value)}
      />
      <label>Role: </label>
      <select
        value={role}
        onChange={(event) => {
          setRole(event.target.value);
        }}
      >
        <option value="shopkeeper">Shopkeeper</option>
        <option value="customer">Customer</option>
      </select>

      <button onClick={register}>Register</button>
    </div>
  );
}

export default Registration;
