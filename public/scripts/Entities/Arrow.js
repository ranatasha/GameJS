// import {Entity} from './Entity.js';
// import {Player} from './Player.js';
// import {Skeleton} from './Skeleton.js';
// import {Boss} from './Boss.js';

/*export*/ class Arrow extends Entity {

    constructor(/*physicManager, soundManager,*/) {
        //super(physicManager, soundManager);
        super()
        this.size_x = 32;
        this.size_y = 32;

        this.speed = 4;
        this.move_x = 0;
        this.move_y = 0;
        this.currentSprite = 0;
        
    }
    draw(spriteManager, ctx){
        this.currentSprite = this.currentSprite % 4 + 1;

        if (this.move_x > 0 && this.move_y === 0)
            spriteManager.drawSprite(ctx, `fireball_right${this.currentSprite}`, this.pos_x, this.pos_y);
        if (this.move_x < 0 && this.move_y === 0)
            spriteManager.drawSprite(ctx, `fireball_left${this.currentSprite}`, this.pos_x, this.pos_y);
        if (this.move_x === 0 && this.move_y > 0)
            spriteManager.drawSprite(ctx, `fireball_down${this.currentSprite}`, this.pos_x, this.pos_y);
        if (this.move_x === 0 && this.move_y < 0)
            spriteManager.drawSprite(ctx, `fireball_up${this.currentSprite}`, this.pos_x, this.pos_y);
    }
    update(){
        /*this.physicManager.update(this);*/
    }
    onTouchEntity(obj){
        if(obj instanceof Skeleton || obj instanceof Boss /*|| obj instanceof Player*/) {
            obj.lifetime -= 12;
        }
        this.kill();
    }
    onTouchMap(idx){    // idx - индекс блока, в который она попала
        this.kill();
    }
    kill(){ // Уничтожения объекта
        /*this.physicManager.gameManager.kill(this);*/

    }
}