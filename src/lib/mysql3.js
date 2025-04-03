const mysql = require("mysql");
const dotenv = require("dotenv");

dotenv.config(); // Load biến môi trường từ .env

const dbGameConfig3 = {
  host: process.env.DB_HOST3 || "localhost",
  user: process.env.DB_USER3 || "root",
  password: process.env.DB_PASS3 || "",
  database: process.env.DB_NAME3 || "test",
  connectionLimit: 10,
};

let gameConnection3;

function handleGameDisconnect3() {
  gameConnection3 = mysql.createConnection(dbGameConfig3);

  gameConnection3.connect((err) => {
    if (err) {
      console.error("❌ Database game connection (DB3) failed:", err);
      setTimeout(handleGameDisconnect3, 5000); // Thử kết nối lại sau 5 giây nếu lỗi
    } else {
      console.log(`✅ Connected to MySQL game database (DB3): ${process.env.DB_NAME3}`);
    }
  });

  // Xử lý lỗi và tự động reconnect khi mất kết nối
  gameConnection3.on("error", (err) => {
    console.error("⚠️ MySQL Game DB3 Error:", err);
    if (err.code === "PROTOCOL_CONNECTION_LOST") {
      console.log("🔄 Reconnecting to MySQL Game DB3...");
      handleGameDisconnect3();
    } else {
      throw err;
    }
  });
}

// Khởi động kết nối ban đầu
handleGameDisconnect3();

module.exports = () => gameConnection3;
