const mysql = require("mysql");
const dotenv = require("dotenv");

dotenv.config(); // Load biến môi trường từ .env

const dbGameConfig = {
  host: process.env.DB_HOST2 || "localhost",
  user: process.env.DB_USER2 || "root",
  password: process.env.DB_PASS2 || "",
  database: process.env.DB_NAME2 || "test",
  connectionLimit: 10,
};

let gameConnection;

function handleGameDisconnect() {
  gameConnection = mysql.createConnection(dbGameConfig);

  gameConnection.connect((err) => {
    if (err) {
      console.error("❌ Database game connection failed:", err);
      setTimeout(handleGameDisconnect, 5000); // Thử kết nối lại sau 5 giây nếu lỗi
    } else {
      console.log(`✅ Connected to MySQL game database: ${process.env.DB_NAME2}`);
    }
  });

  // Xử lý lỗi và tự động reconnect khi mất kết nối
  gameConnection.on("error", (err) => {
    console.error("⚠️ MySQL Game DB Error:", err);
    if (err.code === "PROTOCOL_CONNECTION_LOST") {
      console.log("🔄 Reconnecting to MySQL Game DB...");
      handleGameDisconnect();
    } else {
      throw err;
    }
  });
}

// Khởi động kết nối ban đầu
handleGameDisconnect();

module.exports = () => gameConnection;
