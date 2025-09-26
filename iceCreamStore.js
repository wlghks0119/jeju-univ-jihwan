let iceCreamFlavors = [
    { name: "Chocolate", type: "Chocolate", price: 2 },
    { name: "Strawberry", type: "Fruit", price: 1 },
    { name: "Vanilla", type: "Vanilla", price: 2 },
    { name: "Pistachio", type: "Nuts", price: 1.5 },
    { name: "Neapolitan", type: "Chocolate", price: 2},
    { name: "Mint Chip", type: "Chocolate", price: 1.5 },
    { name: "Raspberry", type: "Fruit", price: 1},
];

// { scoops: [], total: }
let transactions = []
transactions.push({ scoops: ["Chocolate", "Vanilla", "Mint Chip"], total: 5.5 })
transactions.push({ scoops: ["Raspberry", "StrawBerry"], total: 2 })
transactions.push({ scoops: ["Vanilla", "Vanilla"], total: 4 })

// 수익 계산
const total = transactions.reduce((acc, curr) => acc + curr.total, 0);
console.log(`You've made ${total} $ today`); // You've made 11.5 $ today

// 각 맛의 판매량
let flavorDistribution = transactions.reduce((acc, curr) => {
    curr.scoops.forEach(scoop => {
        if (!acc[scoop]) {
            acc[scoop] = 0;
        }
        acc[scoop]++;
    })
    return acc;
}, {}) 

console.log(flavorDistribution);

// Object.keys()를 이용해 가장 많이 팔린 맛 찾기
let mostSoldFlavor = Object.keys(flavorDistribution).reduce((a, b) =>
    flavorDistribution[a] > flavorDistribution[b] ? a : b
);

console.log(`가장많이 팔린 맛: ${mostSoldFlavor} (${flavorDistribution[mostSoldFlavor]} scoops)`);
