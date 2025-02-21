const mysql = require("mysql");
const dotenv = require("dotenv");

dotenv.config(); // Load biến môi trường từ .env

const createMysqlGameConnection2 = () => {
  return new Promise((resolve, reject) => {
    const connection = mysql.createConnection({
      host: process.env.DB_HOST2 || "localhost",
      user: process.env.DB_USER2 || "root",
      password: process.env.DB_PASS2 || "",
      database: process.env.DB_NAME2 || "test",
    });

    connection.connect((err) => {
      if (err) {
        console.error("❌ Database game connection failed:", err);
        reject(err);
      } else {
        console.log(
          `✅ Connected to MySQL game database: ${process.env.DB_NAME2}`
        );
        resolve(connection);
      }
    });
  });
};

module.exports = createMysqlGameConnection2;
