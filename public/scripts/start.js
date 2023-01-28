document.addEventListener('DOMContentLoaded', function() {
    loadLeaderboard()

})

function savePlayer() {
    const form = document.getElementById("form");
    const name = form.querySelector('[name="username"]');
    if (name.value) {
        localStorage["game.username"] = name.value;
    }
}

function loadLeaderboard() {
    let tmp = localStorage['game.leaderBoard'];
    const tableBox = document.getElementById('leaderboard-results');
    if (!tmp) {     // if leaderboard is empty
        let p = document.createElement('p');
        p.innerHTML = 'There are no players results yet';
        p.classList.add('leaderboard-string')
        tableBox.appendChild(p);
    } else {
        let arr = JSON.parse(localStorage.getItem('game.leaderBoard'));
        let newStr = '';
        for(let i = 0; i<arr.length; i++){
            newStr = newStr + arr[i][0] + ' - ' + arr[i][1] + '<br>';
        }
        let p = document.createElement('p');
        p.innerHTML = newStr;
        p.classList.add('leaderboard-string')
        tableBox.appendChild(p);
    }
    
}
    
