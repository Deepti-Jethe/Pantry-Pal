import React from "react";
import { useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../helpers/AuthContext";

function Login() {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");

  const { setAuthState } = useContext(AuthContext);

  let navigate = useNavigate();

  const login = () => {
    const data = { phone: phone, password: password };
    axios.post("http://localhost:3001/auth/login", data).then((response) => {
      if (response.data.error) {
        alert(response.data.error);
      } else {
        localStorage.setItem("accessToken", response.data.token);
        setAuthState({
          role: response.data.role,
          id: response.data.id,
          status: true,
        });
        if (response.data.role === "customer") {
          navigate("/");
        } else {
          navigate("/expiringProducts");
        }
      }
    });
  };

  return (
    <div className="form">
      <h1>Login</h1>
      <label>Phone: </label>
      <input
        type="tel"
        onChange={(event) => {
          setPhone(event.target.value);
        }}
      />
      <label>Password: </label>
      <input
        type="password"
        onChange={(event) => {
          setPassword(event.target.value);
        }}
      />
      <button onClick={login}>Login</button>
    </div>
  );
}

export default Login;
