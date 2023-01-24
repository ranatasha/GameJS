// import {Entity} from './Entity.js';
// import {Heart} from './Heart.js';
// import {Potion} from './Potion.js';

/*export*/ class Player extends Entity {

    constructor(/*physicManager, soundManager*/) {
        //super(physicManager, soundManager);
        super()
        this.size_x = 32;
        this.size_y = 32;
        this.lifetime = 50;                     // кол-во жизней
        this.move_x = 0;                        // определяют направление движения
        this.move_y = 0;                        // определяют направление движения
        this.speed = 5;                         // скорость передвижения
        this.currentSprite = 0;                // для анимации
        this.hasKey = false;
    }
    draw(spriteManager, ctx){
        this.currentSprite = this._currentSprite % 3 + 1;

        if(this.move_x === 0 && this.move_y === 0) {
            spriteManager.drawSprite(ctx, `player_down2`, this.pos_x, this.pos_y);
        } else if(this.move_x > 0 && this.move_y === 0){
            spriteManager.drawSprite(ctx, `player_right${this.currentSprite}`, this.pos_x, this.pos_y);
        } else if(this.move_x < 0 && this.move_y === 0){
            spriteManager.drawSprite(ctx, `player_left${this.currentSprite}`, this.pos_x, this.pos_y);
        } else if(this.move_x === 0 && this.move_y > 0){
            spriteManager.drawSprite(ctx, `player_down${this.currentSprite}`, this.pos_x, this.pos_y);
        } else if(this.move_x === 0 && this.move_y < 0){
            spriteManager.drawSprite(ctx, `player_up${this.currentSprite}`, this.pos_x, this.pos_y);
        }
    }
    update(){             // изменение состояния на каждом шаге
        /*this.physicManager.update(this);*/
    }
    onTouchEntity(obj){  // обработка встречи с препятствием
        if (obj instanceof Heart){
            this.lifetime += 25;
            obj.kill();
        }
        if(obj instanceof Potion) {
            this.speed += 5;
            obj.kill();
        }
        if(obj instanceof Key) {
            this.hasKey = true;
            obj.kill()
        }
    }
    kill(){ // уничтожения объекта

    }
    fire(){     // выстрел
        var fb = new Fireball();

        fb.name = 'fireball' + (++gameManager.firenum); // счетчик выстрелов для уникального идентификатора при создании объектов
        
        fb.move_x = this.move_x;    // направление выстрела совпадает с направлением движения игрока
        fb.move_y = this.move_y;
        
        // устанавливаем координаты стрелы в зависимости от направления выстрела
        if(this.move_x > 0 && this.move_y === 0){
            fb.pos_x = this.pos_x + fb.size_x;         // стрела появится справа от босса
            fb.pos_y = this.pos_y;
        } else if(this.move_x < 0 && this.move_y === 0){
            fb.pos_x = this.pos_x - fb.size_x;          // стрела появится слева от босса
            fb.pos_y = this.pos_y;
        } else if(this.move_x === 0 && this.move_y > 0){
            fb.pos_x = this.pos_x;
            fb.pos_y = this.pos_y + fb.size_y;  // стрела появится снизу от игрока
        } else if(this.move_x === 0 && this.move_y < 0){
            fb.pos_x = this.pos_x;
            fb.pos_y = this.pos_y - fb.size_y; // стрела появится сверху от игрока
        }

        gameManager.entities.push(fb)
    }
}