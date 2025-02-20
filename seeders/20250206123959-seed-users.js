const bcrypt = require("bcryptjs");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // ✅ Hash password trước khi lưu vào database
    const hashedPassword = await bcrypt.hash("khongcopass", 10);

    return queryInterface.bulkInsert("Users", [
      {
        username: "admin",
        password: hashedPassword, // 🔐 Lưu mật khẩu đã mã hóa
        phone: "0999999999",
        groupRole: 1,
        role: "admin",
        credit: 0,
        point: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("Users", { username: "admin" });
  },
};
