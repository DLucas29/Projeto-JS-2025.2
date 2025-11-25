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
