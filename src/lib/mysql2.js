const mysql = require("mysql");
const dotenv = require("dotenv");

// dotenv.config(); // Load biến môi trường từ .env

const connectMysqlDB2 = mysql.createConnection({
  host: process.env.DB_HOST2 || "localhost",
  user: process.env.DB_USER2 || "root",
  password: process.env.DB_PASS2 || "",
  database: process.env.DB_NAME2 || "test",
});

connectMysqlDB2.connect((err) => {
  if (err) {
    console.error("❌ Database game connection failed:", err);
    return;
  }
  console.log(`✅ Connected to MySQL game ${process.env.DB_NAME2}`);
});

module.exports = connectMysqlDB2;
