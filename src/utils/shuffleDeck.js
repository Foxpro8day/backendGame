const getRandomCards = () => {
  const deck = [
    { code: "2D", name: "twoDiamonds", value: 21 },
    { code: "2H", name: "twoHearts", value: 22 },
    { code: "2S", name: "twoSpades", value: 23 },
    { code: "2C", name: "twoClubs", value: 24 },
    { code: "3D", name: "threeDiamonds", value: 31 },
    { code: "3H", name: "threeHearts", value: 32 },
    { code: "3S", name: "threeSpades", value: 33 },
    { code: "3C", name: "threeClubs", value: 34 },
    { code: "4D", name: "fourDiamonds", value: 41 },
    { code: "4H", name: "fourHearts", value: 42 },
    { code: "4S", name: "fourSpades", value: 43 },
    { code: "4C", name: "fourClubs", value: 44 },
    { code: "5D", name: "fiveDiamonds", value: 51 },
    { code: "5H", name: "fiveHearts", value: 52 },
    { code: "5S", name: "fiveSpades", value: 53 },
    { code: "5C", name: "fiveClubs", value: 54 },
    { code: "6D", name: "sixDiamonds", value: 61 },
    { code: "6H", name: "sixHearts", value: 62 },
    { code: "6S", name: "sixSpades", value: 63 },
    { code: "6C", name: "sixClubs", value: 64 },
    { code: "7D", name: "sevenDiamonds", value: 71 },
    { code: "7H", name: "sevenHearts", value: 72 },
    { code: "7S", name: "sevenSpades", value: 73 },
    { code: "7C", name: "sevenClubs", value: 74 },
    { code: "8D", name: "eightDiamonds", value: 81 },
    { code: "8H", name: "eightHearts", value: 82 },
    { code: "8S", name: "eightSpades", value: 83 },
    { code: "8C", name: "eightClubs", value: 84 },
    { code: "9D", name: "nineDiamonds", value: 91 },
    { code: "9H", name: "nineHearts", value: 92 },
    { code: "9S", name: "nineSpades", value: 93 },
    { code: "9C", name: "nineClubs", value: 94 },
    { code: "10D", name: "tenDiamonds", value: 101 },
    { code: "10H", name: "tenHearts", value: 102 },
    { code: "10S", name: "tenSpades", value: 103 },
    { code: "10C", name: "tenClubs", value: 104 },
    { code: "JD", name: "jackDiamonds", value: 111 },
    { code: "JH", name: "jackHearts", value: 112 },
    { code: "JS", name: "jackSpades", value: 113 },
    { code: "JC", name: "jackClubs", value: 114 },
    { code: "QD", name: "queenDiamonds", value: 121 },
    { code: "QH", name: "queenHearts", value: 122 },
    { code: "QS", name: "queenSpades", value: 123 },
    { code: "QC", name: "queenClubs", value: 124 },
    { code: "KD", name: "kingDiamonds", value: 131 },
    { code: "KH", name: "kingHearts", value: 132 },
    { code: "KS", name: "kingSpades", value: 133 },
    { code: "KC", name: "kingClubs", value: 134 },
    { code: "AD", name: "aceDiamonds", value: 141 },
    { code: "AH", name: "aceHearts", value: 142 },
    { code: "AS", name: "aceSpades", value: 143 },
    { code: "AC", name: "aceClubs", value: 144 },
  ];

  return deck.sort(() => Math.random() - 0.5).slice(0, 5);
};

const pokerHandRanks = {
  royalFlush: 1000,
  straightFlush: 500,
  fourOfAKind: 250,
  fullHouse: 150,
  flush: 100,
  straight: 50,
  threeOfAKind: 20,
  twoPair: 10,
  onePair: 5,
};

const rankMap = new Map([
  ["2", 2],
  ["3", 3],
  ["4", 4],
  ["5", 5],
  ["6", 6],
  ["7", 7],
  ["8", 8],
  ["9", 9],
  ["10", 10],
  ["J", 11],
  ["Q", 12],
  ["K", 13],
  ["A", 14],
]);

const evaluateHand = (hand) => {
  const ranks = hand
    .map((card) => rankMap.get(card.code.slice(0, -1)))
    .sort((a, b) => a - b);

  const suits = hand.map((card) => card.code.slice(-1));

  const isFlush = new Set(suits).size === 1;
  const isStraight = ranks
    .slice()
    .sort((a, b) => a - b)
    .every((num, i, arr) => i === 0 || num - arr[i - 1] === 1);

  const rankCount = {};
  ranks.forEach((rank) => (rankCount[rank] = (rankCount[rank] || 0) + 1));
  const counts = Object.values(rankCount).sort((a, b) => b - a);

  if (isFlush && isStraight && ranks.includes(14)) return "royalFlush";
  if (isFlush && isStraight) return "straightFlush";
  if (counts[0] === 4) return "fourOfAKind";
  if (counts[0] === 3 && counts[1] === 2) return "fullHouse";
  if (isFlush) return "flush";
  if (isStraight) return "straight";
  if (counts[0] === 3) return "threeOfAKind";
  if (counts[0] === 2 && counts[1] === 2) return "twoPair";
  else return "NoWin";
};

const calculateWinnings = (hand, betAmount) => {
  const handRank = evaluateHand(hand);
  console.log(betAmount * pokerHandRanks[handRank],handRank);
  return pokerHandRanks[handRank] ? betAmount * pokerHandRanks[handRank] : 0;
};

module.exports = {
  getRandomCards,
  pokerHandRanks,
  rankMap,
  evaluateHand,
  calculateWinnings,
};
