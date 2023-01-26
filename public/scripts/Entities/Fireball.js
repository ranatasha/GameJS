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
        // this.move_x = player.pos_x - click.pos_x;
        // this.move_y = player.pos_y - click.pos_y;
        //
        // const normalized_x = this.move_x / (Math.abs(this.move_x)+Math.abs(this.move_y));
        // const normalized_y = this.move_y / (Math.abs(this.move_x)+Math.abs(this.move_y));
        // this.move_x = -1*normalized_x;
        // this.move_y = -1*normalized_y;
        // this.pos_x = player.pos_x + this.move_x*20;
        // this.pos_y = player.pos_y + this.move_y*20;
    }

    draw(spriteManager, ctx) {
        this.currentSprite = this.currentSprite % 4 + 1;
        console.log("I'm drawing a fireball. Current Sprite:", this.currentSprite)
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
    
    onTouchMap(ts, passableCells) {
        if (passableCells.indexOf(ts) === -1)   // если выстрел уперся в "стену"/препятствие - уничтожаем
            this.kill()
    }

    kill() { // Уничтожения объекта
        this.isKilledBool = true;
    }

    isKilled() {    // вызывается после update() шага игры - добавлять в  gameManager.laterKill[] или нет
        return this.isKilledBool;
    }
}