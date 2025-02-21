const express = require("express");
const db = require("../../models");
const User = db.db1.User;
const SpinHistory = db.db5.GameHistory;
const {
  getRandomCards,
  evaluateHand,
  calculateWinnings,
} = require("../utils/shuffleDeck");

const router = express.Router();

module.exports = (io) => {
  router.post("/spin", async (req, res) => {
    const { userId, betAmount } = req.body;

    if (!userId || betAmount <= 0) {
      return res.status(400).json({ error: "Dữ liệu không hợp lệ" });
    }

    const transactionDB1 = await db.sequelizeDB1.transaction(); // Transaction cho db1
    const transactionDB5 = await db.sequelizeDB5.transaction(); // Transaction cho db5

    try {
      // Kiểm tra user
      const user = await User.findByPk(userId, { transaction: transactionDB1 });
      if (!user || user.point < betAmount) {
        await transactionDB1.rollback();
        return res.status(400).json({ error: "Không đủ tiền cược" });
      }

      // Trừ tiền cược
      await User.decrement("point", {
        by: betAmount,
        where: { id: userId },
        transaction: transactionDB1,
      });

      // Quay bài
      const spinResult = getRandomCards();
      const handRank = evaluateHand(spinResult);
      const winAmount = calculateWinnings(spinResult, betAmount);

      // Cộng tiền nếu thắng
      if (winAmount > 0) {
        await User.increment("point", {
          by: winAmount,
          where: { id: userId },
          transaction: transactionDB1,
        });
      }

      const updatedUser = await User.findByPk(userId, {
        transaction: transactionDB1,
      });

      // Commit transaction db1
      await transactionDB1.commit();

      // Lưu lịch sử quay vào db5
      await SpinHistory.create(
        {
          gameId: 1,
          gameType: "pr",
          result: JSON.stringify({
            userId,
            betAmount,
            result: spinResult.map((card) => card.name),
            winAmount,
          }),
          roomId: 1,
        },
        { transaction: transactionDB5 }
      );

      // Commit transaction db5
      await transactionDB5.commit();

      // 🔥 Gửi cập nhật point qua socket
      io.to(`user-${userId}`).emit("updatePoint", { point: updatedUser.point });

      res.json({
        spinResult,
        handRank,
        winAmount,
        newPoint: updatedUser.point,
      });
    } catch (error) {
      await transactionDB1.rollback(); // Rollback db1
      await transactionDB5.rollback(); // Rollback db5
      console.error("Lỗi khi xử lý quay bài:", error);
      res.status(500).json({ error: "Lỗi hệ thống, vui lòng thử lại sau." });
    }
  });

  return router;
};
