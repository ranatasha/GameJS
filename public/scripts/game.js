// import { GameManager } from './Managers/GameManager.js';

document.addEventListener('DOMContentLoaded', function() {
    console.log('hello')
    const canvasGame = document.getElementById('canvasId');
    const gameManager = new GameManager(canvasGame, 1);
    gameManager.play();
})

// Таблица рекордов, startpage and her styles, сохранение username - ЕСТЬ

// TO-DO-LIST:
// Стили и офрмление страницы игры, юзер инфа и отведение переменных в localstorage под SCORE - ЕСТЬ
// Canvas, Tiled Map и ее отображение - ЕСТЬ
// Создание сущностей объектов - 
// Загрузка изображений для объектов через SpriteManager -
// Передвижение игрока и взаимодействие с картой(обработка препятствий, чтоб игрок не выходил за пределы карты, передвижение карты за игроком)