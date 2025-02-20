const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const http = require("http");
const { Server } = require("socket.io");
const connectMysqlDB = require("./src/lib/mysql"); // ✅ Import kết nối MySQL users
const connectMysqlDB2 = require("./src/lib/mysql2"); // ✅ Import kết nối MySQL tx
const connectMysqlDB3 = require("./src/lib/mysql3"); // ✅ Import kết nối MySQL bc
const connectMysqlDB4 = require("./src/lib/mysql4"); // ✅ Import kết nối MySQL bc
const connectMysqlDB5 = require("./src/lib/mysql5"); // ✅ Import kết nối MySQL pr
const connectMongoDB = require("./src/lib/mongo"); // ✅ Import MongoDB connection

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

const pokerLogic = require("./src/logicGame/pokerLogic");

const luckyWheelAPI = require("./src/api/luckyWheelAPI");
const userAPI = require("./src/api/userAPI");

dotenv.config();
const URL_FRONTEND = process.env.REACT_APP_FRONTEND;

const app = express();
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

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: URL_FRONTEND,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// ✅ Endpoint cơ bản
app.get("/", (req, res) => {
  res.send("Hello, this is the backend!");
});

// ✅ Sử dụng API
app.use("/luckywheel", luckyWheelAPI);
app.use("/user", userAPI);
app.use("/poker", pokerLogic); // xu ly game poker

// ✅ Xử lý kết nối socket.io
io.on("connection", (socket) => {
  // console.log(`⚡ Client connected: ${socket.id}`);

  // ✅ Kiểm tra lastGameBauCua trước khi emit
  if (lastGameBauCua && lastGameBauCua.round) {
    socket.emit("send_last_round_baucua", {
      lastRound: lastGameBauCua.round,
      lastResult: lastGameBauCua.result,
      lastDice: lastGameBauCua.dice,
      lastBets: lastGameBauCua.bets,
    });
  } else {
    // console.log("⚠️ Không có dữ liệu lastGameBauCua, gửi giá trị mặc định.");
    socket.emit("send_last_round_baucua", {
      lastRound: 0,
      lastResult: ["Bầu", "Cua", "Tôm"],
      lastDice: {
        dice1: "Bầu",
        dice2: "Cua",
        dice3: "Tôm",
        result: ["Bầu", "Cua", "Tôm"],
      },
      lastBets: Object.fromEntries(
        ["Bau", "Cua", "Tom", "Ca", "Nai", "Ga"].map((type) => [
          type,
          { players: 0, money: 0 },
        ])
      ),
    });
  }

  // ✅ Kiểm tra dữ liệu Tài Xỉu
  if (lastGameTaiXiu && lastGameTaiXiu.round) {
    socket.emit("send_last_round_taixiu", {
      lastRound: lastGameTaiXiu.round,
      lastResult: lastGameTaiXiu.result,
      lastDice: lastGameTaiXiu.dice,
      lastBets: lastGameTaiXiu.bets,
    });
  } else {
    // console.log("⚠️ Không có dữ liệu lastGameTaiXiu, gửi giá trị mặc định.");
    socket.emit("send_last_round_taixiu", {
      lastRound: 0,
      lastResult: "Xỉu",
      lastDice: { dice1: 1, dice2: 2, dice3: 3, total: 6 },
      lastBets: {
        tai: { players: 0, money: 0 },
        xiu: { players: 0, money: 0 },
      },
    });
  }
  // ✅ Kiểm tra lastGameTaiXiu trước khi emit
  socket.emit(
    "send_last_round_taixiu",
    lastGameTaiXiu?.round
      ? {
          lastRound: lastGameTaiXiu.round,
          lastResult: lastGameTaiXiu.result,
          lastDice: lastGameTaiXiu.dice,
          lastBets: lastGameTaiXiu.bets,
        }
      : {
          lastRound: 0,
          lastResult: "Xỉu",
          lastDice: { dice1: 1, dice2: 2, dice3: 3, total: 6 },
          lastBets: {
            tai: { players: 0, money: 0 },
            xiu: { players: 0, money: 0 },
          },
        }
  );

  // ✅ Kiểm tra lastGameXocDia trước khi emit
  socket.emit(
    "send_last_round_xocdia",
    lastGameXocDia?.round
      ? {
          lastRound: lastGameXocDia.round,
          lastResult: lastGameXocDia.result,
          lastCoins: lastGameXocDia.coins,
          lastBets: lastGameXocDia.bets,
        }
      : {
          lastRound: 0,
          lastResult: "Chẵn",
          lastCoins: ["Chẵn", "Lẻ", "Chẵn", "Lẻ"],
          lastBets: {
            Chan: { players: 0, money: 0 },
            Le: { players: 0, money: 0 },
          },
        }
  );

  // ✅ Xử lý disconnect
  socket.on("disconnect", () => {
    console.log(`⚡ User disconnected: ${socket.id}`);
  });
});

// ✅ Kết nối databases
connectMysqlDB;
connectMysqlDB2;
connectMysqlDB3;
connectMysqlDB4;
connectMysqlDB5;
connectMongoDB();

// ✅ Bắt đầu ván mới cho game
startNewRoundTaiXiu(io);
startNewRoundBauCua(io);
startNewRoundXocDia(io);

// ✅ Server lắng nghe
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`🚀 Server is running on port: ${PORT}`);
});
