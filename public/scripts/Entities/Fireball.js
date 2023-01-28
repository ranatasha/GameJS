// import {Entity} from './Entity.js';
// import {Player} from './Player.js';
// import {Skeleton} from './Skeleton.js';
// import {Boss} from './Boss.js';

/*export*/ class Fireball extends Entity {

    constructor(/*physicManager, soundManager,*/) {
        //super(physicManager, soundManager);
        super()
        this.size_x = 32;
        this.size_y = 32;

        this.speed = 10;
        this.move_x = 0;
        this.move_y = 0;
        this.currentSprite = 0;
        this.isKilledBool = false; // ударился выстрел об стену или нет, чтобы потом проверять isKilled() после update() шага игры - добавлять в  gameManager.laterKill[] или нет
    }

    draw(spriteManager, ctx) {
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

    // update() реализовано общим принципом в PhysicManager, в GameManager update() каждого объекта будет выполняться через PhysicManager.update(obj)

    // onTouchEntity(obj) - обработка встречи с боссом или скелетом лежит на этих же объектах
    // не должна быть только на боссе, поскольку удар может прилететь в спину, а onTouchEntity у босса вызывается, только если босс пойдет прямо на ударный шар
    onTouchEntity(obj){
        if(obj instanceof Boss){
            obj.lifetime -= 15;
            this.kill()
        }
        if(obj instanceof Skeleton){
            obj.lifetime -= 25;
            this.kill()
        }
        if(obj instanceof Arrow){
            obj.kill()
            this.kill()
        }
    }

    kill() { // Уничтожения объекта
        this.isKilledBool = true;
    }

    isKilled() {    // вызывается после update() шага игры - добавлять в  gameManager.laterKill[] или нет
        return this.isKilledBool;
    }
}