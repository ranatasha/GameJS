// import {Entity} from './Entity.js';
// import {Player} from './Player.js';
// import {Arrow} from './Arrow.js'

/*export*/ class Boss extends Entity {

    constructor(/*physicManager, soundManager*/) {
        //super(physicManager, soundManager);
        super()
        this.size_x = 32;
        this.size_y = 32;
        this.lifetime = 50;                     // кол-во жизней
        this.move_x = 0;                        // определяют направление движения
        this.move_y = 0;                        // определяют направление движения
        this.speed = 3;                         // скорость передвижения
        this.currentSprite = 0;                // для анимации
    }
    draw(spriteManager, ctx){
        this.currentSprite = this.currentSprite % 3 + 1;

        if(this.move_x === 0 && this.move_y === 0) {
            spriteManager.drawSprite(ctx, `boss_down2`, this.pos_x, this.pos_y);
        } else if(this.move_x > 0 && this.move_y === 0){
            spriteManager.drawSprite(ctx, `boss_right${this.currentSprite}`, this.pos_x, this.pos_y);
        } else if(this.move_x < 0 && this.move_y === 0){
            spriteManager.drawSprite(ctx, `boss_left${this.currentSprite}`, this.pos_x, this.pos_y);
        } else if(this.move_x === 0 && this.move_y > 0){
            spriteManager.drawSprite(ctx, `boss_down${this.currentSprite}`, this.pos_x, this.pos_y);
        } else if(this.move_x === 0 && this.move_y < 0){
            spriteManager.drawSprite(ctx, `boss_up${this.currentSprite}`, this.pos_x, this.pos_y);
        }
    }
    update(){
        if(this.lifetime <= 0)
            this.kill();
        /*this.physicManager.update(this);*/
    }
    fire() {
        var a_up = new Arrow();
        var a_down = new Arrow();
        var a_left = new Arrow();
        var a_right = new Arrow();
        
        var arr = [a_up, a_left, a_down, a_right]
        for (let arrow in arr) {
            arrow.name = 'arrow' + (++gameManager.firenum); // счетчик выстрелов для уникального идентификатора для стрелы
        }
        
        // устанавливаем координаты стрел в каждом направлении
        a_up.pos_x = this.pos_x;
        a_up.pos_y = this.pos_y - a_up.size_y; // стрела появится сверху от босса

        a_down.pos_x = this.pos_x;
        a_down.pos_y = this.pos_y + a_down.size_y;  // стрела появится снизу от босса

        a_right.pos_x = this.pos_x + a_right.size_x;         // стрела появится справа от босса
        a_right.pos_y = this.pos_y;

        a_left.pos_x = this.pos_x - a_left.size_x;          // стрела появится слева от босса
        a_left.pos_y = this.pos_y;

        for (let arrow in arr) {
            gameManager.entities.push(arrow)
        }
        
    }
    onTouchEntity(obj){
        if(obj instanceof Player){
            obj.lifetime -= 8;
        }
    }
    kill(){ // Уничтожения объекта
        // this.soundManager.play('crunch.mp3');
        // this.physicManager.gameManager.score += 100;
        // this.physicManager.gameManager.kill(this);
    }
}