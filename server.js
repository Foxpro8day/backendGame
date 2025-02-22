const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const http = require("http");
const { Server } = require("socket.io");

//import database
const connectMysqlDB = require("./src/lib/mysql"); // ✅ Import kết nối MySQL users
const connectMysqlDB2 = require("./src/lib/mysql2"); // ✅ Import kết nối MySQL tx
const connectMysqlDB3 = require("./src/lib/mysql3"); // ✅ Import kết nối MySQL bc
const connectMysqlDB4 = require("./src/lib/mysql4"); // ✅ Import kết nối MySQL xd
const connectMysqlDB5 = require("./src/lib/mysql5"); // ✅ Import kết nối MySQL pr
const connectMongoDB = require("./src/lib/mongo"); // ✅ Import MongoDB connection

//import logicgame
const {
  gameState: lastGameTaiXiu,
  startNewRound: startNewRoundTaiXiu,
} = require("./src/logicGame/taixiuLogic");
const {
  gameState: lastGameBauCua,
  startNewRound: startNewRoundBauCua,
} = require("./src/logicGame/baucuaLogic");
const {
  gameState: lastGameXocDia,
  startNewRound: startNewRoundXocDia,
} = require("./src/logicGame/xocdiaLogic");

//import api
const luckyWheelAPI = require("./src/api/luckyWheelAPI");
const userAPI = require("./src/api/userAPI");

dotenv.config();
const URL_FRONTEND = process.env.REACT_APP_FRONTEND;

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: URL_FRONTEND,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

//middleware
app.use(cookieParser());
app.use(express.json());
app.use(
  cors({
    origin: URL_FRONTEND,
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

// ✅ Endpoint cơ bản
app.get("/", (req, res) => {
  res.send("Hello, this is the backend!");
});

// ✅ Sử dụng API
app.use("/luckywheel", luckyWheelAPI);
app.use("/user", userAPI);

const pokerLogic = require("./src/logicGame/pokerLogic")(io);
app.use("/poker", pokerLogic); // xu ly game poker

// ✅ Xử lý kết nối socket.io
io.on("connection", (socket) => {
  console.log(`⚡ Client connected: ${socket.id}`);

  // ✅ Gửi dữ liệu của các game hiện tại đến client ngay khi kết nối
  const gameStates = [
    {
      event: "send_last_round_baucua",
      state: lastGameBauCua,
      defaultState: getDefaultBauCuaState(),
    },
    {
      event: "send_last_round_taixiu",
      state: lastGameTaiXiu,
      defaultState: getDefaultTaiXiuState(),
    },
    {
      event: "send_last_round_xocdia",
      state: lastGameXocDia,
      defaultState: getDefaultXocDiaState(),
    },
  ];

  gameStates.forEach(({ event, state, defaultState }) => {
    socket.emit(event, state?.round ? state : defaultState);
  });

  // Người chơi tham gia vào phòng riêng của họ
  socket.on("joinRoom", ({ userId }) => {
    socket.join(`user-${userId}`);
    console.log(`👤 User ${userId} đã tham gia phòng user-${userId}`);
  });

  // Khi rời phòng
  socket.on("leaveRoom", ({ userId }) => {
    socket.leave(`user-${userId}`);
    console.log(`🚪 User ${userId} đã rời phòng`);
  });

  // ✅ Xử lý disconnect
  socket.on("disconnect", () => {
    console.log(`⚡ User disconnected: ${socket.id}`);
  });
});

// ✅ Hàm trả về trạng thái mặc định nếu game chưa có dữ liệu
function getDefaultBauCuaState() {
  return {
    lastRound: 0,
    lastResult: ["Bầu", "Cua", "Tôm"],
    lastDice: { dice1: "Bầu", dice2: "Cua", dice3: "Tôm", result: ["Bầu", "Cua", "Tôm"] },
    lastBets: Object.fromEntries(["Bau", "Cua", "Tom", "Ca", "Nai", "Ga"].map((type) => [type, { players: 0, money: 0 }])),
  };
}

function getDefaultTaiXiuState() {
  return {
    lastRound: 0,
    lastResult: "Xỉu",
    lastDice: { dice1: 1, dice2: 2, dice3: 3, total: 6 },
    lastBets: { tai: { players: 0, money: 0 }, xiu: { players: 0, money: 0 } },
  };
}

function getDefaultXocDiaState() {
  return {
    lastRound: 0,
    lastResult: "Chẵn",
    lastCoins: ["Chẵn", "Lẻ", "Chẵn", "Lẻ"],
    lastBets: { Chan: { players: 0, money: 0 }, Le: { players: 0, money: 0 } },
  };
}

// ✅ Kết nối databases
(async () => {
  try {
    await connectMysqlDB();
    await connectMysqlDB2();
    await connectMysqlDB3();
    await connectMysqlDB4();
    await connectMysqlDB5();
    await connectMongoDB();
    console.log("✅ Kết nối Database thành công");
  } catch (error) {
    console.error("❌ Lỗi kết nối Database:", error);
    process.exit(1); // Dừng server nếu kết nối database thất bại
  }
})();

// ✅ Bắt đầu ván mới cho game
startNewRoundTaiXiu(io);
startNewRoundBauCua(io);
startNewRoundXocDia(io);

// ✅ Server lắng nghe
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`🚀 Server is running on port: ${PORT}`);
});
