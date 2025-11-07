const quotes = [
    'When you have eliminated the impossible, whatever remains, however improbable, must be the truth.',
    'There is nothing more deceptive than an obvious fact.',
    'I ought to know by this time that when a fact appears to be opposed to a long train of deductions it invariably proves to be capable of bearing some other interpretation.',
    'I never make exceptions. An exception disproves the rule.',
    'What one man can invent another can discover.',
    'Nothing clears up a case so much as stating it to another person.',
    'Education never ends, Watson. It is a series of lessons, with the greatest for the last.',
];

let words = [];
let wordIndex = 0;
let startTime = 0;

const quoteElement = document.getElementById('quote');
const typedValueElement = document.getElementById('typed-value');
const startBtn = document.getElementById('start');
const modal = document.getElementById('resultModal');
const finalTime = document.getElementById('finalTime');
const bestTime = document.getElementById('bestTime');
const restartBtn = document.getElementById('restartBtn');
const mainBtn = document.getElementById('mainBtn');

function startGame() {
    const quoteIndex = Math.floor(Math.random() * quotes.length);
    const quote = quotes[quoteIndex];
    words = quote.split(' ');
    wordIndex = 0;

    const spanWords = words.map(word => `<span>${word} </span>`);
    quoteElement.innerHTML = spanWords.join('');
    quoteElement.childNodes[0].className = 'highlight';
    typedValueElement.value = '';
    typedValueElement.disabled = false;
    typedValueElement.focus();
    startBtn.disabled = true;
    startTime = new Date().getTime();
}

function endGame() {
    const elapsed = (new Date().getTime() - startTime) / 1000;
    finalTime.textContent = elapsed.toFixed(2);

    const savedBest = localStorage.getItem('bestTime') || Number.MAX_VALUE;
    const newBest = Math.min(elapsed, savedBest);
    localStorage.setItem('bestTime', newBest);
    bestTime.textContent = newBest.toFixed(2);

    modal.style.display = 'flex';
    typedValueElement.disabled = true;
    startBtn.disabled = false;
}

typedValueElement.addEventListener('input', () => {
    const currentWord = words[wordIndex];
    const typed = typedValueElement.value.trim();

    if (typed === currentWord && wordIndex === words.length - 1) {
    typedValueElement.className = 'correct';
    endGame();
    } else if (typed === currentWord && typedValueElement.value.endsWith(' ')) {
    wordIndex++;
    typedValueElement.value = '';
    typedValueElement.className = 'correct';

    for (const wordEl of quoteElement.childNodes) {
        wordEl.className = '';
    }
    if (quoteElement.childNodes[wordIndex]) {
        quoteElement.childNodes[wordIndex].className = 'highlight';
    }
    } else if (currentWord.startsWith(typed)) {
    typedValueElement.className = '';
    } else {
    typedValueElement.classList.add('error');
    typedValueElement.classList.add('shake');
    setTimeout(() => {
        typedValueElement.classList.remove('shake');
    }, 300);
    }
});

startBtn.addEventListener('click', startGame);

restartBtn.addEventListener('click', () => {
    modal.style.display = 'none';
    startGame();
});

mainBtn.addEventListener('click', () => {
    modal.style.display = 'none';
    startBtn.disabled = false;
    quoteElement.innerHTML = '';
    typedValueElement.value = '';
});
