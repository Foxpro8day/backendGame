const db = require("../../models"); // Import Sequelize models
const GameHistory = db.db2.GameHistory; // Lấy GameHistory từ db2

const GameStage = {
  WAITING: "waiting",
  BETTING: "betting",
  ROLLING: "rolling",
  FINISH: "finish",
};

// Danh sách mặt xúc xắc trong Bầu Cua
const DICE_FACES = ["Bau", "Cua", "Tom", "Ca", "Nai", "Ga"];

// Biến lưu tổng số người chơi & tiền cược
let totalPlayers = Object.fromEntries(DICE_FACES.map((type) => [type, 0]));
let totalMoney = Object.fromEntries(DICE_FACES.map((type) => [type, 0]));

// Hàm tung xúc xắc và tính kết quả
const rollDiceAndCalculateResult = () => {
  const dice1 = DICE_FACES[Math.floor(Math.random() * 6)];
  const dice2 = DICE_FACES[Math.floor(Math.random() * 6)];
  const dice3 = DICE_FACES[Math.floor(Math.random() * 6)];
  return { dice1, dice2, dice3, result: [dice1, dice2, dice3] };
};

// ✅ Khởi tạo trạng thái game từ database
const initializeGameState = async () => {
  try {
    const lastGame = await GameHistory.findOne({
      where: { gameType: "BC" },
      order: [["gameId", "DESC"]],
    });

    if (lastGame) {
      // console.log(`📌 Lấy dữ liệu game trước - Game ID: ${lastGame.gameId}`);

      const resultData = lastGame.result?.result || ["Bầu", "Cua", "Tôm"];
      const betsData = lastGame.result?.betsPlayer || totalPlayers;
      const moneyData = lastGame.result?.betsMoney || totalMoney;

      return {
        round: lastGame.gameId + 1,
        result: resultData,
        dice: {
          dice1: resultData[0],
          dice2: resultData[1],
          dice3: resultData[2],
          result: resultData,
        },
        bets: Object.fromEntries(
          DICE_FACES.map((type) => [
            type,
            { players: betsData[type] || 0, money: moneyData[type] || 0 },
          ])
        ),
        gameStage: GameStage.WAITING,
      };
    } else {
      // console.log("📌 Không có dữ liệu game trước, bắt đầu từ ván 1.");
      const newDice = rollDiceAndCalculateResult();
      return {
        round: 1,
        result: newDice.result,
        dice: newDice,
        bets: Object.fromEntries(
          DICE_FACES.map((type) => [type, { players: 0, money: 0 }])
        ),
        gameStage: GameStage.WAITING,
      };
    }
  } catch (error) {
    console.error("❌ Lỗi khi lấy dữ liệu game từ DB:", error);
    return {
      round: 1,
      result: ["Bầu", "Cua", "Tôm"],
      dice: rollDiceAndCalculateResult(),
      bets: Object.fromEntries(
        DICE_FACES.map((type) => [type, { players: 0, money: 0 }])
      ),
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

// Giả lập số lượng người chơi và tiền đặt cược
const fakePlayers = (type) => {
  const randomIncrease = Math.floor(Math.random() * 50) + 1;
  totalPlayers[type] += randomIncrease;
  return totalPlayers[type];
};

const fakeMoney = (type) => {
  const randomIncrease = Math.floor(Math.random() * 1000000) + 1;
  totalMoney[type] += randomIncrease;
  totalMoney[type] = Math.round(totalMoney[type] / 1000) * 1000;
  return totalMoney[type];
};

// ✅ Bắt đầu vòng mới
const startNewRound = (io) => {
  resetGameState();
  let countdown = 30;
  gameState.gameStage = GameStage.BETTING;

  const countdownInterval = setInterval(() => {
    DICE_FACES.forEach((type) => {
      gameState.bets[type].players = fakePlayers(type);
      gameState.bets[type].money = fakeMoney(type);
    });

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

// ✅ Công bố kết quả và chờ vòng mới
const finalizeRound = async (io) => {
  const diceResult = rollDiceAndCalculateResult();
  gameState.result = diceResult.result;
  gameState.dice = diceResult;
  gameState.gameStage = GameStage.FINISH;

  const gameData = {
    gameId: gameState.round,
    gameType: "BC",
    result: {
      result: gameState.result,
      betsPlayer: { ...totalPlayers },
      betsMoney: { ...totalMoney },
    },
    roomId: 0,
  };

  // console.log(gameData);
  try {
    await GameHistory.create(gameData);
    // console.log("✅ Lưu kết quả vào DB thành công!");
  } catch (error) {
    console.error("❌ Lỗi khi lưu kết quả vào DB bc:", error);
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
  totalPlayers = Object.fromEntries(DICE_FACES.map((type) => [type, 0]));
  totalMoney = Object.fromEntries(DICE_FACES.map((type) => [type, 0]));

  gameState = {
    round: gameState.round + 1,
    result: gameState.result,
    dice: gameState.dice,
    bets: Object.fromEntries(
      DICE_FACES.map((type) => [type, { players: 0, money: 0 }])
    ),
    gameStage: GameStage.WAITING,
  };
};

// ✅ Gửi dữ liệu đến client
const sendGameStateToClients = (io, countdown) => {
  io.emit("round_update_baucua", {
    ...gameState,
    countdown,
  });
};

module.exports = {
  gameState,
  startNewRound,
  rollDiceAndCalculateResult,
  fakePlayers,
};
