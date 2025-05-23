const db = require("../../models"); // Import Sequelize models
const GameHistory = db.db4.GameHistory; // Get GameHistory from db4

const GameStage = {
  WAITING: "waiting",
  BETTING: "betting",
  ROLLING: "rolling",
  FINISH: "finish",
};

// ✅ Xóc Đĩa possible outcomes
const XOC_DIA_RESULTS = {
  RED4: ["Red", "Red", "Red", "Red"],
  RED3_WHITE1: ["Red", "Red", "Red", "White"],
  RED2_WHITE2: ["Red", "Red", "White", "White"],
  RED1_WHITE3: ["Red", "White", "White", "White"],
  WHITE4: ["White", "White", "White", "White"],
  ODD: null, // Represents odd count of Red coins
  EVEN: null, // Represents even count of Red coins
};

// ✅ Store total players & betting money
let totalPlayers = Object.fromEntries(
  Object.keys(XOC_DIA_RESULTS).map((type) => [type, 0])
);
let totalMoney = Object.fromEntries(
  Object.keys(XOC_DIA_RESULTS).map((type) => [type, 0])
);

// ✅ Initialize game state
let gameState = {
  round: 1,
  result: "RED4",
  oddEvenResult: "EVEN",
  coinFaces: ["Red", "Red", "Red", "Red"],
  bets: Object.fromEntries(
    Object.keys(XOC_DIA_RESULTS).map((type) => [type, { players: 0, money: 0 }])
  ),
  gameStage: GameStage.WAITING,
};

// ✅ Function to shake the plate and calculate result
const shakePlateAndCalculateResult = () => {
  const coinFaces = Array(4)
    .fill(0)
    .map(() => (Math.random() < 0.5 ? "Red" : "White")); // 50% chance of Red/White

  const redCount = coinFaces.filter((side) => side === "Red").length;

  // ✅ Determine the result based on the number of red faces
  let result;
  switch (redCount) {
    case 4:
      result = "RED4";
      break;
    case 3:
      result = "RED3_WHITE1";
      break;
    case 2:
      result = "RED2_WHITE2";
      break;
    case 1:
      result = "RED1_WHITE3";
      break;
    case 0:
      result = "WHITE4";
      break;
  }

  // ✅ Determine ODD or EVEN
  const oddEvenResult = redCount % 2 === 0 ? "EVEN" : "ODD";

  return { coinFaces, result, oddEvenResult };
};

// ✅ Initialize game state from database
const initializeGameState = async () => {
  try {
    const lastGame = await GameHistory.findOne({
      where: { gameType: "XD" }, // Xóc Đĩa = XD
      order: [["gameId", "DESC"]],
    });

    if (lastGame) {
      // console.log(`📌 Retrieved last game - Game ID: ${lastGame.gameId}`);

      gameState = {
        round: lastGame.gameId + 1,
        result: lastGame.result?.result || "RED4",
        oddEvenResult: lastGame.result?.oddEvenResult || "EVEN",
        coinFaces: lastGame.result?.coinFaces || ["Red", "Red", "Red", "White"],
        bets: Object.fromEntries(
          Object.keys(XOC_DIA_RESULTS).map((type) => [
            type,
            {
              players: lastGame.result?.betsPlayer?.[type] || 0,
              money: lastGame.result?.betsMoney?.[type] || 0,
            },
          ])
        ),
        gameStage: GameStage.WAITING,
      };
    }
  } catch (error) {
    console.error("❌ Error fetching game data from DB:", error);
  }
};

// ✅ Call initializeGameState() when file is loaded
initializeGameState();

// ✅ Simulate players and bet amounts (Updated to match Bầu Cua)
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

// ✅ Start a new round
const startNewRound = (io) => {
  resetGameState();
  let countdown = 30;
  gameState.gameStage = GameStage.BETTING;

  const countdownInterval = setInterval(() => {
    if (!gameState.bets) {
      console.error("❌ gameState.bets is undefined! Skipping update.");
      return;
    }

    Object.keys(gameState.bets).forEach((type) => {
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

// ✅ Process shaking
const processRoundResult = (io) => {
  gameState.gameStage = GameStage.ROLLING;
  let rollingCountdown = 5;

  const rollingInterval = setInterval(() => {
    sendGameStateToClients(io, rollingCountdown);
    rollingCountdown--;

    if (rollingCountdown < 0) {
      clearInterval(rollingInterval);
      finalizeRound(io);
    }
  }, 1000);
};

// ✅ Finalize round and save to DB
const finalizeRound = async (io) => {
  const coinResult = shakePlateAndCalculateResult();
  gameState.result = coinResult.result;
  gameState.oddEvenResult = coinResult.oddEvenResult;
  gameState.coinFaces = coinResult.coinFaces;
  gameState.gameStage = GameStage.FINISH;

  const gameData = {
    gameId: gameState.round,
    gameType: "XD",
    result: {
      result: gameState.result,
      oddEvenResult: gameState.oddEvenResult,
      coinFaces: gameState.coinFaces,
      betsPlayer: { ...totalPlayers },
      betsMoney: { ...totalMoney },
    },
    roomId: 0,
  };

  // console.log(gameData);
  try {
    await GameHistory.create(gameData);
    // console.log("✅ Successfully saved game result to DB!");
  } catch (error) {
    console.error("❌ Error saving game result to DB xd:", error);
  }

  sendGameStateToClients(io, 5);
  setTimeout(() => startNextRoundCountdown(io), 5000);
};

// ✅ Wait for next round với countdown đếm ngược từ 10 giây
const startNextRoundCountdown = (io) => {
  gameState.gameStage = GameStage.WAITING;
  let waitingCountdown = 10;
  const waitingInterval = setInterval(() => {
    sendGameStateToClients(io, waitingCountdown);
    waitingCountdown--;
    if (waitingCountdown < 0) {
      clearInterval(waitingInterval);
      startNewRound(io);
    }
  }, 1000);
};

// ✅ Reset game state
const resetGameState = () => {
  totalPlayers = Object.fromEntries(
    Object.keys(XOC_DIA_RESULTS).map((type) => [type, 0])
  );
  totalMoney = Object.fromEntries(
    Object.keys(XOC_DIA_RESULTS).map((type) => [type, 0])
  );

  gameState.round += 1;
  gameState.bets = Object.fromEntries(
    Object.keys(XOC_DIA_RESULTS).map((type) => [type, { players: 0, money: 0 }])
  );
};

// ✅ Send data to client
const sendGameStateToClients = (io, countdown) => {
  io.emit("round_update_xocdia", { ...gameState, countdown });
};

module.exports = { gameState, startNewRound, shakePlateAndCalculateResult };
