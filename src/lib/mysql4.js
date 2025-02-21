const mysql = require("mysql");
const dotenv = require("dotenv");

dotenv.config(); // Load biến môi trường từ .env

const createMysqlGameConnection4 = () => {
  return new Promise((resolve, reject) => {
    const connection = mysql.createConnection({
      host: process.env.DB_HOST4 || "localhost",
      user: process.env.DB_USER4 || "root",
      password: process.env.DB_PASS4 || "",
      database: process.env.DB_NAME4 || "test",
    });

    connection.connect((err) => {
      if (err) {
        console.error("❌ Database game connection (DB4) failed:", err);
        reject(err);
      } else {
        console.log(
          `✅ Connected to MySQL game database (DB4): ${process.env.DB_NAME4}`
        );
        resolve(connection);
      }
    });
  });
};

module.exports = createMysqlGameConnection4;
