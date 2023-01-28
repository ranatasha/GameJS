// import {MapManager} from './MapManager.js';
// import {SpriteManager} from './SpriteManager.js';
// //import {EventsManager} from './events.manager.js';
// import {Player} from '../Entities/Player.js';
// import {Skeleton} from '../Entities/Skeleton.js.js';
// import {Heart} from '../Entities/Heart.js';
// import {Key} from '../Entities/Key.js';
 
class GameManager {
    constructor(canvas) {
        const user = document.getElementById('username');
        user.innerHTML = localStorage['game.username'];

        this.score = 0;
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.entities = [];
        this.fireNum = 0;
        this.player = null; // назначается при parseEntities() в parseEntities()
        this.boss = null;
        this.isEnemiesOnMap = false;
        this.laterKill = [];
        this.curLevel = 1;
        this.enemiesDeadsCount = 0;

        // фабрики сущностей - создания объектов
        this.factory['Player'] = Player;
        this.factory['Skeleton'] = Skeleton;
        this.factory['Boss'] = Boss;
        this.factory['Heart'] = Heart;
        this.factory['Key'] = Key;
        this.factory['Potion'] = Potion;
        this.factory['Fireball'] = Fireball;
        this.factory['Arrow'] = Arrow;

        // подключаем менеджеры, которые подключаются единожды, не требуют обновления при переходе на следующий уровень
        this.spriteManager = new SpriteManager();   // подготовка массива sprites, отрисовка объектов будет уже непосредственно в this.draw(), где перебираются объекты и вызывается draw()
        this.eventsManager = new EventsManager(canvas);
        this.soundManager = new SoundManager();
        this.soundManager.loadArray(['fireball.mp3', 'crunch.mp3', 'background.mp3']);
        

        // подключаем остальные менеджеры
        this.loadLevel(this.curLevel);  // внутри есть отрисовка тайлов и карты через создание MapManager'a, установка физики с MapManager'ом
                                // подготовка списка исходных объектов на карте, отрисовка

    }

    loadLevel(level) {  // вызывается в конструкторе gameManager
        this.entities = []; // опустошаем массив объектов на карте
        this.enemiesDeadsCount = 0;
        this.curLevel = level;
        this.mapManager = new MapManager(level);    // отрисовка тайлов и карты
        this.physicManager = new PhysicManager(this, this.mapManager); // установка физики
        this.eventsManager.action = {}
        this.mapManager.parseEntities(this/*, this.physicManager, this.soundManager*/);
        this.mapManager.draw(this.ctx);         // отрисовка карты, тайлов
    }
// можно ли убрать наверх, перед фабриками
    factory = {};

    play() {
        this.interval = setInterval( (( (self) => () => {
            self.update();
        })(this)), 100 );
        this.soundManager.play('./public/assets/sounds/background.mp3', {looping: true});
        // установка ссылки на босса(для получения актуальных координат) и интервала его выстрелов
        if(!this.boss && this.curLevel === 2) {
            setTimeout(() => {
                this.boss = this.entities.find(obj => obj.name === 'Boss')
                this.bossInterval = setInterval(() => {
                    this.boss.fire(this)
                }, 3000)
            }, 200)
        }
    }

    initPlayer(obj) {    // вызывается в parseEntities, где извлекаются и перебираются объекты на карте(player в том числе)
        this.player = obj;
    }
    
    update() {              // изменение состояния карты / объектов на каждом шаге
        document.getElementById('health').innerHTML = `${this.player.lifetime}`;
        document.getElementById('score').innerHTML = `${this.score}`;
        document.getElementById('enemies').innerHTML = `${this.enemiesDeadsCount} / ${this.mapManager.enemiesCount}`;

        if(this.player === null) {
            return;
        }
        if (this.player.lifetime <= 0) {
            this.endGame();
        }
        
        // обнуление направления движения перед каждым шагом
        this.player.move_x = 0;
        this.player.move_y = 0;
        
        // подготовка направления движения игрока и его выстрелов

        if (this.eventsManager.action['up'])
            this.player.move_y = -1;
        if (this.eventsManager.action['down'])
            this.player.move_y = 1;
        if (this.eventsManager.action['left'])
            this.player.move_x = -1;
        if (this.eventsManager.action['right'])
            this.player.move_x = 1;
        if (this.eventsManager.action['fire_up']) {
            this.soundManager.play('fireball.mp3');
            this.player.fire(this, 0 ,-1);
            this.eventsManager.action['fire_up'] = false;
        }
        if (this.eventsManager.action['fire_right']) {
            this.soundManager.play('fireball.mp3');
            this.player.fire(this, 1, 0);
            this.eventsManager.action['fire_right'] = false;
        }
        if (this.eventsManager.action['fire_down']) {
            this.soundManager.play('fireball.mp3');
            this.player.fire(this, 0 , 1);
            this.eventsManager.action['fire_down'] = false;
        }
        if (this.eventsManager.action['fire_left']) {
            this.soundManager.play('fireball.mp3');
            this.player.fire(this, -1 , 0);
            this.eventsManager.action['fire_left'] = false;
        }
        this.isEnemiesOnMap = false;
        // передвигаем все объекты

        this.entities.forEach((e) => {
            try {
                // проверяем есть ли враги
                if (e instanceof Skeleton || e instanceof Boss)
                    this.isEnemiesOnMap = true;

                // предварительно подготавливаем движение стрел
                if (e instanceof Arrow || e instanceof Fireball) {
                    e.pos_x += e.move_x * 15;
                    e.pos_y += e.move_y * 15;
                    this.physicManager.update(e);
                    
                // предварительно подготавливаем движение скелетов перед каждым шагом, поскольку движение меняется в ходе игры
                } else if(e instanceof Skeleton && Math.abs(e.pos_x - this.player.pos_x) + Math.abs(e.pos_y - this.player.pos_y) <= 120){  // приближение к игроку
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
                    if (Math.abs(e.pos_x - this.player.pos_x) + Math.abs(e.pos_y - this.player.pos_y) <= 120) {
                        if (e.move_x === 0) {
                            e.move_x = Math.sign(this.player.pos_x - e.pos_x);
                            e.move_y = 0;
                        } else if (e.move_y === 0) {
                            e.move_y = Math.sign(this.player.pos_y - e.pos_y);
                            e.move_x = 0;
                        }
                        this.physicManager.update(e);
                    } else if (Math.abs(e.pos_x - this.player.pos_x) + Math.abs(e.pos_y - this.player.pos_y) > 120) {
                        if (e.move_x === 0 && e.move_y === 0) {
                            e.move_x = 0;
                            e.move_y = 1;
                        }
                        let motion = this.physicManager.update(e);
                        if (motion === 'break') {    // если уперлись во что-то, то меняем направление
                            let tmp = e.move_y;
                            e.move_y = -e.move_x;
                            e.move_x = tmp;
                        }
                    }
                    // передвигаем остальные объекты (игрока, стрелы, выстрелы)
                } else {    
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
    }

    draw() {
        for(let i=0; i< this.entities.length; i++) {
            this.entities[i].draw(this.spriteManager, this.ctx);
        }
    }
    kill(e) {   // объект который необходимо убрать с карты
        this.laterKill.push(e)
        if(e instanceof Skeleton) {
            this.score += 100;
            this.enemiesDeadsCount++;
            console.log(this.enemiesDeadsCount)
        }
        if(e instanceof Boss){
            this.score += 500;
            this.enemiesDeadsCount++;
            console.log(this.enemiesDeadsCount)
            this.eventsManager.action={}
            this.endGame()
        }
        if(e instanceof Heart)
            this.score += 50;
        if(e instanceof Potion)
            this.score += 75;
        if(e instanceof Key)
            this.score += 200;
    }

    nextLevel(){
        clearInterval(this.interval);
        if (this.curLevel === 2){
            this.endGame();
        } else{
            this.curLevel += 1;
            this.loadLevel(this.curLevel);
            alert('Вы переходите на следующий уровень');
            this.play();
        }
    }


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