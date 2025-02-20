// src/config/mysql.js
const mysql = require("mysql");
const dotenv = require("dotenv");

dotenv.config(); // Load biến môi trường từ .env

const connectMysqlDB = mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "",
  database: process.env.DB_NAME || "test",
});

connectMysqlDB.connect((err) => {
  if (err) {
    console.error("❌ Database connection failed:", err);
    return;
  }
  console.log(`✅ Connected to MySQL user ${process.env.DB_NAME}`);
});

module.exports = connectMysqlDB;
