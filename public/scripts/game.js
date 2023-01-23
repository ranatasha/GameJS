import { MapManager } from './Managers/MapManager.js';
document.addEventListener('DOMContentLoaded', function() {
    const user = document.getElementById('username');
    user.innerHTML = localStorage['game.username'];
    const mapManager = new MapManager(1);
    const canvasGame = document.getElementById('canvasId');
    const ctx = canvasGame.getContext('2d');
    mapManager.draw(ctx);
})

// Таблица рекордов, startpage and her styles, сохранение username - ЕСТЬ

// TO-DO-LIST:
// Стили и офрмление страницы игры, юзер инфа и отведение переменных в localstorage под SCORE - ЕСТЬ
// Canvas, Tiled Map и ее отображение - ЕСТЬ
// Создание сущностей объектов - 
// Загрузка изображений для объектов через SpriteManager -
// Передвижение игрока и взаимодействие с картой(обработка препятствий, чтоб игрок не выходил за пределы карты, передвижение карты за игроком)