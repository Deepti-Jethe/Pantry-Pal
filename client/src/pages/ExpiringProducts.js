import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../helpers/AuthContext";

function ExpiringProducts() {
  const { authState } = useContext(AuthContext);
  const [listOfExpiringProducts, setListOfExpiringProducts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("http://localhost:3001/products/getExpiringProducts", {
        headers: {
          accessToken: localStorage.getItem("accessToken"),
        },
      })
      .then((response) => {
        setListOfExpiringProducts(response.data.listOfExpiringProducts);
      });
  }, []);

  if (!listOfExpiringProducts || listOfExpiringProducts.length === 0) {
    navigate("/");
    return null;
  }

  const returnProduct = (id) => {
    const refund = prompt("Enter refund amount received:");

    if (refund !== null) {
      axios
        .post(
          "http://localhost:3001/products/returnProduct",
          {
            id,
            refund,
          },
          {
            headers: {
              accessToken: localStorage.getItem("accessToken"),
            },
          }
        )
        .then((response) => {
          alert("Refund updated successfully");
          console.log(response.data);
          const updatedProducts = listOfExpiringProducts.map((product) =>
            product.id === id
              ? {
                  ...product,
                  refund:
                    product.refund === -1
                      ? parseFloat(refund)
                      : parseFloat(refund) + parseFloat(product.refund),
                }
              : product
          );

          setListOfExpiringProducts(updatedProducts);
        })
        .catch((error) => {
          alert("Error returning product:", error);
          console.error("Error returning product:", error);
        });
    }
  };

  return (
    <div className="expiringProducts">
      {authState.status && authState.role === "shopkeeper" ? (
        <div>
          <h1>Expiring Products</h1>
          {listOfExpiringProducts.map((value, key) => {
            return (
              <div key={key} className="product">
                <h1>{value.name}</h1>
                <ul>
                  <li>Purchase price: Rs. {value.purchaseprice}</li>
                  <li>Discount: {value.discount}%</li>
                  <li>MRP: Rs. {value.mrp}</li>
                  <li>
                    Date of Purchase:{" "}
                    {new Date(value.dateofpurchase).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </li>
                  <li>
                    Expiry Date:{" "}
                    {new Date(value.expirydate).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </li>
                  <li>
                    Quantity available: {value.quantity} {value.specifics}
                  </li>
                  <li>
                    Expected return amount: Rs.{" "}
                    {(
                      ((value.purchaseprice * (100 - value.discount)) / 100) *
                      value.quantity
                    ).toFixed(2)}
                  </li>
                </ul>
                {value.refund !== -1 ? (
                  <div className="refund-section">
                    <p className="refund-info">
                      Refund received: Rs. {value.refund}
                    </p>
                    <button
                      className="update-refund"
                      onClick={() => returnProduct(value.id)}
                    >
                      Update Refund
                    </button>
                  </div>
                ) : (
                  <button onClick={() => returnProduct(value.id)}>
                    Return Product
                  </button>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        navigate("*")
      )}
    </div>
  );
}

export default ExpiringProducts;
