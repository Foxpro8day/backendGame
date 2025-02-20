const express = require("express");
const Chat = require("../models/Chat");

const router = express.Router();

// 📌 API gửi tin nhắn
router.post("/send", async (req, res) => {
  try {
    const {
      id,
      username,
      chat,
      receiverId,
      roomId,
      messageType,
      repliedMessageId,
      attachments,
    } = req.body;

    if (!id || !username || !chat) {
      return res
        .status(400)
        .json({ message: "id, username và chat là bắt buộc!" });
    }

    const newChat = new Chat({
      id,
      username,
      chat,
      receiverId,
      roomId,
      messageType,
      repliedMessageId,
      attachments,
    });

    await newChat.save();
    res.status(201).json({ message: "Tin nhắn đã được gửi", chat: newChat });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi gửi tin nhắn", error: error.message });
  }
});

// 📌 API lấy lịch sử chat (có hỗ trợ tìm kiếm theo room hoặc người nhận)
router.get("/history", async (req, res) => {
  try {
    const { roomId, receiverId } = req.query;

    let filter = {};
    if (roomId) filter.roomId = roomId;
    if (receiverId) filter.receiverId = receiverId;

    const chats = await Chat.find(filter).sort({ datetime: -1 }).limit(50);
    res.json(chats);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi lấy lịch sử chat", error: error.message });
  }
});

// 📌 API đánh dấu tin nhắn đã đọc
router.put("/read/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await Chat.findByIdAndUpdate(id, { isRead: true });
    res.json({ message: "Tin nhắn đã được đánh dấu là đã đọc" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi cập nhật trạng thái", error: error.message });
  }
});

// 📌 API xóa tin nhắn (soft delete)
router.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await Chat.findByIdAndUpdate(id, { deletedAt: new Date() });
    res.json({ message: "Tin nhắn đã được xóa (soft delete)" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi khi xóa tin nhắn", error: error.message });
  }
});

module.exports = router;
