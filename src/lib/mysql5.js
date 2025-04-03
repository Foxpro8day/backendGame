const mysql = require("mysql");
const dotenv = require("dotenv");

dotenv.config(); // Load biến môi trường từ .env

const dbGameConfig5 = {
  host: process.env.DB_HOST5 || "localhost",
  user: process.env.DB_USER5 || "root",
  password: process.env.DB_PASS5 || "",
  database: process.env.DB_NAME5 || "test",
  connectionLimit: 10,
};

let gameConnection5;

function handleGameDisconnect5() {
  gameConnection5 = mysql.createConnection(dbGameConfig5);

  gameConnection5.connect((err) => {
    if (err) {
      console.error("❌ Database game connection (DB5) failed:", err);
      setTimeout(handleGameDisconnect5, 5000); // Thử kết nối lại sau 5 giây nếu lỗi
    } else {
      console.log(`✅ Connected to MySQL game database (DB5): ${process.env.DB_NAME5}`);
    }
  });

  // Xử lý lỗi và tự động reconnect khi mất kết nối
  gameConnection5.on("error", (err) => {
    console.error("⚠️ MySQL Game DB5 Error:", err);
    if (err.code === "PROTOCOL_CONNECTION_LOST") {
      console.log("🔄 Reconnecting to MySQL Game DB5...");
      handleGameDisconnect5();
    } else {
      throw err;
    }
  });
}

// Khởi động kết nối ban đầu
handleGameDisconnect5();

module.exports = () => gameConnection5;
