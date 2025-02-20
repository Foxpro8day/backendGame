const express = require("express");
const db = require("../../models"); // Import models từ `index.js`
const LuckyWheelMember = db.LuckyWheelMember; // Lấy model đúng cách

const router = express.Router();

// ✅ API: Thêm người chơi mới vào Lucky Wheel
router.post("/add-member", async (req, res) => {
  try {
    const { name, phone, prize } = req.body;
    console.log(req.body);
    // Kiểm tra dữ liệu đầu vào
    if (!name || !phone) {
      return res
        .status(400)
        .json({ message: "⚠️ Thiếu thông tin Name hoặc phone!" });
    }

    if (name.length > 256) {
      return res
        .status(400)
        .json({ message: "⚠️ Tên không được vượt quá 256 ký tự!" });
    }

    if (!/^\d{10}$/.test(phone)) {
      return res
        .status(400)
        .json({ message: "⚠️ Số điện thoại phải có đúng 10 chữ số!" });
    }

    // Lưu vào database
    const newMember = await LuckyWheelMember.create({
      name: name,
      phone: phone,
      prize: prize,
    });

    res.status(201).json({
      message: "✅ Thành viên đã được thêm!",
      data: newMember,
    });
  } catch (error) {
    console.error("❌ Lỗi khi thêm thành viên:", error);
    res.status(500).json({ message: "❌ Lỗi Server!" });
  }
});

// ✅ API: Lấy danh sách thành viên
router.get("/members", async (req, res) => {
  try {
    const members = await LuckyWheelMember.findAll();
    res.json(members);
  } catch (error) {
    console.error("❌ Lỗi khi lấy danh sách thành viên:", error);
    res.status(500).json({ message: "❌ Lỗi Server!" });
  }
});

module.exports = router;
