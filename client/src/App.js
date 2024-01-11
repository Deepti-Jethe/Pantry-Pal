import "./App.css";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import Home from "./pages/Home";
import Registration from "./pages/Registration";
import Login from "./pages/Login";
import { useEffect, useState } from "react";
import axios from "axios";
import { AuthContext } from "./helpers/AuthContext";
import AddProduct from "./pages/AddProduct";
import ExpiringProducts from "./pages/ExpiringProducts";
import ViewCart from "./pages/ViewCart";
import OrderDetails from "./pages/OrderDetails";
import ShopkeeperOrderDetails from "./pages/ShopkeeperOrderDetails";
import ErrorPage from "./pages/ErrorPage";

function App() {
  const [authState, setAuthState] = useState({
    role: "",
    id: 0,
    status: false,
  });

  useEffect(() => {
    axios
      .get("http://localhost:3001/login", {
        headers: {
          accessToken: localStorage.getItem("accessToken"),
        },
      })
      .then((response) => {
        if (response.data.error) {
          setAuthState((prevAuthState) => ({
            ...prevAuthState,
            status: false,
          }));
        } else {
          setAuthState({
            role: response.data.role,
            id: response.data.id,
            status: true,
          });
        }
      })
      .catch((error) => {
        console.error("Error fetching login data:", error);
      });
  }, []);

  const logout = () => {
    localStorage.removeItem("accessToken");
    setAuthState({ role: "", id: 0, status: false });
  };

  return (
    <div className="App">
      <AuthContext.Provider value={{ authState, setAuthState }}>
        <Router>
          <div className="navbar">
            {!authState.status ? (
              <div className="loggedoutnavbar">
                <Link to="/"> Home </Link>
                <Link to="/login"> Login </Link>
                <Link to="/registration"> Registration </Link>
              </div>
            ) : (
              <div className="loggedinnavbar">
                <Link to="/"> Home </Link>
                {authState.status && authState.role === "customer" && (
                  <Link to="/orderDetails"> Order Details </Link>
                )}
                {authState.status && authState.role === "shopkeeper" && (
                  <Link to="/shopkeeperOrderDetails"> Order Details </Link>
                )}
                {authState.status && authState.role === "shopkeeper" && (
                  <Link to="/addProduct"> Add Product </Link>
                )}
                {authState.status && authState.role === "shopkeeper" && (
                  <Link to="/expiringProducts"> Expiring Products </Link>
                )}
                <Link to="/">
                  <button onClick={logout}> Logout </button>
                </Link>
              </div>
            )}
          </div>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/registration" element={<Registration />} />
            <Route path="/login" element={<Login />} />
            <Route path="/addProduct" element={<AddProduct />} />
            <Route path="/expiringProducts" element={<ExpiringProducts />} />
            <Route path="/viewCart" element={<ViewCart />} />
            <Route path="/orderDetails" element={<OrderDetails />} />
            <Route
              path="/shopkeeperOrderDetails"
              element={<ShopkeeperOrderDetails />}
            />
            <Route path="*" element={<ErrorPage />} />
          </Routes>
        </Router>
      </AuthContext.Provider>
    </div>
  );
}

export default App;
