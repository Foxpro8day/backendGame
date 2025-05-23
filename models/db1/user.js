"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  User.init(
    {
      username: { type: DataTypes.STRING },
      password: { type: DataTypes.STRING },
      phone: { type: DataTypes.STRING },
      groupRole: { type: DataTypes.INTEGER },
      role: { type: DataTypes.STRING },
      credit: { type: DataTypes.INTEGER },
      point: { type: DataTypes.INTEGER },
    },
    {
      sequelize,
      modelName: "User",
    }
  );
  return User;
};
