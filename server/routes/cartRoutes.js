const express = require("express");
const router = express.Router();
const db = require("../database");
const { validateCustomerToken } = require("../middlewares/isCustomerAuth");
const { validateShopkeeperToken } = require("../middlewares/isShopkeeperAuth");

// Add Product to Cart
router.post("/addToCart", validateCustomerToken, async (req, res) => {
  const { userId, productId, quantity, billId } = req.body;

  try {
    const connection = await db.getConnection();

    if (!userId || !productId || !quantity || billId === undefined) {
      connection.release();
      return res
        .status(400)
        .json({ error: "Invalid request. Missing parameters." });
    }

    const [userResult] = await connection.execute(
      "SELECT * FROM users WHERE id = ?",
      [userId]
    );
    const [productResult] = await connection.execute(
      "SELECT * FROM products WHERE id = ?",
      [productId]
    );

    if (userResult.length === 0 || productResult.length === 0) {
      connection.release();
      return res.status(404).json({ error: "User or product not found." });
    }

    const [existingCartEntry] = await connection.execute(
      "SELECT * FROM cart WHERE userid = ? AND productid = ? AND billid IS NULL",
      [userId, productId]
    );

    if (existingCartEntry.length > 0) {
      await connection.execute(
        "UPDATE cart SET quantity = quantity + ? WHERE userid = ? AND productid = ? AND billid IS NULL",
        [quantity, userId, productId]
      );
    } else {
      await connection.execute(
        "INSERT INTO cart (userid, productid, quantity, billid) VALUES (?, ?, ?, ?)",
        [userId, productId, quantity, billId]
      );
    }

    connection.release();
    res
      .status(200)
      .json({ message: "Product added to the cart successfully." });
  } catch (error) {
    console.error("Error adding product to cart:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//View cart
router.get("/viewCart", validateCustomerToken, async (req, res) => {
  const { userId } = req.query;

  try {
    const connection = await db.getConnection();

    if (!userId) {
      connection.release();
      return res
        .status(400)
        .json({ error: "Invalid request. Missing parameters." });
    }

    const [userResult] = await connection.execute(
      "SELECT * FROM users WHERE id = ?",
      [userId]
    );

    if (userResult.length === 0) {
      connection.release();
      return res.status(404).json({ error: "User not found." });
    }

    const [cartResult] = await connection.execute(
      "SELECT cart.id as cartid, cart.userid as userid, products.id as productid, cart.quantity as quantity, cart.billid as billid, products.name as productname, products.specifics as specifics, products.dateofpurchase as dateofpurchase, products.quantity as totalquantity, products.purchaseprice as purchaseprice, products.discount as discount, products.mrp as mrp, products.expirydate as expirydate, products.refund as refund FROM cart JOIN products ON cart.productid = products.id WHERE cart.userid = ? AND cart.billid IS NULL",
      [userId]
    );

    connection.release();

    res.status(200).json({ cart: cartResult });
  } catch (error) {
    console.error("Error retrieving cart:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// remove item
router.post("/removeItem", validateCustomerToken, async (req, res) => {
  const { userid, productid } = req.body;

  try {
    const connection = await db.getConnection();

    const [userResult] = await connection.execute(
      "SELECT * FROM users WHERE id = ?",
      [userid]
    );
    const [productResult] = await connection.execute(
      "SELECT * FROM products WHERE id = ?",
      [productid]
    );

    if (userResult.length === 0 || productResult.length === 0) {
      connection.release();
      return res.status(404).json({ error: "User or product not found." });
    }

    await connection.execute(
      "DELETE FROM cart WHERE userid = ? AND productid = ? AND billid IS NULL",
      [userid, productid]
    );

    connection.release();

    res
      .status(200)
      .json({ message: "Item removed from the cart successfully." });
  } catch (error) {
    console.error("Error removing item from cart:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//place order
router.post("/placeOrder", validateCustomerToken, async (req, res) => {
  const { userid, totalamount } = req.body;

  try {
    const connection = await db.getConnection();

    await connection.beginTransaction();

    try {
      const [insertBillResult] = await connection.execute(
        "INSERT INTO bills (userid, totalamount) VALUES (?, ?)",
        [userid, totalamount]
      );

      const billId = insertBillResult.insertId;

      await connection.execute(
        "UPDATE cart SET billid = ? WHERE userid = ? AND billid IS NULL",
        [billId, userid]
      );

      await connection.commit();

      connection.release();

      res.status(200).json({ message: "Order placed successfully!" });
    } catch (error) {
      await connection.rollback();
      throw error;
    }
  } catch (error) {
    console.error("Error placing order:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//order details
router.get("/orderDetails", validateCustomerToken, async (req, res) => {
  console.log("Received orderDetails request");
  const { userId } = req.query;

  try {
    const connection = await db.getConnection();

    if (!userId) {
      connection.release();
      return res
        .status(400)
        .json({ error: "Invalid request. Missing parameters." });
    }

    const [userResult] = await connection.execute(
      "SELECT * FROM users WHERE id = ?",
      [userId]
    );

    if (userResult.length === 0) {
      connection.release();
      return res.status(404).json({ error: "User not found." });
    }

    const [cartResult] = await connection.execute(
      "SELECT cart.id as cartid, cart.userid as userid, products.id as productid, cart.quantity as quantity, cart.billid as billid, products.name as productname, products.specifics as specifics, products.dateofpurchase as dateofpurchase, products.quantity as totalquantity, products.purchaseprice as purchaseprice, products.discount as discount, products.mrp as mrp, products.expirydate as expirydate, products.refund as refund, bills.totalamount as totalamount, bills.paid as paid FROM cart JOIN products ON cart.productid = products.id JOIN bills ON cart.billid = bills.id WHERE cart.userid = ? AND cart.billid IS NOT NULL",
      [userId]
    );

    connection.release();
    console.log("Successful orderDetails request");

    res.status(200).json({ cart: cartResult });
  } catch (error) {
    console.error("Error retrieving cart:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Shopkeeper route to get order details
router.get(
  "/shopkeeper/orderDetails",
  validateShopkeeperToken,
  async (req, res) => {
    try {
      const connection = await db.getConnection();
      const [orderDetails] = await connection.execute(
        `
      SELECT 
        cart.id as cartid,
        cart.userid as userid,
        users.id as userid,
        users.name as name,
        users.phone as phone,
        users.address as address,
        users.city as city,
        users.state as state,
        users.pincode as pincode,
        products.id as productid,
        cart.quantity as quantity,
        cart.billid as billid,
        products.name as productname,
        products.mrp as mrp,
        bills.totalamount as totalamount,
        bills.paid as paid
      FROM 
        cart
      JOIN 
        products ON cart.productid = products.id
      JOIN 
        bills ON cart.billid = bills.id
      JOIN 
        users ON cart.userid = users.id
      WHERE 
        cart.billid IS NOT NULL
      `,
        []
      );

      connection.release();
      console.log("Successful shopkeeper orderDetails request");

      res.status(200).json({ cart: orderDetails });
    } catch (error) {
      console.error("Error retrieving shopkeeper order details:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

//update payment status
router.put(
  "/updatePaymentStatus/:billId",
  validateShopkeeperToken,
  async (req, res) => {
    const billId = req.params.billId;

    try {
      await db.query("UPDATE bills SET paid = 1 WHERE id = ?", [billId]);

      res.status(200).json({ message: "Payment status updated successfully" });
    } catch (error) {
      console.error("Error updating payment status:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

module.exports = router;
