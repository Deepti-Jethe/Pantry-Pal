import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../helpers/AuthContext";

function ViewCart() {
  const { authState } = useContext(AuthContext);
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (authState.status && authState.role === "customer") {
      fetchCart();
    } else {
      navigate("*");
    }
  }, [authState]);

  const fetchCart = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3001/cart/viewCart?userId=${authState.id}`,
        {
          headers: {
            accessToken: localStorage.getItem("accessToken"),
          },
        }
      );
      const groupedCart = groupCartItems(response.data.cart);
      setCart(groupedCart);
      calculateTotal(groupedCart);
    } catch (error) {
      console.error("Error fetching cart:", error);
    }
  };

  const groupCartItems = (cartItems) => {
    const groupedCart = {};
    cartItems.forEach((item) => {
      if (groupedCart[item.id]) {
        groupedCart[item.productid].quantity += item.quantity;
      } else {
        groupedCart[item.productid] = { ...item };
      }
    });

    return Object.values(groupedCart);
  };
  const calculateTotal = (cart) => {
    let calculatedTotal = 0;
    cart.forEach((item) => {
      calculatedTotal += item.mrp * item.quantity;
    });
    setTotal(calculatedTotal);
  };

  const removeItem = async (productid) => {
    try {
      await axios.post(
        "http://localhost:3001/cart/removeItem",
        {
          userid: authState.id,
          productid: productid,
        },
        {
          headers: {
            accessToken: localStorage.getItem("accessToken"),
          },
        }
      );

      alert("Item removed successfully!");
      fetchCart();
    } catch (error) {
      console.error("Error removing item from cart:", error);
    }
  };

  const placeOrder = async () => {
    try {
      const response = await axios.post(
        "http://localhost:3001/cart/placeOrder",
        {
          userid: authState.id,
          totalamount: total,
        },
        {
          headers: {
            accessToken: localStorage.getItem("accessToken"),
          },
        }
      );

      console.log(response.data);
      alert("Order placed successfully!");
      navigate("/");
    } catch (error) {
      console.error("Error placing order:", error);
    }
  };

  return (
    <div className="viewCart">
      <h1>View Cart</h1>
      {cart.map((item) => (
        <div key={item.productid} className="cart-item">
          <ul>
            <li>{item.productname}</li>
            <li>Quantity: {item.quantity}</li>
            <button
              className="remove-button"
              onClick={() => removeItem(item.productid)}
            >
              Remove
            </button>
          </ul>
        </div>
      ))}
      <p className="total">Total: {total}</p>
      <button className="place-order-btn" onClick={placeOrder}>
        Place Order
      </button>
    </div>
  );
}

export default ViewCart;
