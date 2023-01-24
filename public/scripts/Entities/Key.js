// import {Entity} from './Entity.js';

/*export*/ class Key extends Entity{
    constructor(/*physicManager, soundManager*/) {
        //super(physicManager, soundManager);
        super();

    }
    draw(spriteManager, ctx){
        spriteManager.drawSprite(ctx, 'key', this.pos_x, this.pos_y);
    }

    // update(){
    //     this.physicManager.update(this);
    // }
    kill(){
        /*this.physicManager.gameManager.kill(this);*/
    }

}