document.addEventListener('DOMContentLoaded', function() {
    let tmp = localStorage['game.leaderBoard'];
    const tableBox = document.getElementById('leaderboard-results');
    if (!tmp) {
        let p = document.createElement('p');
        p.innerHTML = 'There are no players results yet';
        p.classList.add('leaderboard-warning')
        tableBox.appendChild(p);
    }
})

function savePlayer() {
    const form = document.getElementById("form");
    const name = form.querySelector('[name="username"]');
    if (name.value) {
        localStorage["game.username"] = name.value;
        console.log("Storing Player - YES");
    }
}