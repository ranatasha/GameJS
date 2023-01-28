// import {Entity} from './Entity.js';
// import {Heart} from './Heart.js';
// import {Potion} from './Potion.js';

/*export*/ class Player extends Entity {

    constructor() {
        super()
        this.size_x = 32;
        this.size_y = 32;
        this.lifetime = 50;                     // кол-во жизней
        this.move_x = 0;                        // определяют направление движения
        this.move_y = 0;                        // определяют направление движения
        this.speed = 6;                         // скорость передвижения
        this.currentSprite = 0;                // для анимации
        this.hasKey = false;
    }
    draw(spriteManager, ctx){
        this.currentSprite = this.currentSprite % 3 + 1;
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
    
    // update() реализовано общим принципом в PhysicManager, в GameManager update() каждого объекта будет выполняться через PhysicManager.update(obj)
    
    onTouchEntity(obj){  // обработка встречи с объектом
        if (obj instanceof Heart){
            this.lifetime += 25;
            obj.kill();
            document.getElementById('msg').innerHTML = `[HEALTH++] You picked up a Heart. Player's health = ${this.lifetime} .`
        }
        if(obj instanceof Potion) {
            this.speed += 5;
            obj.kill();
            document.getElementById('msg').innerHTML = `[SPEED++] You picked up a Potion. Player's speed was increased: ${this.speed} .`
        }
        if(obj instanceof Key) {
            this.hasKey = true;
            obj.kill()
            document.getElementById('msg').innerHTML = `[KEY] You picked up a Key. Now you can open the door to go to the next level if there're no enemeies on the map.`
        }
        //if(obj instanceof Arrow) {  // не должна лежать на игроке, поскольку стрела может лететь в спину, а player.onTouchEntity(Arrow) вызовется, только если игрок будет "идти" на стрелу
            //this.lifetime -= 10;
          //  obj.kill();
        //}
    }
    
    onTouchMap(ts){ // на карте нет шипов или чего-то подобного, поэтому состояние игрока не меняется
        if (ts === 159) {// наткнулся на шипы
            this.lifetime -= 8;
            document.getElementById('msg').innerHTML = `[HEALTH--] Oach! These are spikes which can HURT YOU. Player's health = ${this.lifetime} .`
        }
    }

    // kill() не нужен, поскольку в GameManager после update() шага игры проверяется isKilled() и в зав-ти от этого добавляется в gameManager.laterkill[]

    isKilled(){ // вызывается после update() шага игры - добавлять в  gameManager.laterKill[] или нет
        if( this.lifetime <= 0 )
            return true;
        return false;
    }
    
    fire(gameManager, x, y){     // выстрел, передаем направление выстрела  x, y = {-1, 0, 1}
        var fb = new gameManager.factory['Fireball'];

        fb.name = 'fireball' + (++gameManager.fireNum); // счетчик выстрелов для уникального идентификатора при создании объектов
        
        fb.move_x = x;    // направление выстрела задается пользователем в зав-ти от нажатой стрелки
        fb.move_y = y;
        
        // устанавливаем координаты стрелы в зависимости от направления выстрела
        if(fb.move_x > 0 && fb.move_y === 0){
            fb.pos_x = this.pos_x;         // fireball появится справа от игрока
            fb.pos_y = this.pos_y;
        } else if(fb.move_x < 0 && fb.move_y === 0){
            fb.pos_x = this.pos_x;          // fireball появится слева от игрока
            fb.pos_y = this.pos_y;
        } else if(fb.move_x === 0 && fb.move_y > 0){
            fb.pos_x = this.pos_x;
            fb.pos_y = this.pos_y;  // fireball появится снизу от игрока
        } else if(fb.move_x === 0 && fb.move_y < 0){
            fb.pos_x = this.pos_x;
            fb.pos_y = this.pos_y; // fireball появится сверху от игрока
        }
        gameManager.entities.push(fb)
    }
}