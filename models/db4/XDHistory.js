"use strict";
const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class GameHistory extends Model {
    /**
     * Helper method for defining associations.
     */
    static associate(models) {
      // Define associations here if needed
    }
  }

  GameHistory.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      gameId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      gameType: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      result: {
        type: DataTypes.JSON,
        allowNull: false,
      },
      roomId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "GameHistory",
      tableName: "GameHistories", // Đảm bảo tên bảng không bị Sequelize tự động thay đổi
      timestamps: true, // Bật timestamps để tự động cập nhật `createdAt` và `updatedAt`
    }
  );

  return GameHistory;
};
