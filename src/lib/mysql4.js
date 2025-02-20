const mysql = require("mysql");
const dotenv = require("dotenv");

// dotenv.config(); // Load biến môi trường từ .env

const connectMysqlDB4 = mysql.createConnection({
  host: process.env.DB_HOST4 || "localhost",
  user: process.env.DB_USER4 || "root",
  password: process.env.DB_PASS4 || "",
  database: process.env.DB_NAME4 || "test",
});

connectMysqlDB4.connect((err) => {
  if (err) {
    console.error("❌ Database game connection failed:", err);
    return;
  }
  console.log(`✅ Connected to MySQL game ${process.env.DB_NAME4}`);
});

module.exports = connectMysqlDB4;
