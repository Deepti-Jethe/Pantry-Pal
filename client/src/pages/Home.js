import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../helpers/AuthContext";
import { Link } from "react-router-dom";

function Home() {
  const { authState } = useContext(AuthContext);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [listOfProducts, setListOfProducts] = useState([]);
  const [quantities, setQuantities] = useState({});

  useEffect(() => {
    if (searchQuery.trim() !== "") {
      axios
        .get(`http://localhost:3001/products/liveSearch?q=${searchQuery}`)
        .then((response) => {
          setSearchResults(response.data.results);
        });
    } else {
      axios
        .get("http://localhost:3001/products/getProducts")
        .then((response) => {
          setListOfProducts(response.data.listOfProducts);
        });
      setSearchResults([]);
    }
  }, [searchQuery]);

  const handleIncrement = (productId, maxQuantity) => {
    setQuantities((prevQuantities) => ({
      ...prevQuantities,
      [productId]: Math.min((prevQuantities[productId] || 0) + 1, maxQuantity),
    }));
  };

  const handleDecrement = (productId) => {
    setQuantities((prevQuantities) => ({
      ...prevQuantities,
      [productId]: Math.max((prevQuantities[productId] || 0) - 1, 0),
    }));
  };

  const handleAddToCart = (productId, productName) => {
    const quantity = quantities[productId] || 0;
    const billid = null;

    axios
      .post(
        "http://localhost:3001/cart/addToCart",
        {
          userId: authState.id,
          productId: productId,
          quantity: quantity,
          billId: billid,
        },
        {
          headers: {
            accessToken: localStorage.getItem("accessToken"),
          },
        }
      )
      .then((response) => {
        console.log(response.data);
        alert(`${quantity} ${productName}(s) added to cart`);
        setQuantities((prevQuantities) => ({
          ...prevQuantities,
          [productId]: 0,
        }));
      })
      .catch((error) => {
        console.error("Error adding to cart:", error);
        alert("Error adding to cart:", error);
      });
  };

  return (
    <div className="Home">
      <h1>Home</h1>
      <input
        className="searchBox"
        type="text"
        placeholder="Search products..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      {(searchQuery.trim() === "" ? listOfProducts : searchResults).map(
        (value, key) => {
          const productId = value.id;
          const maxQuantity = value.quantity;

          return (
            <div key={key} className="product">
              <h3>{value.name}</h3>
              <ul>
                <li>MRP: Rs. {value.mrp}</li>
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
              </ul>
              {authState.status && authState.role === "customer" && (
                <div>
                  <button onClick={() => handleDecrement(productId)}>-</button>
                  <span>{quantities[productId] || 0}</span>
                  <button
                    onClick={() => handleIncrement(productId, maxQuantity)}
                  >
                    +
                  </button>
                  <button
                    onClick={() => handleAddToCart(productId, value.name)}
                  >
                    Add to Cart
                  </button>
                </div>
              )}
            </div>
          );
        }
      )}

      {authState.status && authState.role === "customer" && (
        <Link to="/viewCart">
          <button>View Cart</button>
        </Link>
      )}
    </div>
  );
}

export default Home;
