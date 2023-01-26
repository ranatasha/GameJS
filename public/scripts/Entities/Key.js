// import {Entity} from './Entity.js';

/*export*/ class Key extends Entity{
    constructor(/*physicManager, soundManager*/) {
        //super(physicManager, soundManager);
        super();
        this.size_x = 32;
        this.size_y = 32;
        this.isKilledBool = false;  // подобрали предмет или нет, чтобы потом проверять isKilled() после update() шага игры - добавлять в  gameManager.laterKill[] или нет

    }
    draw(spriteManager, ctx){
        spriteManager.drawSprite(ctx, 'key', this.pos_x, this.pos_y);
    }

    // onTouchEntity(obj) - обработка встречи с игроком лежит на игроке
    
    // update() реализовано общим принципом в PhysicManager, в GameManager update() каждого объекта будет выполняться через PhysicManager.update(obj)

    kill() { // Уничтожения объекта, вызывается, когда подбираем предмет
        this.isKilledBool = true;
    }

    isKilled() {        // вызывается после update() шага игры - добавлять в  gameManager.laterKill[] или нет
        return this.isKilledBool;
    }

}