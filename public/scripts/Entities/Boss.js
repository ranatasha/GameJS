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
    // update() реализовано общим принципом в PhysicManager, в GameManager update() каждого объекта будет выполняться через PhysicManager.update(obj)
    
    fire(gameManager) {
        var a_up = new gameManager.factory['Arrow'];
        var a_down = new gameManager.factory['Arrow'];
        var a_left = new gameManager.factory['Arrow'];
        var a_right = new gameManager.factory['Arrow'];
        
        var arr = [a_up, a_left, a_down, a_right]
        for (let i=0; i<arr.length;i++) {
            arr[i].name = 'arrow' + (++gameManager.fireNum); // счетчик выстрелов для уникального идентификатора для стрелы
        }
        
        // устанавливаем координаты стрел в каждом направлении
        a_up.pos_x = this.pos_x;
        a_up.pos_y = this.pos_y/* - a_up.size_y*/; // стрела появится сверху от босса
        a_up.move_x = 0;
        a_up.move_y = -1;

        a_down.pos_x = this.pos_x;
        a_down.pos_y = this.pos_y/* + a_down.size_y*/;  // стрела появится снизу от босса
        a_down.move_x = 0;
        a_down.move_y = 1;
        
        a_right.pos_x = this.pos_x/* + a_right.size_x*/;         // стрела появится справа от босса
        a_right.pos_y = this.pos_y;
        a_right.move_x = 1;
        a_right.move_y = 0;

        a_left.pos_x = this.pos_x/* - a_left.size_x*/;          // стрела появится слева от босса
        a_left.pos_y = this.pos_y;
        a_left.move_x = -1;
        a_left.move_y = 0;
        
        for (let i=0; i<arr.length;i++) {
            gameManager.entities.push(arr[i])
        }
        
    }
    onTouchEntity(obj){
        if(obj instanceof Player) {
            obj.lifetime -= 5;
        }
        // if(obj instanceof Arrow) { // может быть такое, что босс наступает на стрелу во время шага, но бессмысленно ее уничтожать
        //     obj.kill()
        // }
    }
    
    // kill() не нужен, поскольку в GameManager после update() шага игры проверяется isKilled() и в зав-ти от этого добавляется в gameManager.laterkill[]
    
    isKilled(){     // вызывается после update() шага игры - добавлять в  gameManager.laterKill[] или нет
        if( this.lifetime <= 0 )
            return true;
        return false;
    }
}