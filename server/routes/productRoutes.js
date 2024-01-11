const express = require("express");
const router = express.Router();
const db = require("../database");
const { validateShopkeeperToken } = require("../middlewares/isShopkeeperAuth");
const { addDays, format } = require("date-fns");

// Add Product
router.post("/addProduct", validateShopkeeperToken, async (req, res) => {
  const {
    name,
    specifics,
    dateofpurchase,
    quantity,
    purchaseprice,
    discount,
    mrp,
    expirydate,
  } = req.body;

  try {
    const connection = await db.getConnection();
    const [result] = await connection.execute(
      "INSERT INTO products (name, specifics, dateofpurchase, quantity, purchaseprice, discount, mrp, expirydate) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        name,
        specifics,
        dateofpurchase,
        quantity,
        purchaseprice,
        discount,
        mrp,
        expirydate,
      ]
    );

    connection.release();

    console.log("Product added successfully");
    res.status(200).send("Product added successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error adding a product");
  }
});

// Get All Products
router.get("/getProducts", async (req, res) => {
  try {
    const connection = await db.getConnection();
    const [result] = await connection.execute(
      "SELECT * FROM products WHERE refund = -1"
    );

    connection.release();

    if (result.length > 0) {
      const listOfProducts = result;
      res.json({
        listOfProducts: listOfProducts,
      });
    } else {
      res.send({ message: "No products!" });
    }
  } catch (error) {
    console.error("Error in get products route:", error);
    res.send({ error: "Internal Server Error" });
  }
});

// Get Expiring Products
router.get(
  "/getExpiringProducts",
  validateShopkeeperToken,
  async (req, res) => {
    try {
      const connection = await db.getConnection();
      const thirtyDaysFromNow = addDays(new Date(), 30);

      const formattedThirtyDaysFromNow = format(
        thirtyDaysFromNow,
        "yyyy-MM-dd"
      );

      const [result] = await connection.execute(
        "SELECT * FROM products WHERE expirydate <=  ?",
        [formattedThirtyDaysFromNow]
      );

      connection.release();

      if (result.length > 0) {
        const listOfExpiringProducts = result;
        res.json({
          listOfExpiringProducts: listOfExpiringProducts,
        });
      } else {
        res.send({
          message: "No upcoming expiring products within the next 30 days!",
        });
      }
    } catch (error) {
      console.error("Error in get upcoming expiring products route:", error);
      res.send({ error: "Internal Server Error" });
    }
  }
);

// Return Product
router.post("/returnProduct", validateShopkeeperToken, async (req, res) => {
  const { id, refund } = req.body;

  try {
    const connection = await db.getConnection();

    const [productResult] = await connection.execute(
      "SELECT * FROM products WHERE id = ?",
      [id]
    );

    if (productResult.length === 0) {
      res.status(404).json({ error: "Product not found" });
      return;
    }

    const product = productResult[0];

    var updatedRefund = parseFloat(product.refund) + parseFloat(refund);
    if (product.refund === -1) {
      updatedRefund = parseFloat(refund);
    }
    await connection.execute("UPDATE products SET refund = ? WHERE id = ?", [
      updatedRefund,
      id,
    ]);

    connection.release();

    res.status(200).json({ message: "Product returned successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//front ahead search
router.get("/liveSearch", async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ error: "Missing search query parameter." });
    }

    const connection = await db.getConnection();

    const [result] = await connection.execute(
      "SELECT * FROM products WHERE name LIKE ?",
      [`%${q}%`]
    );

    connection.release();

    res.json({ results: result });
  } catch (error) {
    console.error("Error in live product search route:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
