const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../../models"); // ✅ Import toàn bộ models
const User = db.db1.User; // ✅ Lấy model `User`
const LuckyWheelMember = db.db1.LuckyWheelMember; // Lấy model đúng cách
const fs = require("fs")

const router = express.Router();
const SECRET_KEY = process.env.SECRET_KEY; // Thay bằng secret key bảo mật
const {
  authMiddleware,
  adminMiddleware,
  subAdminMiddleware,
} = require("../../middleware/authMiddleware");

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // 🔍 Kiểm tra dữ liệu đầu vào
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "⚠️ Vui lòng nhập username và password!" });
    }

    // 🔍 Kiểm tra user trong database
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({ message: "❌ Tài khoản không tồn tại!" });
    }

    // 🔍 Kiểm tra mật khẩu
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "❌ Sai mật khẩu!" });
    }

    // 🛡️ Tạo JWT Token (Thời hạn: 1 giờ)
    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      SECRET_KEY,
      { expiresIn: "1h" }
    );

    // 🍪 Gửi token trong Cookie (thời hạn 1 giờ)
    res.cookie("token", token, {
      httpOnly: true, // ✅ Bảo mật, không thể truy cập từ JS
      secure: false, // ✅ Chỉ hoạt động trên HTTPS (Tắt khi test local)
      sameSite: "Lax", // ✅ Ngăn chặn CSRF
      maxAge: 60 * 60 * 1000, // ✅ 1 giờ (tính bằng milliseconds)
    });

    res.json({ token, role: user.role, message: "✅ Đăng nhập thành công!" });
  } catch (error) {
    console.error("❌ Lỗi đăng nhập:", error);
    res.status(500).json({ message: "❌ Lỗi Server!" });
  }
});

// ✅ API: Lấy danh sách tất cả user tham gia lucky wheel
router.get(
  "/luckywheelmember",
  authMiddleware,
  subAdminMiddleware(["admin", "subAdmin"]),
  async (req, res) => {
    try {
      const users = await LuckyWheelMember.findAll({
        attributes: ["stt", "name", "phone", "prize"], // ✅ Chỉ lấy các cột cần thiết
      });

      res.json({ users });
    } catch (error) {
      console.error("❌ Lỗi khi lấy danh sách user:", error);
      res.status(500).json({ message: "❌ Lỗi server!" });
    }
  }
);

// 📌 API chỉ Admin (role 1) mới có quyền truy cập
router.get(
  "/admin/dashboard",
  authMiddleware,
  subAdminMiddleware(["admin", "subAdmin"]),
  async (req, res) => {
    try {
      const users = await User.findAll({
        attributes: ["id", "username", "role", "groupRole", "credit", "point"],
      });
      res.json({ users });
    } catch (error) {
      res.status(500).json({ message: "❌ Lỗi Server!" });
    }
  }
);

// 📌 Lấy thông tin người dùng theo ID
router.get("/me", authMiddleware, async (req, res) => {
  try {
    // Lấy thông tin user từ database sau khi đã xác thực
    const user = await User.findOne({
      where: { id: req.user.id },
      attributes: [
        "id",
        "username",
        "phone",
        "role",
        "point",
        "credit",
        "createdAt",
      ], // Chỉ lấy những thông tin cần thiết
    });

    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng!" });
    }

    res.json(user);
  } catch (error) {
    console.error("❌ Lỗi khi lấy thông tin user:", error);
    res.status(500).json({ message: "❌ Lỗi server!" });
  }
});

// 📌 API Đăng ký
router.post("/register", async (req, res) => {
  try {
    const { username, phone, password } = req.body;

    // ✅ Kiểm tra dữ liệu đầu vào
    if (!username || !phone || !password) {
      return res
        .status(400)
        .json({ message: "⚠️ Vui lòng điền đầy đủ thông tin!" });
    }

    if (!/^\d{10}$/.test(phone)) {
      return res
        .status(400)
        .json({ message: "⚠️ Số điện thoại phải đúng 10 số!" });
    }

    // ✅ Kiểm tra xem tài khoản hoặc số điện thoại đã tồn tại chưa
    const existingUser = await User.findOne({ where: { username } });
    const existingPhone = await User.findOne({ where: { phone } });

    if (existingUser) {
      return res.status(400).json({ message: "❌ Tài khoản đã tồn tại!" });
    }
    if (existingPhone) {
      return res
        .status(400)
        .json({ message: "❌ Số điện thoại đã được sử dụng!" });
    }

    // ✅ Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Tạo tài khoản mới
    const newUser = await User.create({
      username,
      phone,
      password: hashedPassword,
      groupRole: 2,
      role: "user", // ✅ Mặc định là user
      point: 0, // ✅ Điểm mặc định là 0
      credit: 0, // ✅ Tín dụng mặc định là 0
    });

    // ✅ Tạo JWT Token sau khi đăng ký
    const token = jwt.sign(
      { id: newUser.id, username: newUser.username, role: newUser.role },
      SECRET_KEY,
      { expiresIn: "1h" }
    );

    // ✅ Gửi token trong Cookie
    res.cookie("token", token, {
      httpOnly: true, // ✅ Không thể truy cập từ JS
      secure: false, // ✅ True nếu chạy trên HTTPS
      sameSite: "Lax",
      maxAge: 60 * 60 * 1000, // ✅ 1 giờ
    });

    res.status(201).json({
      message: "✅ Đăng ký thành công!",
      user: {
        id: newUser.id,
        username: newUser.username,
        phone: newUser.phone,
      },
    });
  } catch (error) {
    console.error("❌ Lỗi đăng ký:", error);
    res.status(500).json({ message: "❌ Lỗi server! Hãy thử lại sau." });
  }
});

// 📌 API để lấy danh sách ngân hàng từ JSON
router.get("/deposit-info", (req, res) => {
  fs.readFile("./src/data/depositData.json", "utf8", (err, data) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Error reading file", error: err });
    }
    res.json(JSON.parse(data));
  });
});

// 📌 API Rút Tiền
router.post("/withdraw", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id; // ✅ Lấy userId từ token
    const { amount, bankName, accountNumber, accountName } = req.body;

    // 🔹 Kiểm tra input hợp lệ
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Số tiền rút phải lớn hơn 0" });
    }
    if (!bankName || !accountNumber || !accountName) {
      return res.status(400).json({ message: "Thông tin ngân hàng không hợp lệ" });
    }

    // 🔹 Kiểm tra số dư user
    const [user] = await db.sequelize.query("SELECT credit FROM users WHERE id = ?", {
      replacements: [userId],
      type: db.sequelize.QueryTypes.SELECT,
    });

    if (!user) return res.status(404).json({ message: "Người dùng không tồn tại" });

    if (user.credit < amount) {
      return res.status(400).json({ message: "Số dư không đủ để rút tiền" });
    }

    // 🔹 Thêm yêu cầu rút tiền vào bảng `withdrawals`
    const [result] = await db.sequelize.query(
      "INSERT INTO withdrawals (userId, amount, bankName, accountNumber, accountName, status) VALUES (?, ?, ?, ?, ?, 'pending')",
      { replacements: [userId, amount, bankName, accountNumber, accountName] }
    );

    res.status(201).json({
      message: "✅ Yêu cầu rút tiền đã được gửi!",
      withdrawId: result.insertId,
    });

  } catch (error) {
    console.error("❌ Lỗi rút tiền:", error);
    res.status(500).json({ message: "❌ Lỗi server!" });
  }
});


router.post("/logout", (req, res) => {
  res.clearCookie("token", { httpOnly: true, secure: false });
  res.json({ success: true, message: "Đăng xuất thành công!" });
});

module.exports = router;
