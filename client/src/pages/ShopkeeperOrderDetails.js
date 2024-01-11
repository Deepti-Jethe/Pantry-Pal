import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../helpers/AuthContext";

function ShopkeeperOrderDetails() {
  const { authState } = useContext(AuthContext);
  const [orderDetails, setOrderDetails] = useState([]);
  let navigate = useNavigate();

  useEffect(() => {
    if (authState.status && authState.role === "shopkeeper") {
      fetchOrderDetails();
    } else {
      navigate("*");
    }
  }, [authState]);

  const fetchOrderDetails = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3001/cart/shopkeeper/orderDetails`,
        {
          headers: {
            accessToken: localStorage.getItem("accessToken"),
          },
        }
      );

      const groupedOrderDetails = groupByBillId(response.data.cart);
      setOrderDetails(groupedOrderDetails);
    } catch (error) {
      console.error("Error fetching order details:", error);
    }
  };

  const groupByBillId = (orderDetails) => {
    return orderDetails.reduce((groups, item) => {
      const billId = item.billid;

      if (!groups[billId]) {
        groups[billId] = {
          items: [],
          totalAmount: item.totalamount,
          paid: item.paid,
          userDetails: {
            userId: item.userid,
            name: item.name,
            phone: item.phone,
            address: item.address,
            city: item.city,
            state: item.state,
            pincode: item.pincode,
          },
        };
      }

      groups[billId].items.push(item);
      return groups;
    }, {});
  };

  const handleConfirmPayment = async (billId) => {
    try {
      await axios.put(
        `http://localhost:3001/cart/updatePaymentStatus/${billId}`,
        {
          headers: {
            accessToken: localStorage.getItem("accessToken"),
          },
        }
      );
      alert("Payment marked complete!");
      fetchOrderDetails();
    } catch (error) {
      console.error("Error confirming payment:", error);
    }
  };

  return (
    <div className="orderDetails">
      <h1>Order Details</h1>
      {Object.keys(orderDetails).map((billId) => (
        <div key={billId}>
          <h3>Bill ID: {billId}</h3>
          <h4>User Details:</h4>
          <p>
            User ID: {orderDetails[billId].userDetails.userId}, Name:{" "}
            {orderDetails[billId].userDetails.name}, Phone:{" "}
            {orderDetails[billId].userDetails.phone}
          </p>
          <p>
            Address: {orderDetails[billId].userDetails.address}, City:{" "}
            {orderDetails[billId].userDetails.city}, State:{" "}
            {orderDetails[billId].userDetails.state}, Pincode:{" "}
            {orderDetails[billId].userDetails.pincode}
          </p>
          <p>Total Amount: {orderDetails[billId].totalAmount}</p>
          <p>
            Delivery and payment status:{" "}
            {orderDetails[billId].paid === 0 ? "Incomplete" : "Completed"}
          </p>
          {orderDetails[billId].paid === 0 && (
            <button onClick={() => handleConfirmPayment(billId)}>
              Confirm Payment Completed
            </button>
          )}
          <table>
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Quantity</th>
                <th>MRP</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {orderDetails[billId].items.map((item) => (
                <tr key={item.cartid}>
                  <td>{item.productname}</td>
                  <td>{item.quantity}</td>
                  <td>{item.mrp}</td>
                  <td>{item.mrp * item.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

export default ShopkeeperOrderDetails;
