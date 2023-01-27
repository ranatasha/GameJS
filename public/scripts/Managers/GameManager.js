// import {MapManager} from './MapManager.js';
// import {SpriteManager} from './SpriteManager.js';
// //import {EventsManager} from './events.manager.js';
// import {Player} from '../Entities/Player.js';
// import {Skeleton} from '../Entities/Skeleton.js.js';
// import {Heart} from '../Entities/Heart.js';
// import {Key} from '../Entities/Key.js';
 
class GameManager {
    constructor(canvas, level) {
        const user = document.getElementById('username');
        user.innerHTML = localStorage['game.username'];

        this.score = 0;
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.entities = [];
        this.fireNum = 0;
        this.player = null;
        this.boss = null;
        this.isEnemiesOnMap = false;
        this.laterKill = [];
        this.curLevel = level;


        this.factory['Player'] = Player;
        this.factory['Skeleton'] = Skeleton;
        this.factory['Boss'] = Boss;
        this.factory['Heart'] = Heart;
        this.factory['Key'] = Key;
        this.factory['Potion'] = Potion;
        this.factory['Fireball'] = Fireball;
        this.factory['Arrow'] = Arrow;

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

        // нахождение координат босса
        setTimeout(()=>{
            if(!this.boss && this.curLevel === 2) {
                this.boss = this.entities.find(obj => obj.name === 'Boss')
                this.bossInterval = setInterval(()=>{
                    this.boss.fire(this)
                }, 3000)
            }
        }, 100)
    }

    initPlayer(obj) {    // вызывается в parseEntities, где извлекаются и перебираются объекты на карте(player в том числе)
        this.player = obj;
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

        this.entities.forEach((e) => {
            try {
                // проверяем есть ли враги
                if (e instanceof Skeleton || e instanceof Boss)
                    this.isEnemiesOnMap = true;

                // предварительно подготавливаем движение стрел
                if( e instanceof Arrow){
                    e.pos_x += e.move_x * 15;
                    e.pos_y += e.move_y * 15;
                    this.physicManager.update(e);
                }
                // предварительно подготавливаем движение скелетов перед каждым шагом, поскольку движение меняется в ходе игры
                else if(e instanceof Skeleton && Math.abs(e.pos_x - this.player.pos_x) + Math.abs(e.pos_y - this.player.pos_y) <= 120){  // приближение к игроку
                    if(e.move_x === 0){
                        e.move_x = Math.sign(this.player.pos_x - e.pos_x);
                        e.move_y = 0;
                    } else if(e.move_y === 0) {
                        e.move_y = Math.sign(this.player.pos_y - e.pos_y);
                        e.move_x = 0;
                    }
                    this.physicManager.update(e);
                } else if ( e instanceof Skeleton && Math.abs(e.pos_x - this.player.pos_x) + Math.abs(e.pos_y - this.player.pos_y) > 120) { //самостоятельное движение вдали от игрока
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
                    if(Math.abs(e.pos_x - this.player.pos_x) + Math.abs(e.pos_y - this.player.pos_y) <= 120) {
                        if(e.move_x === 0){
                            e.move_x = Math.sign(this.player.pos_x - e.pos_x);
                            e.move_y = 0;
                        } else if( e.move_y === 0) {
                            e.move_y = Math.sign(this.player.pos_y - e.pos_y);
                            e.move_x = 0;
                        }
                        this.physicManager.update(e);
                    } else if(Math.abs(e.pos_x - this.player.pos_x) + Math.abs(e.pos_y - this.player.pos_y) > 120){
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
                    this.kill(e)

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

        if(!this.isEnemiesOnMap)
            this.nextLevel();
    }

    draw() {
        for(let i=0; i< this.entities.length; i++) {
            this.entities[i].draw(this.spriteManager, this.ctx);
        }
    }
    kill(e) {   // объект который необходимо убрать с карты
        this.laterKill.push(e)
        if(e instanceof Skeleton)
            this.score += 100;
        if(e instanceof Boss){
            this.score += 500;
            this.endGame()
        }
        if(e instanceof Heart)
            this.score += 50;
        if(e instanceof Potion)
            this.score += 75;
        if(e instanceof Key)
            this.score += 200;
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
        if (this.curLevel === 2)
            clearInterval(this.bossInterval)
        let s = ''
        if(this.player.lifetime <= 0)
            s += 'You LOSE this game!'
        else
            s += 'You WIN this game!'
        /*
        const scores = new Map(JSON.parse(localStorage.scores ?? '[]'));
        if ((scores.get(localStorage.name) ?? 0) <= this.score) { scores.set(localStorage.name, this.score); }
        localStorage.setItem('scores', JSON.stringify(Array.from(scores.entries())));
        */
        alert(`${s} Your score: ${this.score}!`);
        location.href = 'http://localhost:8080/start';

    }
}

window.GameManager = GameManager;