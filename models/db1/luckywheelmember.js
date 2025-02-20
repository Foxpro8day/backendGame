'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class LuckyWheelMember extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  LuckyWheelMember.init(
    {
      stt: {
        type: DataTypes.INTEGER,
        autoIncrement: true, // ✅ Tự động tăng
        primaryKey: true, // ✅ Đặt làm khóa chính
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false, // ✅ Không được để trống
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: false, // ✅ Không được để trống
      },
      prize: {
        type: DataTypes.STRING,
        allowNull: false, // ✅ Không được để trống
      },
    },
    {
      sequelize,
      modelName: "LuckyWheelMember",
    }
  );
  return LuckyWheelMember;
};