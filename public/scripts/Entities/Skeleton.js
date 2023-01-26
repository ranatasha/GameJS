// import {Entity} from './Entity.js';
// import {Player} from './Player.js';

/*export*/ class Skeleton extends Entity {
    
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
            spriteManager.drawSprite(ctx, `skelet_down2`, this.pos_x, this.pos_y);
        } else if(this.move_x > 0 && this.move_y === 0){
            spriteManager.drawSprite(ctx, `skelet_right${this.currentSprite}`, this.pos_x, this.pos_y);
        } else if(this.move_x < 0 && this.move_y === 0){
            spriteManager.drawSprite(ctx, `skelet_left${this.currentSprite}`, this.pos_x, this.pos_y);
        } else if(this.move_x === 0 && this.move_y > 0){
            spriteManager.drawSprite(ctx, `skelet_down${this.currentSprite}`, this.pos_x, this.pos_y);
        } else if(this.move_x === 0 && this.move_y < 0){
            spriteManager.drawSprite(ctx, `skelet_up${this.currentSprite}`, this.pos_x, this.pos_y);
        }
    }

    // update() реализовано общим принципом в PhysicManager, в GameManager update() каждого объекта будет выполняться через PhysicManager.update(obj)
    
    onTouchEntity(obj){
        if(obj instanceof Fireball){
            obj.lifetime -= 50;
            obj.kill()
        }
        if(obj instanceof  Player){
            obj.lifetime -= 3;
        }

    }
    
    // kill() не нужен, поскольку в GameManager после update() шага игры проверяется isKilled() и в зав-ти от этого добавляется в gameManager.laterkill[]
    
    isKilled(){ // вызывается после update() шага игры - добавлять в  gameManager.laterKill[] или нет
        if( this.lifetime <= 0 )
            return true;
        return false;
    }
}