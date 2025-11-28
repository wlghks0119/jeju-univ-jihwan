let cardOne = 8;
let cardTwo = 5;
let cardThree = 7;
let sum = cardOne + cardTwo + cardThree; // 플레이어 합계

let cardOneBank = 5;
let cardTwoBank = 5;
let cardThreeBank = 6;
let cardFourBank = 4;
let bankSum = cardOneBank + cardTwoBank + cardThreeBank + cardFourBank;

console.log(`You have ${sum} points`);
console.log(`Bank has ${bankSum} points`);

// 규칙 적용
if (sum === 21) {
    console.log("Blackjack! You win ");
} else if (sum > 21) {
    console.log("You bust! Bank wins");
} else {
    // 딜러는 17 이상에서 멈추고, 16 이하이면 카드 더 받기
    if (bankSum < 17) {
        let extraCard = 5;
        bankSum += extraCard;
        console.log(`Bank draws a card (${extraCard}). New total: ${bankSum}`);
    }

    if (bankSum > 21) {
        console.log("Bank busts! You win ");
    } else if (sum > bankSum) {
        console.log("You win 🎉");
    } else if (sum < bankSum) {
        console.log("Bank wins ");
    } else {
        console.log("It's a draw ");
    }
}
