const mysql = require("mysql");
const dotenv = require("dotenv");

dotenv.config(); // Load biến môi trường từ .env

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "",
  database: process.env.DB_NAME || "test",
  connectionLimit: 10, // Tối đa 10 kết nối đồng thời
};

let connection;

function handleDisconnect() {
  connection = mysql.createConnection(dbConfig);

  connection.connect((err) => {
    if (err) {
      console.error("❌ Database connection failed:", err);
      setTimeout(handleDisconnect, 5000); // Thử lại sau 5 giây nếu lỗi
    } else {
      console.log(`✅ Connected to MySQL database: ${process.env.DB_NAME}`);
    }
  });

  // Nếu MySQL bị mất kết nối, thử kết nối lại
  connection.on("error", (err) => {
    console.error("⚠️ MySQL Error:", err);
    if (err.code === "PROTOCOL_CONNECTION_LOST") {
      console.log("🔄 Reconnecting to MySQL...");
      handleDisconnect();
    } else {
      throw err;
    }
  });
}

// Khởi động kết nối ban đầu
handleDisconnect();

module.exports = () => connection;
