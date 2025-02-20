const mysql = require("mysql");
const dotenv = require("dotenv");

// dotenv.config(); // Load biến môi trường từ .env

const connectMysqlDB3 = mysql.createConnection({
  host: process.env.DB_HOST3 || "localhost",
  user: process.env.DB_USER3 || "root",
  password: process.env.DB_PASS3 || "",
  database: process.env.DB_NAME3 || "test",
});

connectMysqlDB3.connect((err) => {
  if (err) {
    console.error("❌ Database game connection failed:", err);
    return;
  }
  console.log(`✅ Connected to MySQL game ${process.env.DB_NAME3}`);
});

module.exports = connectMysqlDB3;
