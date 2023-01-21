document.addEventListener('DOMContentLoaded', function() {
    const greet = document.getElementById('greeting1');
    const player = localStorage['game.username'];
    greet.innerHTML = `Hello, ${player}!`;
})
