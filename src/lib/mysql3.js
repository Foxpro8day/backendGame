const mysql = require("mysql");
const dotenv = require("dotenv");

dotenv.config(); // Load biến môi trường từ .env

const createMysqlGameConnection3 = () => {
  return new Promise((resolve, reject) => {
    const connection = mysql.createConnection({
      host: process.env.DB_HOST3 || "localhost",
      user: process.env.DB_USER3 || "root",
      password: process.env.DB_PASS3 || "",
      database: process.env.DB_NAME3 || "test",
    });

    connection.connect((err) => {
      if (err) {
        console.error("❌ Database game connection (DB3) failed:", err);
        reject(err);
      } else {
        console.log(
          `✅ Connected to MySQL game database (DB3): ${process.env.DB_NAME3}`
        );
        resolve(connection);
      }
    });
  });
};

module.exports = createMysqlGameConnection3;
