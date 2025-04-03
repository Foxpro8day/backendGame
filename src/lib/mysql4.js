const mysql = require("mysql");
const dotenv = require("dotenv");

dotenv.config(); // Load biến môi trường từ .env

const dbGameConfig4 = {
  host: process.env.DB_HOST4 || "localhost",
  user: process.env.DB_USER4 || "root",
  password: process.env.DB_PASS4 || "",
  database: process.env.DB_NAME4 || "test",
  connectionLimit: 10,
};

let gameConnection4;

function handleGameDisconnect4() {
  gameConnection4 = mysql.createConnection(dbGameConfig4);

  gameConnection4.connect((err) => {
    if (err) {
      console.error("❌ Database game connection (DB4) failed:", err);
      setTimeout(handleGameDisconnect4, 5000); // Thử kết nối lại sau 5 giây nếu lỗi
    } else {
      console.log(`✅ Connected to MySQL game database (DB4): ${process.env.DB_NAME4}`);
    }
  });

  // Xử lý lỗi và tự động reconnect khi mất kết nối
  gameConnection4.on("error", (err) => {
    console.error("⚠️ MySQL Game DB4 Error:", err);
    if (err.code === "PROTOCOL_CONNECTION_LOST") {
      console.log("🔄 Reconnecting to MySQL Game DB4...");
      handleGameDisconnect4();
    } else {
      throw err;
    }
  });
}

// Khởi động kết nối ban đầu
handleGameDisconnect4();

module.exports = () => gameConnection4;
