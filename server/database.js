const mysql = require("mysql2/promise");

const db = mysql.createPool({
  user: "root",
  host: "localhost",
  password: "password",
  database: "onedesktopsolution",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = db;
