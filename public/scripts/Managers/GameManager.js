// import {MapManager} from './MapManager.js';
// import {SpriteManager} from './SpriteManager.js';
// //import {EventsManager} from './events.manager.js';
// import {Player} from '../Entities/Player.js';
// import {Skeleton} from '../Entities/Skeleton.js.js';
// import {Heart} from '../Entities/Heart.js';
// import {Key} from '../Entities/Key.js';

/*export*/ class GameManager {
    constructor(canvas, level) {
        const user = document.getElementById('username');
        user.innerHTML = localStorage['game.username'];

        this.score = 0;
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.entities = [];
        this.fireNum = 0;
        this.player = null;
        this.laterKill = [];
        this.curLevel = level;
        this.boss = null;

        this.factory['Player'] = Player;
        this.factory['Skeleton'] = Skeleton;
        this.factory['Boss'] = Boss;
        this.factory['Heart'] = Heart;
        this.factory['Key'] = Key;
        this.factory['Potion'] = Potion;
        this.factory['Fireball'] = Fireball;

        this.loadLevel(level);  // внутри есть отрисовка тайлов и карты, загрузка уровня
        this.spriteManager = new SpriteManager();   // подготовка массива sprites, отрисовка объектов будет уже непосредственно в this.draw(), где перебираются объекты и вызывается draw()

        //this.eventsManager = new EventsManager(canvas);

        // this.soundManager = new SoundManager();
        // this.soundManager.loadArray(['blaster.mp3', 'crunch.mp3', 'background.mp3']);
        // this.soundManager.play('background.mp3', {looping: true});

    }

    loadLevel(level) {  // вызывается в конструкторе gameManager
        this.entities = [];
        this.player = undefined;    // назначается при parseEntities() ниже
        this.mapManager = new MapManager(level);
        this.physicManager = new PhysicManager(this, this.mapManager);
        this.mapManager.parseEntities(this/*, this.physicManager, this.soundManager*/);
        this.mapManager.draw(this.ctx);         // отрисовка карты, тайлов
    }
    factory = {};

    play() {
        this.interval = setInterval( (( (self) => () => {
            self.update();
        })(this)), 100 );
    }

    initPlayer(obj) {       // вызывается в parseEntities, где извлекаются и перебираются объекты на карте(player в том числе)
        this.player = obj;
    }
    kill(obj) {             // gameManager.kill(obj) - добавляет объекты с список laterkill, кого уничтожить, убрать с карты по завершении такта / хода
        this.laterKill.push(obj);
    }
    update() {              // изменение состояния карты / объектов на каждом шаге
        document.getElementById('health').innerHTML = `${this.player.lifetime}`;
        document.getElementById('score').innerHTML = `${this.score}`;

        if(this.player === null) {
            return;
        }
        if (this.player.lifetime <= 0) {
            this.endGame();
        }

        // подготовка передвижения игрока и его выстрелов
        this.player.move_x = 0;     // изначально
        this.player.move_y = 0;
        /*
        if (this.eventsManager.action['up']) this.player.move_y = -1;
        if (this.eventsManager.action['down']) this.player.move_y = 1;
        if (this.eventsManager.action['left']) this.player.move_x = -1;
        if (this.eventsManager.action['right']) this.player.move_x = 1;
        if (this.eventsManager.action['fire']) {
            //this.soundManager.play('blaster.mp3');
            const fb = new Fireball();

            fb.pos_x += fb.move_x*20 ;

            this.entities.push(fb);

            this.eventsManager.action['fire'] = false;
            // this.player.fire();
        }*/
        
        // передвигаем все объекты
        let isEnemiesLeft = false;
        
        // нахождение координат босса
        if(!this.boss && this.curLevel === 2) {
            this.boss = this.entities.find(obj => obj.name === 'Boss')
            this.bossInterval = setInterval(()=>{
                this.boss.fire(this)
            }, 3000)
        }
        
        console.log(this.entities)
        this.entities.forEach((e) => {
            try {
                // предварительно подготавливаем движение стрел
                if( e instanceof Arrow){
                    e.pos_x += e.move_x * 10;
                    e.pos_y += e.move_y * 10;
                    this.physicManager.update(e);
                }
                // предварительно подготавливаем движение скелетов перед каждым шагом, поскольку движение меняется в ходе игры
                else if(e instanceof Skeleton && Math.abs(e.pos_x - this.player.pos_x) + Math.abs(e.pos_y - this.player.pos_y) <= 120){  // приближение к игроку
                    isEnemiesLeft = true;
                    if(e.move_x === 0){
                        e.move_x = Math.sign(this.player.pos_x - e.pos_x);
                        e.move_y = 0;
                    } else if(e.move_y === 0) {
                        e.move_y = Math.sign(this.player.pos_y - e.pos_y);
                        e.move_x = 0;
                    }
                    this.physicManager.update(e);
                } else if ( e instanceof Skeleton && Math.abs(e.pos_x - this.player.pos_x) + Math.abs(e.pos_y - this.player.pos_y) > 120) { //самостоятельное движение вдали от игрока
                    isEnemiesLeft = true;
                    if(e.name.match(/Skelet[135]/)){
                        if(e.move_x === 0 && e.move_y === 0){
                            e.move_x = 1;
                            e.move_y = 0;
                        }
                        let motion = this.physicManager.update(e);
                        if(motion === 'break') {    // если уперлись во что-то, то меняем направление
                            e.move_x = -e.move_x;
                        }
                    }
                    if(e.name.match(/Skelet[24]/)){
                        if(e.move_x === 0 && e.move_y === 0) {
                            e.move_x = 0;
                            e.move_y = 1;
                        }
                        let motion = this.physicManager.update(e);
                        if(motion === 'break') {    // если уперлись во что-то, то меняем направление
                            e.move_y = -e.move_y;
                        }
                    }
                // предварительно подготавливаем движение босса перед каждым шагом, поскольку движение меняется в ходе игры
                } else if ( e instanceof Boss) {
                    isEnemiesLeft = true;
                    if(Math.abs(e.pos_x - this.player.pos_x) + Math.abs(e.pos_y - this.player.pos_y) <= 120) {
                        isEnemiesLeft = true;
                        if(e.move_x === 0){
                            e.move_x = Math.sign(this.player.pos_x - e.pos_x);
                            e.move_y = 0;
                        } else if( e.move_y === 0) {
                            e.move_y = Math.sign(this.player.pos_y - e.pos_y);
                            e.move_x = 0;
                        }
                        this.physicManager.update(e);
                    } else if(Math.abs(e.pos_x - this.player.pos_x) + Math.abs(e.pos_y - this.player.pos_y) > 120){
                        isEnemiesLeft = true;
                        if(e.move_x === 0 && e.move_y === 0) {
                            e.move_x = 0;
                            e.move_y = 1;
                        }
                        let motion = this.physicManager.update(e);
                        if(motion === 'break') {    // если уперлись во что-то, то меняем направление
                            let tmp = e.move_y;
                            e.move_y = -e.move_x;
                            e.move_x = tmp;
                        }
                    }
                } else {    // передвигаем остальные объекты (игрока, стрелы, выстрелы)
                    this.physicManager.update(e);   // делаем шаг, перемещаем объекты в physicManager, обновляя их координаты и состояние
                }
                if(e.isKilled()){
                    this.laterKill.push(e)
                    if(e instanceof Skeleton)
                        this.score += 100;
                    if(e instanceof Boss){
                        this.score += 500;
                        this.endGame()
                    }

                }
            } catch(ex) {
                console.log(ex);
            }
        });
        
        for(let i = 0; i < this.laterKill.length; i++) {
            const idx = this.entities.indexOf(this.laterKill[i]);
            if(idx > -1) {
                this.entities.splice(idx, 1);
            }
        }
        if(this.laterKill.length > 0) {
            this.laterKill.length = 0;
        }

        this.mapManager.draw(this.ctx); // перерисовка карты
        this.draw(this.ctx);            // перерисовка объектов-спрайтов
        
        // установка и генерация стрел
        // if(this.curLevel === 2 && this.boss && this.boss.currentSprite % 3 == 2) {
        //
        //     const ar_up = new Arrow(); // параметры задают направление движения move_x, move_y каждой стрелы
        //     ar_up.move_x = 0;
        //     ar_up.move_y = -1;
        //     ar_up.pos_x = this.boss.x;
        //     ar_up.pos_y = this.boss.y - 20;
        //     this.entities.push(ar_up);
        //
        //     // const ar_left = new Arrow();
        //     // ar_left.move_x = -1;
        //     // ar_left.move_y = 0;
        //     // ar_left.pos_x = this.boss.x - 20;
        //     // ar_left.pos_y = this.boss.y;
        //     // this.entities.push(ar_left);
        //     //
        //     // const ar_right = new Arrow();
        //     // ar_right.move_x = 1;
        //     // ar_right.move_y = 0;
        //     // ar_right.pos_x = this.boss.x + 20;
        //     // ar_right.pos_y = this.boss.y;
        //     // this.entities.push(ar_right);
        //     //
        //     // const ar_down = new Arrow();
        //     // ar_down.move_x = 0;
        //     // ar_down.move_y = 1;
        //     // ar_down.pos_x = this.boss.x;
        //     // ar_down.pos_y = this.boss.y + 20;
        //     // this.entities.push(ar_down);
        // }
        if(!isEnemiesLeft)
            this.nextLevel();
    }

    draw() {
        for(let i=0; i< this.entities.length; i++) {
            this.entities[i].draw(this.spriteManager, this.ctx);
        }
    }
    /*
    nextLevel(){
        clearInterval(this.interval);
        if (this.curLevel === 2){
            this.endGame();
        } else{
            this.curLevel += 1;
            this.loadLevel(this.currentLevel, this.canvas);
            alert('Вы переходите на следующий уровень');
            this.play();
        }
    }
    */

    endGame() {
        clearInterval(this.interval);
        clearInterval(this.bossInterval)
        /*
        const scores = new Map(JSON.parse(localStorage.scores ?? '[]'));
        if ((scores.get(localStorage.name) ?? 0) <= this.score) { scores.set(localStorage.name, this.score); }
        localStorage.setItem('scores', JSON.stringify(Array.from(scores.entries())));
        */
        alert(`Your score: ${this.score}!`);
        location.href = 'http://localhost:8080/start';

    }
}

window.GameManager = GameManager;