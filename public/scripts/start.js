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
        p.classList.add('leaderboard-warning')
        tableBox.appendChild(p);
    } else {
        updateLeaderboard()
    }
    
}

function updateLeaderboard() {
    let arr = JSON.parse(localStorage.getItem('game.leaderBoard'));
    // check: Is there user in the leaderboard for updating his result?
    let userWas = false;
    for(let i=0; i<arr.length; i++){
        if(arr[i][0] === localStorage['game.username']){
            if(localStorage['game.score'] > arr[i][1])
                arr[i][1] = localStorage['game.score'];
            userWas = true;
        }
    }
    if(!userWas)
        arr.push([localStorage['game.username'], localStorage['game.score']]);
    arr.sort((function(index){
        return function(a, b){
            return (a[index] === b[index] ? 0 : (a[index] < b[index] ? 1 : -1));
        };
    })(1));
    localStorage.setItem('game.leaderBoard', JSON.stringify(arr));
}

