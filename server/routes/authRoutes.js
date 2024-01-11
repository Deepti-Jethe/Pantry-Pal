const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { sign } = require("jsonwebtoken");
const db = require("../database");

// Registration
router.post("/register", async (req, res) => {
  const {
    name,
    dateofbirth,
    phone,
    address,
    city,
    state,
    pincode,
    password,
    role,
  } = req.body;

  try {
    const connection = await db.getConnection();
    const hash = await bcrypt.hash(password, 10);
    const [rows] = await connection.execute(
      "INSERT INTO users (name, dateofbirth, phone, address, city, state, pincode, password, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [name, dateofbirth, phone, address, city, state, pincode, hash, role]
    );

    connection.release();

    console.log("Registration successful");
    res.status(200).send("Registration successful");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error registering a shopkeeper");
  }
});

// login
router.post("/login", async (req, res) => {
  const { phone, password } = req.body;

  try {
    const connection = await db.getConnection();
    const [rows] = await connection.execute(
      "SELECT * FROM users WHERE phone = ?",
      [phone]
    );

    if (rows.length > 0) {
      const match = await bcrypt.compare(password, rows[0].password);

      if (match) {
        const accessToken = sign(
          { phone: rows[0].phone, id: rows[0].id, role: rows[0].role },
          "importantsecret"
        );

        res.status(200).json({
          token: accessToken,
          id: rows[0].id,
          phone: rows[0].phone,
          role: rows[0].role,
        });
      } else {
        res.status(401).json({ error: "Wrong Phone and Password Combination" });
      }
    } else {
      res.status(404).json({ message: "Phone number not registered!" });
    }

    connection.release();
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Internal Server Error" });
  }
});

module.exports = router;
