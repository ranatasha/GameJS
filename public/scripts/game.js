// import { GameManager } from './Managers/GameManager.js';

document.addEventListener('DOMContentLoaded', function() {
    const canvasGame = document.getElementById('canvasId');
    const gameManager = new GameManager(canvasGame);
    gameManager.play();
})
// только для блокировки скролла страницы с игрой при нажатии клавиш стрелочек
window.addEventListener("keydown", function(e) {
    if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(e.code) > -1) {
        e.preventDefault();
    }
}, false);