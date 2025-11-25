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