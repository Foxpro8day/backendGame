const mysql = require("mysql");
const dotenv = require("dotenv");

// dotenv.config(); // Load biến môi trường từ .env

const connectMysqlDB5 = mysql.createConnection({
  host: process.env.DB_HOST5 || "localhost",
  user: process.env.DB_USER5 || "root",
  password: process.env.DB_PASS5 || "",
  database: process.env.DB_NAME5 || "test",
});

connectMysqlDB5.connect((err) => {
  if (err) {
    console.error("❌ Database game connection failed:", err);
    return;
  }
  console.log(`✅ Connected to MySQL game ${process.env.DB_NAME5}`);
});

module.exports = connectMysqlDB5;
