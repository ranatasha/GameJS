class PhysicManager {
    constructor(gameManager, mapManager) {
        this.gameManager = gameManager;
        this.mapManager = mapManager;
    }
    update(obj) {	// основная ф-ция, для передвижения объекта(можем ли сходить - установить координаты - после выбора направления шага)
        if (obj.move_x === 0 && obj.move_y === 0)                           // объект не двигается
            return 'stop';
        
        const newX = obj.pos_x + Math.round(obj.move_x * obj.speed);    // новые координаты после выбора направления, учитывая скорость (округляет до меньшего целого)
        const newY = obj.pos_y + Math.round(obj.move_y * obj.speed);

        const e = this.entityAtXY(obj, newX, newY);                                         // проверяем, есть ли объекты на новых координатах
        if (e !== null && obj.onTouchEntity) {                                              // если есть и есть метод обработки столкновений, обрабатываем столкновения
            
            // обработка столкновений с объектами
            obj.onTouchEntity(e)

            // логгирование столкновений
            if( obj.lifetime && e.lifetime && !(obj instanceof Skeleton && e instanceof Skeleton) && !(obj instanceof Player)
                || obj instanceof Arrow && e instanceof Player || obj instanceof Fireball && e instanceof Boss 
                || obj instanceof Fireball && e instanceof Skeleton)
                document.getElementById('msg').innerHTML =`[ATTACK] ${obj.name} attacked the ${e.name}. ${e.name}'s health: = ${e.lifetime}`
            // логгирование подбора бонусов игроком внутри Player.onTouchEntity()
        }
        
        const ts = this.mapManager.getTilesetIdx(newX-2 + obj.size_x/2,    // получаем индекс тайла в тайлсете по новым координатам, /2 потому что всякое округление до меньшего целого
            newY+2 + obj.size_y/2);
        
        
        // обрабатываем столкновения игрока с "препятствиями" и "особые клетки"(дверь, телепорт)
        if (obj instanceof Player){
            if (ts === 159) {                 // обрабатываем препятствия - шипы
                obj.onTouchMap(ts);     //  159 - шипы, отнимают здоровье, обрабатываем препятствия
                return 'break'
            }

            if ( ts === 135) {         // физика перемещения для телепорта
                // 135 - телепорт, не меняет состояния игрока
                if (newX >= 133 && newX <= 177 && newY >= 64 && newY <= 99) {                // верхний телепорт перемещает в нижний
                    obj.pos_x = 224 + obj.size_x;   // добавка, иначе вечный телепорт
                    obj.pos_y = 128 + obj.size_y;
                }
                if (newX >= 220 && newX <= 256 && newY >= 100 && newY <= 159) {               // нижний телепорт перемещает в верхний
                    obj.pos_x = 160 - obj.size_x;
                    obj.pos_y = 96 - obj.size_y;
                }
                return 'move'
            }

            if (ts === 117) {          // обрабатываем дверь на следующий уровень
                if (obj.hasKey && this.gameManager.enemiesDeadsCount === this.mapManager.enemiesCount){
                    this.gameManager.nextLevel();
                }
                else {
                    if(!obj.hasKey)
                        document.getElementById('msg').innerHTML = '[INFO] You need to pick up a KEY to go to the next level'
                    if (this.gameManager.enemiesDeadsCount !== this.mapManager.enemiesCount)
                        document.getElementById('msg').innerHTML = '[INFO] You need to kill ALL ENEMIES to go to the next level'
                    return 'break'
                }
            }
        }

        const passableCells = [23, 24, 56, 57, 166, 135];        // индексы "проходимых" тайлов
        
        // если клетка "непроходима" - стены
        if(passableCells.indexOf(ts) === -1){
            if(obj instanceof Fireball || obj instanceof Arrow) // если стрела/выстрел уперлась в "стену" - уничтожить ее
                obj.kill()
            return 'break'
        // если клетка "проходима"
        } else if(passableCells.indexOf(ts) !== -1){
            // и она "не занята" никаким объектом 
            if(e === null){
                obj.pos_x = newX;
                obj.pos_y = newY;
                return 'move';  // встаем на нее
            // или "занята", но для игрока fireball'ом, для босса - arrow(стрелой)
            } else if (e instanceof Arrow && obj instanceof Boss || e instanceof Fireball && obj instanceof Player || e instanceof Player && obj instanceof Fireball){
                obj.pos_x = newX;
                obj.pos_y = newY;
                return 'move';  // все равно встаем на нее
            }
            else {
                return 'break'; // в остальных "занятых" случаях стоим
            }
                
        }
    }

    entityAtXY(obj, x, y) {		// вспомогательная, для определения столкновения с объектом по заданным координатам
        for (var i = 0; i < this.gameManager.entities.length; i++) {
            var e = this.gameManager.entities[i];
            if (e.name !== obj.name) {	// разные объекты, е - перебираемые объекты, obj - для которого проверяем в update()
                if (x + obj.size_x < e.pos_x ||		// каждое условие исключает столкновение, не пересекаются объекты
                    y + obj.size_y < e.pos_y ||
                    x > e.pos_x + e.size_x ||
                    y > e.pos_y + e.size_y)
                    continue;
                return e;
            }
        }
        return null;
    }
}