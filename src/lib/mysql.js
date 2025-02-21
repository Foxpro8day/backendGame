const mysql = require("mysql");
const dotenv = require("dotenv");

dotenv.config(); // Load biến môi trường từ .env

const createMysqlConnection = () => {
  return new Promise((resolve, reject) => {
    const connection = mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASS || "",
      database: process.env.DB_NAME || "test",
    });

    connection.connect((err) => {
      if (err) {
        console.error("❌ Database connection failed:", err);
        reject(err);
      } else {
        console.log(`✅ Connected to MySQL database: ${process.env.DB_NAME}`);
        resolve(connection);
      }
    });
  });
};

module.exports = createMysqlConnection;
