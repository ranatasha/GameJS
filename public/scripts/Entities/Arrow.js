// import {Entity} from './Entity.js';
// import {Player} from './Player.js';
// import {Skeleton} from './Skeleton.js';
// import {Boss} from './Boss.js';

/*export*/ class Arrow extends Entity {

    constructor(/*physicManager, soundManager,*/) {   // move_x и move_y в конструкторе позволяют задать постоянное направление стрельбы данной стрелой
        //super(physicManager, soundManager);
        super()
        this.size_x = 32;
        this.size_y = 32;

        this.speed = 2;
        this.move_x = 0;
        this.move_y = 0;
        this.isKilledBool = false; // ударилась стрела об стену или нет, чтобы потом проверять isKilled() после update() шага игры - добавлять в gameManager.laterKill[] или нет 
        this.pos_x = 0;
        this.pos_y = 0;
    }
    draw(spriteManager, ctx){

        if (this.move_x > 0 && this.move_y === 0)
            spriteManager.drawSprite(ctx, `arrow_right`, this.pos_x, this.pos_y);
        if (this.move_x < 0 && this.move_y === 0)
            spriteManager.drawSprite(ctx, `arrow_left`, this.pos_x, this.pos_y);
        if (this.move_x === 0 && this.move_y > 0)
            spriteManager.drawSprite(ctx, `arrow_down`, this.pos_x, this.pos_y);
        if (this.move_x === 0 && this.move_y < 0)
            spriteManager.drawSprite(ctx, `arrow_up`, this.pos_x, this.pos_y);
    }
    // update() реализовано общим принципом в PhysicManager, в GameManager update() каждого объекта будет выполняться через PhysicManager.update(obj)
    
    // onTouchEntity(obj) - обработка встречи с игроком лежит на игроке, во время встречи с боссом, стрела просто уничтожается(прописано у босса onTouchEntity)
    // не должна на игроке, поскольку стрела может прилететь в спину, а onTouchEntity для стрелы вызывается, только если стрела находится на клетке
    onTouchEntity(obj){
        if(obj instanceof Player){
            obj.lifetime -= 10;
            this.kill()
        }
        if(obj instanceof Fireball){
            obj.kill()
            this.kill()
        }
    }
    onTouchMap(ts, passableCells){
        if (passableCells.indexOf(ts) === -1)   // если выстрел уперся в "стену"/препятствие - уничтожаем
            this.kill()
    }
    
    kill(){ // Уничтожения объекта
        this.isKilledBool = true;
    }
    
    isKilled(){         // вызывается после update() шага игры - добавлять в  gameManager.laterKill[] или нет
        return this.isKilledBool
    }
}