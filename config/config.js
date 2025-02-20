const dotenv = require("dotenv");
dotenv.config(); // ✅ Load biến môi trường trước khi sử dụng

const env = process.env.NODE_ENV ; // ✅ Lấy giá trị NODE_ENV, mặc định là development

const config = {
  development: {
    db1: {
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      host: process.env.DB_HOST,
      dialect: "mysql",
      logging: false,
      timezone: "+07:00", // ✅ Set múi giờ GMT+7
      dialectOptions: {
        timezone: "Asia/Bangkok", // ✅ Set cho MySQL
      },
    },
    db2: {
      username: process.env.DB_USER2,
      password: process.env.DB_PASS2,
      database: process.env.DB_NAME2,
      host: process.env.DB_HOST2,
      dialect: "mysql",
      logging: false,
      timezone: "+07:00", // ✅ Set múi giờ GMT+7
      dialectOptions: {
        timezone: "Asia/Bangkok", // ✅ Set cho MySQL
      },
    },
    db3: {
      username: process.env.DB_USER3,
      password: process.env.DB_PASS3,
      database: process.env.DB_NAME3,
      host: process.env.DB_HOST3,
      dialect: "mysql",
      logging: false,
      timezone: "+07:00", // ✅ Set múi giờ GMT+7
      dialectOptions: {
        timezone: "Asia/Bangkok", // ✅ Set cho MySQL
      },
    },
    db4: {
      username: process.env.DB_USER4,
      password: process.env.DB_PASS4,
      database: process.env.DB_NAME4,
      host: process.env.DB_HOST4,
      dialect: "mysql",
      logging: false,
      timezone: "+07:00", // ✅ Set múi giờ GMT+7
      dialectOptions: {
        timezone: "Asia/Bangkok", // ✅ Set cho MySQL
      },
    },
    db5: {
      username: process.env.DB_USER5,
      password: process.env.DB_PASS5,
      database: process.env.DB_NAME5,
      host: process.env.DB_HOST5,
      dialect: "mysql",
      logging: false,
      timezone: "+07:00", // ✅ Set múi giờ GMT+7
      dialectOptions: {
        timezone: "Asia/Bangkok", // ✅ Set cho MySQL
      },
    },
  },
  production: {
    db1: {
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      host: process.env.DB_HOST,
      dialect: "mysql",
      logging: false,
      timezone: "+07:00", // ✅ Set múi giờ GMT+7
      dialectOptions: {
        timezone: "Asia/Bangkok", // ✅ Set cho MySQL
      },
    },
    db2: {
      username: process.env.DB_USER2,
      password: process.env.DB_PASS2,
      database: process.env.DB_NAME2,
      host: process.env.DB_HOST2,
      dialect: "mysql",
      logging: false,
      timezone: "+07:00", // ✅ Set múi giờ GMT+7
      dialectOptions: {
        timezone: "Asia/Bangkok", // ✅ Set cho MySQL
      },
    },
    db3: {
      username: process.env.DB_USER3,
      password: process.env.DB_PASS3,
      database: process.env.DB_NAME3,
      host: process.env.DB_HOST3,
      dialect: "mysql",
      logging: false,
      timezone: "+07:00", // ✅ Set múi giờ GMT+7
      dialectOptions: {
        timezone: "Asia/Bangkok", // ✅ Set cho MySQL
      },
    },
    db4: {
      username: process.env.DB_USER4,
      password: process.env.DB_PASS4,
      database: process.env.DB_NAME4,
      host: process.env.DB_HOST4,
      dialect: "mysql",
      logging: false,
      timezone: "+07:00", // ✅ Set múi giờ GMT+7
      dialectOptions: {
        timezone: "Asia/Bangkok", // ✅ Set cho MySQL
      },
    },
    db5: {
      username: process.env.DB_USER5,
      password: process.env.DB_PASS5,
      database: process.env.DB_NAME5,
      host: process.env.DB_HOST5,
      dialect: "mysql",
      logging: false,
      timezone: "+07:00", // ✅ Set múi giờ GMT+7
      dialectOptions: {
        timezone: "Asia/Bangkok", // ✅ Set cho MySQL
      },
    },
  },
};

// ✅ Debug để kiểm tra NODE_ENV và config được load
console.log("📌 ENV Loaded:", env);
console.log("📌 Available Configs:", Object.keys(config));

if (!config[env]) {
  console.error("❌ Không tìm thấy config cho môi trường:", env);
  process.exit(1);
}

console.log("✅ Config Loaded:", config[env]); // ✅ Kiểm tra config đã được load đúng

module.exports = config[env]; // ✅ Chỉ export config theo NODE_ENV
