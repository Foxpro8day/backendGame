const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
  id: { type: Number, required: true }, // ID người gửi
  username: { type: String, required: true }, // Tên người gửi
  chat: { type: String, required: true }, // Nội dung tin nhắn
  datetime: { type: Date, default: Date.now }, // Thời gian gửi

  receiverId: { type: Number, default: null }, // ID người nhận (null nếu là tin nhắn nhóm)
  roomId: { type: String, default: null }, // ID phòng chat (nếu là nhóm)
  messageType: {
    type: String,
    enum: ["text", "image", "video", "file"],
    default: "text",
  }, // Loại tin nhắn
  isRead: { type: Boolean, default: false }, // Tin nhắn đã đọc chưa
  isEdited: { type: Boolean, default: false }, // Tin nhắn đã bị sửa chưa
  repliedMessageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Chat",
    default: null,
  }, // ID tin nhắn gốc nếu có reply
  attachments: [{ type: String }], // Danh sách tệp đính kèm (ảnh, video, file)
  deletedAt: { type: Date, default: null }, // Soft delete
});

module.exports = mongoose.model("Chat", chatSchema);
