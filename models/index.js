"use strict";

const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const dotenv = require("dotenv");

dotenv.config(); // ✅ Load biến môi trường từ .env

const config = require("../config/config"); // ✅ Load config đúng theo NODE_ENV

const db = {
  db1: {},
  db2: {},
  db3: {},
  db4: {},
  db5: {},
};

// ✅ Tạo kết nối cho `db1`
const sequelizeDB1 = new Sequelize(
  config.db1.database,
  config.db1.username,
  config.db1.password,
  {
    host: config.db1.host,
    dialect: config.db1.dialect,
    logging: config.db1.logging,
  }
);

// ✅ Tạo kết nối cho `db2`
const sequelizeDB2 = new Sequelize(
  config.db2.database,
  config.db2.username,
  config.db2.password,
  {
    host: config.db2.host,
    dialect: config.db2.dialect,
    logging: config.db2.logging,
  }
);

// ✅ Tạo kết nối cho `db3`
const sequelizeDB3 = new Sequelize(
  config.db3.database,
  config.db3.username,
  config.db3.password,
  {
    host: config.db3.host,
    dialect: config.db3.dialect,
    logging: config.db3.logging,
  }
);

// ✅ Tạo kết nối cho `db4`
const sequelizeDB4 = new Sequelize(
  config.db4.database,
  config.db4.username,
  config.db4.password,
  {
    host: config.db4.host,
    dialect: config.db4.dialect,
    logging: config.db4.logging,
  }
);

// ✅ Tạo kết nối cho `db5`
const sequelizeDB5 = new Sequelize(
  config.db5.database,
  config.db5.username,
  config.db5.password,
  {
    host: config.db5.host,
    dialect: config.db5.dialect,
    logging: config.db5.logging,
  }
);

// ✅ Load models từ `models/db1/`
fs.readdirSync(path.join(__dirname, "db1"))
  .filter((file) => file.endsWith(".js"))
  .forEach((file) => {
    // console.log(`📌 Loading model DB1: ${file}`);
    const model = require(path.join(__dirname, "db1", file))(
      sequelizeDB1,
      Sequelize.DataTypes
    );
    db.db1[model.name] = model;
  });

// ✅ Load models từ `models/db2/`
fs.readdirSync(path.join(__dirname, "db2"))
  .filter((file) => file.endsWith(".js"))
  .forEach((file) => {
    // console.log(`📌 Loading model DB2: ${file}`);
    const model = require(path.join(__dirname, "db2", file))(
      sequelizeDB2,
      Sequelize.DataTypes
    );
    db.db2[model.name] = model;
  });

// ✅ Load models từ `models/db3/`
fs.readdirSync(path.join(__dirname, "db3"))
  .filter((file) => file.endsWith(".js"))
  .forEach((file) => {
    // console.log(`📌 Loading model DB3: ${file}`);
    const model = require(path.join(__dirname, "db3", file))(
      sequelizeDB3,
      Sequelize.DataTypes
    );
    db.db3[model.name] = model;
  });

// ✅ Load models từ `models/db4/`
fs.readdirSync(path.join(__dirname, "db4"))
  .filter((file) => file.endsWith(".js"))
  .forEach((file) => {
    // console.log(`📌 Loading model DB4: ${file}`);
    const model = require(path.join(__dirname, "db4", file))(
      sequelizeDB4,
      Sequelize.DataTypes
    );
    db.db4[model.name] = model;
  });

// ✅ Load models từ `models/db4/`
fs.readdirSync(path.join(__dirname, "db5"))
  .filter((file) => file.endsWith(".js"))
  .forEach((file) => {
    // console.log(`📌 Loading model DB4: ${file}`);
    const model = require(path.join(__dirname, "db5", file))(
      sequelizeDB5,
      Sequelize.DataTypes
    );
    db.db5[model.name] = model;
  });

// ✅ Khai báo quan hệ giữa models (nếu có)
if (Object.keys(db.db1).length > 0) {
  Object.keys(db.db1).forEach((modelName) => {
    if (db.db1[modelName].associate) {
      db.db1[modelName].associate(db.db1);
    }
  });
}

if (Object.keys(db.db2).length > 0) {
  Object.keys(db.db2).forEach((modelName) => {
    if (db.db2[modelName].associate) {
      db.db2[modelName].associate(db.db2);
    }
  });
}

if (Object.keys(db.db3).length > 0) {
  Object.keys(db.db3).forEach((modelName) => {
    if (db.db3[modelName].associate) {
      db.db3[modelName].associate(db.db3);
    }
  });
}

if (Object.keys(db.db4).length > 0) {
  Object.keys(db.db4).forEach((modelName) => {
    if (db.db4[modelName].associate) {
      db.db4[modelName].associate(db.db4);
    }
  });
}

if (Object.keys(db.db5).length > 0) {
  Object.keys(db.db5).forEach((modelName) => {
    if (db.db5[modelName].associate) {
      db.db5[modelName].associate(db.db5);
    }
  });
}

// ✅ Xuất Sequelize instances và models
db.sequelizeDB1 = sequelizeDB1;
db.sequelizeDB2 = sequelizeDB2;
db.sequelizeDB3 = sequelizeDB3;
db.sequelizeDB4 = sequelizeDB4;
db.sequelizeDB5 = sequelizeDB5;
db.Sequelize = Sequelize;

// console.log("📌 Debug DB1 Models Loaded:", Object.keys(db.db1));
// console.log("📌 Debug DB2 Models Loaded:", Object.keys(db.db2));
// console.log("📌 Debug DB3 Models Loaded:", Object.keys(db.db3));

module.exports = {
  db1: db.db1,
  db2: db.db2,
  db3: db.db3,
  db4: db.db4,
  db5: db.db5,
  sequelizeDB1,
  sequelizeDB2,
  sequelizeDB3,
  sequelizeDB4,
  sequelizeDB5,
  sequelize: sequelizeDB1, // ✅ Chọn một kết nối chính để dùng transaction
  Sequelize,
};
