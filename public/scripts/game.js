document.addEventListener('DOMContentLoaded', function() {
    const user = document.getElementById('username');
    user.innerHTML = localStorage['game.username'];
})

// Таблица рекордов, startpage and her styles, сохранение username - ЕСТЬ

// TO-DO-LIST:
// Стили и офрмление страницы игры, юзер инфа и отведение переменных в localstorage под SCORE
// Canvas, Tiled Map и ее отображение
// Отображение игрока, его spritesheet
// Передвижение игрока и взаимодействие с картой(обработка препятствий, чтоб игрок не выходил за пределы карты, передвижение карты за игроком)