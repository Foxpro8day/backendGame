const mysql = require("mysql");
const dotenv = require("dotenv");

dotenv.config(); // Load biến môi trường từ .env

const createMysqlGameConnection5 = () => {
  return new Promise((resolve, reject) => {
    const connection = mysql.createConnection({
      host: process.env.DB_HOST5 || "localhost",
      user: process.env.DB_USER5 || "root",
      password: process.env.DB_PASS5 || "",
      database: process.env.DB_NAME5 || "test",
    });

    connection.connect((err) => {
      if (err) {
        console.error("❌ Database game connection (DB5) failed:", err);
        reject(err);
      } else {
        console.log(
          `✅ Connected to MySQL game database (DB5): ${process.env.DB_NAME5}`
        );
        resolve(connection);
      }
    });
  });
};

module.exports = createMysqlGameConnection5;
