import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../helpers/AuthContext";

function OrderDetails() {
  const { authState } = useContext(AuthContext);
  const [orderDetails, setOrderDetails] = useState([]);
  let navigate = useNavigate();

  useEffect(() => {
    if (authState.status) {
      fetchOrderDetails();
    } else {
      navigate("*");
    }
  }, [authState]);

  const fetchOrderDetails = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3001/cart/orderDetails?userId=${authState.id}`,
        {
          headers: {
            accessToken: localStorage.getItem("accessToken"),
          },
        }
      );

      // Group order details based on bill ID
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
        };
      }

      groups[billId].items.push(item);
      return groups;
    }, {});
  };

  return (
    <div className="orderDetails">
      <h1>Order Details</h1>
      {Object.keys(orderDetails).map((billId) => (
        <div key={billId}>
          <h3>Bill ID: {billId}</h3>
          <p>Total Amount: {orderDetails[billId].totalAmount}</p>
          <p>
            Delivery and payment status:{" "}
            {orderDetails[billId].paid === 0 ? "Incomplete" : "Completed"}
          </p>
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

export default OrderDetails;
