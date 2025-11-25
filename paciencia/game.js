//Organização do Canvas
const canvas = document.getElementById('jogo');
const ctx = canvas.getContext('2d');

const CARD_W = 100;
const CARD_H = 150;
const ROW_GAP = 20;
const SNAP_RADIUS = 4;

function resizeCanvasToDisplaySize(canvas) {
    const dpr = window.devicePixelRatio || 1;
    const cssWidth = canvas.clientWidth;
    const cssHeight = canvas.clientHeight;
    const displayWidth = Math.floor(cssWidth * dpr);
    const displayHeight = Math.floor(cssHeight * dpr);
    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        canvas.width = displayWidth;
        canvas.height = displayHeight;
        
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        return true;
    }
    return false;
}

window.addEventListener('resize', () => resizeCanvasToDisplaySize(canvas));
resizeCanvasToDisplaySize(canvas);

class CardSnap {
    constructor(x, y, type){
        this.x = x;
        this.y = y;
        this.type = type;
        this.cards = [];
    }
}

class Card {
    constructor(number, suit) {
        this.number = number;
        this.suit = suit;
        this.flipped = false;
        this.snap = mainSetClosed();
        this.movingX = 0;
        this.movingY = 0;
        this.mouseX = 0;
        this.mouseY = 0;
    }

    drawCard(x, y, isMoving = false) {
        if (!isMoving && movingCards.includes(this)) return;
    ctx.strokeStyle = "black";
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.roundRect(x, y, CARD_W, CARD_H, SNAP_RADIUS);
    ctx.stroke();
    ctx.fill();

        let suitImage = new Image();

        if(this.flipped) {
            switch(this.suit) {                
                case "diamonds":
                    ctx.fillStyle = "red";
                    suitImage.src = "imagens/diamonds.png";
                    break;
                case "spades":
                    ctx.fillStyle = "black";
                    suitImage.src = "imagens/spades.png";
                    break;
                case "hearts": 
                    ctx.fillStyle = "red";
                    suitImage.src = "imagens/hearts.png";
                    break;
                case "clubs":
                    ctx.fillStyle = "black";
                    suitImage.src = "imagens/clubs.png";
                    break;
            }
            ctx.font = "20px Arial";
            ctx.beginPath();
            ctx.fillText(this.number, x + 7, y + 26);
            ctx.drawImage(suitImage, x + 28, y + 7, 16, 20);
            
        } else {
            ctx.fillStyle = "blue";
            ctx.beginPath();
            ctx.roundRect(x + 5, y + 5, CARD_W - 10, CARD_H - 10, SNAP_RADIUS);
            ctx.fill();
        }
    }
    moveSnap(newSnap) {
        let oldSnap = this.snap;
        let i = oldSnap.cards.indexOf(this);
        oldSnap.cards.splice(i, 1);
        this.snap = newSnap;
        newSnap.cards.push(this);

        if (oldSnap.type == "tower" && oldSnap.cards.length) {
            oldSnap.cards[oldSnap.cards.length - 1].flipped = true;
        }
        if (newSnap.type == "mainSetClosed") {
            this.flipped = false;
        } else {
            this.flipped = true;
        }
    }

    canMoveToSnap(newSnap) {
        const snapCurrentCard = newSnap.cards[newSnap.cards.length - 1];
        
        
        if (!snapCurrentCard && this.number == "A" && newSnap.type == "mount") {
            return true;
        }
        
        if (!snapCurrentCard && newSnap.type == "tower") {
            return true;
        }
        
        if (snapCurrentCard && newSnap.type == "tower" && numbers.indexOf(this.number) == numbers.indexOf(snapCurrentCard.number) -1 && stackableSuit(this.suit, snapCurrentCard.suit)) {
            return true;
        }
        
        if (snapCurrentCard && numbers.indexOf(this.number) == numbers.indexOf(snapCurrentCard.number) + 1 &&
        this.suit == snapCurrentCard.suit && newSnap.type == "mount") {
            return true;
        }
        return false;
    }
}

let initialCards = [];
let movingCards = [];
const suits = ["diamonds", "spades", "hearts", "clubs"];
const numbers = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
const towerN = [1, 2, 3, 4, 5, 6, 7];

const cardSnaps = [
    new CardSnap(40, 30, "mainSetClosed"),
    new CardSnap(160, 30, "mainSetOpened"),
    
    new CardSnap(400, 30, "mount"),
    new CardSnap(520, 30, "mount"),
    new CardSnap(640, 30, "mount"),
    new CardSnap(760, 30, "mount"),
    
    new CardSnap(40, 200, "tower"),
    new CardSnap(160, 200, "tower"),
    new CardSnap(280, 200, "tower"),
    new CardSnap(400, 200, "tower"),
    new CardSnap(520, 200, "tower"),
    new CardSnap(640, 200, "tower"),
    new CardSnap(760, 200, "tower"),
];

let gameOver = false;
let currentBouncingSnapIndex = 5;
let currentBouncingCardIndex = 12;

//Funções Lógicas do Jogo
function generateCardSet() {
    suits.map(s => {
        numbers.map(n =>{
            initialCards.push(new Card(n, s));
        })
    })
}

function shuffleSet() {
    for (let i = initialCards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [initialCards[i], initialCards[j]] = [initialCards[j], initialCards[i]];
    }
}

function distributeInitialSetup () {
    for (let i = 0; i < 7; i++) {
        for(let j = 0; j < towerN[i]; j++) {
            let index = Math.floor(Math.random() * initialCards.length);
            let randomCard = initialCards[index];
            const snap = cardSnaps[i + 6];
            snap.cards.push(randomCard);
            randomCard.snap = snap;

            if (j == towerN[i] - 1) {
                randomCard.flipped = true;
            }

            initialCards.splice(index, 1);
        }
    }

    mainSetClosed().cards = initialCards;
}

function detectClickedCard(x, y) {
    for (let s of cardSnaps) {
        let maxFactor = 0;
        if (s.type === "tower") {
            const lastIndex = Math.max(0, s.cards.length - 1);
            maxFactor = lastIndex * ROW_GAP;
        }

        if (x >= s.x && x <= s.x + CARD_W && y >= s.y && y <= s.y + CARD_H + maxFactor) {
            switch (s.type) {
                case "tower": {
                    if (s.cards.length === 0) break;
                    let relIndex = Math.floor((y - s.y) / ROW_GAP);
                    relIndex = Math.max(0, Math.min(relIndex, s.cards.length - 1));

                    const firstFaceUp = s.cards.findIndex(c => c.flipped);
                    const pickIndex = Math.max(relIndex, firstFaceUp >= 0 ? firstFaceUp : s.cards.length);
                    if (!s.cards[pickIndex] || !s.cards[pickIndex].flipped) break;

                    movingCards = s.cards.slice(pickIndex);
                    movingCards.forEach((f, k) => {
                        f.movingX = s.x;
                        f.movingY = s.y + (pickIndex + k) * ROW_GAP;
                    });
                    break;
                }
                case "mainSetOpened": {
                    if (s.cards.length && s.cards[s.cards.length - 1].flipped) {
                        const c = s.cards[s.cards.length - 1];
                        c.movingX = s.x;
                        c.movingY = s.y;
                        movingCards = [c];
                    }
                    break;
                }
            }

            if (movingCards.length) return;
        }
    }

    if (x >= mainSetClosed().x && x <= mainSetClosed().x + CARD_W && y >= mainSetClosed().y && y <= mainSetClosed().y + CARD_H) {
        const cards = mainSetClosed().cards;
        if (!cards.length) {
            const openedCards = [...mainSetOpened().cards];
            openedCards.forEach(c => c.moveSnap(mainSetClosed()));
            return;
        }
        const card = cards[0];
        card.moveSnap(mainSetOpened());
        if (checkWin()) { gameOver = true; setTimeout(() => { alert('Parabéns — você venceu!'); }, 100); }
    }
}

function detectSnappedArea(card, x, y) {
    if (!card) return;

    for (const s of cardSnaps) {
        let maxFactor = 0;
        if (s.type === "tower") {
            const lastIndex = Math.max(0, s.cards.length - 1);
            maxFactor = lastIndex * ROW_GAP;
        }
        if (x >= s.x && x <= s.x + CARD_W && y >= s.y && y <= s.y + CARD_H + maxFactor) {
            if (card.canMoveToSnap(s)) {
                movingCards.forEach(c => c.moveSnap(s));

                if (checkWin()) {
                    gameOver = true;

                    setTimeout(() => { alert('Parabéns — você venceu!'); }, 100);
                }
                return;
            }
        }
    }
}

function start() {
    resizeCanvasToDisplaySize(canvas);
    generateCardSet();
    shuffleSet();
    distributeInitialSetup();
}

function checkWin() {
    const foundations = cardSnaps.slice(2, 6);
    return foundations.every(f => f.cards.length === 13);
}

//Funções de Utilidade
function mainSetOpened() {
    return cardSnaps.find(s => s.type == "mainSetOpened");   
}

function mainSetClosed() {
    return cardSnaps.find(s => s.type == "mainSetClosed");   
}

function getXY(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    return [x, y];
}

function allCards() {
    return cardSnaps.map(s => s.cards).flat();
}

function stackableSuit(suitA, suitB) {
    switch(suitA) {
        case "diamonds":
        case "hearts":
            return ["clubs","spades"].includes(suitB);
        case "clubs":
        case "spades":
            return ["diamonds","hearts"].includes(suitB);
    }
}
