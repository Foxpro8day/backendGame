const mysql = require("mysql2");

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
});

connection.connect((err) => {
  if (err) {
    console.error("❌ Database connection failed:", err);
    return;
  }
  console.log("✅ Connected to the database!");

  connection.query("SELECT * FROM", (error, results) => {
    if (error) throw error;
    console.log(results);
    connection.end(); // Đóng kết nối sau khi truy vấn xong
  });
});
