import React from "react";
import { useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../helpers/AuthContext";

function AddProduct() {
  const { authState } = useContext(AuthContext);
  const [name, setName] = useState("");
  const [specifics, setSpecifics] = useState("");
  const [dateofpurchase, setDateofpurchase] = useState("");
  const [quantity, setQuantity] = useState("");
  const [purchaseprice, setPurchaseprice] = useState("");
  const [discount, setDiscount] = useState("");
  const [mrp, setMrp] = useState("");
  const [expirydate, setExpirydate] = useState("");

  let navigate = useNavigate();

  const addProduct = () => {
    axios
      .post(
        "http://localhost:3001/products/addProduct",
        {
          name: name,
          specifics: specifics,
          dateofpurchase: dateofpurchase,
          quantity: quantity,
          purchaseprice: purchaseprice,
          discount: discount,
          mrp: mrp,
          expirydate: expirydate,
        },
        {
          headers: {
            accessToken: localStorage.getItem("accessToken"),
          },
        }
      )
      .then((response) => {
        console.log(response);
        alert("Product added successfully!");
        navigate("/");
      })
      .catch((error) => {
        console.error("Try again!", error);

        alert("Please try again.");
      });
  };

  return (
    <div className="form">
      {!(authState.role === "shopkeeper") ? (
        navigate("/errorPage")
      ) : (
        <div>
          <h1>Add New Product</h1>
          <label>Name of the product: </label>
          <input
            type="text"
            onChange={(event) => {
              setName(event.target.value);
            }}
          />
          <label>Specifics: </label>
          <input
            type="text"
            onChange={(event) => {
              setSpecifics(event.target.value);
            }}
          />
          <label>Date Of Purchase: </label>
          <input
            type="date"
            onChange={(event) => {
              setDateofpurchase(event.target.value);
            }}
          />
          <label>Quantity: </label>
          <input
            type="number"
            onChange={(event) => {
              setQuantity(event.target.value);
            }}
          />
          <label>Purchase price: </label>
          <input
            type="number"
            onChange={(event) => {
              setPurchaseprice(event.target.value);
            }}
          />
          <label>discount: </label>
          <input
            type="number"
            onChange={(event) => {
              setDiscount(event.target.value);
            }}
          />
          <label>Mrp: </label>
          <input
            type="number"
            onChange={(event) => {
              setMrp(event.target.value);
            }}
          />
          <label>Expiry Date: </label>
          <input
            type="date"
            onChange={(event) => {
              setExpirydate(event.target.value);
            }}
          />

          <button onClick={addProduct}>Add Product</button>
        </div>
      )}
    </div>
  );
}

export default AddProduct;
