const db = require("../../models"); // Import Sequelize models
const GameHistory = db.db3.GameHistory; // Lấy GameHistory từ db2

const GameStage = {
  WAITING: "waiting",
  BETTING: "betting",
  ROLLING: "rolling",
  FINISH: "finish",
};

// ✅ Hàm tung xúc xắc và tính kết quả
const rollDiceAndCalculateResult = () => {
  const dice1 = Math.floor(Math.random() * 6) + 1;
  const dice2 = Math.floor(Math.random() * 6) + 1;
  const dice3 = Math.floor(Math.random() * 6) + 1;
  const total = dice1 + dice2 + dice3;
  const result = total >= 11 ? "Tài" : "Xỉu";

  return { dice1, dice2, dice3, total, result };
};

// ✅ Khởi tạo trạng thái game từ database
const initializeGameState = async () => {
  try {
    const lastGame = await GameHistory.findOne({
      where: { gameType: "TX" }, // Lấy game gần nhất có type TX (Tài Xỉu)
      order: [["gameId", "DESC"]],
    });

    if (lastGame) {
      // console.log(`📌 Lấy dữ liệu game trước - Game ID: ${lastGame.gameId}`);

      return {
        round: lastGame.gameId + 1,
        result: lastGame.result?.result || "Tài",
        dice: {
          dice1: lastGame.result?.dice1 || 1,
          dice2: lastGame.result?.dice2 || 2,
          dice3: lastGame.result?.dice3 || 3,
          total: lastGame.result?.total || 6,
          result: lastGame.result?.result || "Tài",
        },
        bets: {
          tai: {
            players: lastGame.result?.betsPlayer?.tai || 0,
            money: lastGame.result?.betsMoney?.tai || 0,
          },
          xiu: {
            players: lastGame.result?.betsPlayer?.xiu || 0,
            money: lastGame.result?.betsMoney?.xiu || 0,
          },
        },
        gameStage: GameStage.WAITING,
      };
    } else {
      // console.log("📌 Không có dữ liệu game trước, bắt đầu từ ván 1.");
      const newDice = rollDiceAndCalculateResult();
      return {
        round: 1,
        result: newDice.result,
        dice: newDice,
        bets: {
          tai: { players: 0, money: 0 },
          xiu: { players: 0, money: 0 },
        },
        gameStage: GameStage.WAITING,
      };
    }
  } catch (error) {
    console.error("❌ Lỗi khi lấy dữ liệu game từ DB:", error);
    return {
      round: 1,
      result: "Tài",
      dice: rollDiceAndCalculateResult(),
      bets: {
        tai: { players: 0, money: 0 },
        xiu: { players: 0, money: 0 },
      },
      gameStage: GameStage.WAITING,
    };
  }
};

// ✅ Hàm khởi tạo gameState
let gameState = {};
const startGame = async () => {
  gameState = await initializeGameState();
  // console.log(`✅ GameState đã khởi tạo với round: ${gameState.round}`);
};

// ✅ Gọi startGame() khi file được load
startGame();

// ✅ Giả lập số lượng người chơi và tiền đặt cược
const fakePlayers = (type) => {
  return Math.floor(Math.random() * 50) + 1;
};

const fakeMoney = (type) => {
  return Math.round((Math.floor(Math.random() * 1000000) + 1) / 1000) * 1000;
};

// ✅ Bắt đầu vòng mới
const startNewRound = (io) => {
  resetGameState();
  let countdown = 30;
  gameState.gameStage = GameStage.BETTING;

  const countdownInterval = setInterval(() => {
    gameState.bets.tai.players += fakePlayers("tai");
    gameState.bets.tai.money += fakeMoney("tai");
    gameState.bets.xiu.players += fakePlayers("xiu");
    gameState.bets.xiu.money += fakeMoney("xiu");

    sendGameStateToClients(io, countdown);
    countdown--;

    if (countdown < 0) {
      clearInterval(countdownInterval);
      processRoundResult(io);
    }
  }, 1000);
};

// ✅ Xử lý tung xúc xắc
const processRoundResult = (io) => {
  gameState.gameStage = GameStage.ROLLING;
  let rollingCountdown = 3;

  const rollingInterval = setInterval(() => {
    sendGameStateToClients(io, rollingCountdown);
    rollingCountdown--;

    if (rollingCountdown < 0) {
      clearInterval(rollingInterval);
      finalizeRound(io);
    }
  }, 1000);
};

// ✅ Công bố kết quả và lưu vào DB
const finalizeRound = async (io) => {
  const diceResult = rollDiceAndCalculateResult();
  gameState.result = diceResult.result;
  gameState.dice = diceResult;
  gameState.gameStage = GameStage.FINISH;

  const gameData = {
    gameId: gameState.round,
    gameType: "TX",
    result: {
      result: gameState.result,
      dice1: diceResult.dice1,
      dice2: diceResult.dice2,
      dice3: diceResult.dice3,
      total: diceResult.total,
      betsPlayer: {
        tai: gameState.bets.tai.players,
        xiu: gameState.bets.xiu.players,
      },
      betsMoney: {
        tai: gameState.bets.tai.money,
        xiu: gameState.bets.xiu.money,
      },
    },
    roomId: 0,
  };

  // console.log(gameData);
  try {
    await GameHistory.create(gameData);
    // console.log("✅ Lưu kết quả vào DB thành công!");
  } catch (error) {
    console.error("❌ Lỗi khi lưu kết quả vào DB tx:", error);
  }

  sendGameStateToClients(io, 5);
  setTimeout(() => startNextRoundCountdown(io), 5000);
};

// ✅ Chờ vòng mới
const startNextRoundCountdown = (io) => {
  gameState.gameStage = GameStage.WAITING;
  let nextRoundCountdown = 10;

  const nextRoundInterval = setInterval(() => {
    sendGameStateToClients(io, nextRoundCountdown);
    nextRoundCountdown--;

    if (nextRoundCountdown < 0) {
      clearInterval(nextRoundInterval);
      startNewRound(io);
    }
  }, 1000);
};

// ✅ Reset trạng thái game
const resetGameState = () => {
  gameState = {
    round: gameState.round + 1,
    result: gameState.result,
    dice: gameState.dice,
    bets: {
      tai: { players: 0, money: 0 },
      xiu: { players: 0, money: 0 },
    },
    gameStage: GameStage.WAITING,
  };
};

// ✅ Gửi dữ liệu đến client
const sendGameStateToClients = (io, countdown) => {
  io.emit("round_update_taixiu", {
    round: gameState.round,
    gameStage: gameState.gameStage,
    result: gameState.result || "Đang chờ...",
    dice1: gameState.dice?.dice1 || 0,
    dice2: gameState.dice?.dice2 || 0,
    dice3: gameState.dice?.dice3 || 0,
    total: gameState.dice?.total || 0,
    countdown,
    bets: gameState.bets,
  });
};

module.exports = {
  gameState,
  startNewRound,
  rollDiceAndCalculateResult,
  fakePlayers,
};
