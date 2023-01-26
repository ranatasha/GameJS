class PhysicManager {
    constructor(gameManager, mapManager) {
        this.gameManager = gameManager;
        this.mapManager = mapManager;
    }
    update(obj) {	// основная ф-ция, для передвижения объекта(!установки координат после "шага")
        if (obj.move_x === 0 && obj.move_y === 0)                           // объект не двигается
            return 'stop';
        const newX = obj.pos_x + Math.round(obj.move_x * obj.speed);    // новые координаты после "шага", учитывая скорость (округляет до меньшего целого)
        const newY = obj.pos_y + Math.round(obj.move_y * obj.speed);
        
        const e = this.entityAtXY(obj, newX, newY);                                         // проверяем, есть ли объекты на новых координатах
        if (e !== null && obj.onTouchEntity) {                                              // если есть и есть метод обработки столкновений, обрабатываем столкновения
            console.log(obj, e);
            obj.onTouchEntity(e)
        }
        const ts = this.mapManager.getTilesetIdx(newX + obj.size_x/1.25,    // получаем индекс тайла в тайлсете по новым координатам, /2 потому что координаты округлили до меньшего целого
            newY + obj.size_y/1.25);

        const passableCells = [23, 24, 56, 57, 166];        // индексы "проходимых" тайлов

        if (ts === 159 && obj.onTouchMap) {                 // обрабатываем препятствия - шипы
            obj.onTouchMap(ts);     //  159 - шипы, отнимают здоровье, обрабатываем препятствия
        }

        if ( ts === 135 && obj instanceof Player) {         // физика перемещения для телепорта
            // 135 - телепорт, не меняет состояния игрока
            if (newX === 160, newY === 96) {                // верхний телепорт перемещает в нижний
                newX = 224;
                newY = 128;
            }
            if (newX === 224, newY === 128) {               // нижний телепорт перемещает в верхний
                newX = 160;
                newY = 96;
            }
        }

        if (ts === 117 && obj instanceof Player) {          // обрабатываем дверь на следующий уровень
            if (obj.hasKey){
                this.gameManager.nextLevel();
            }
            else
                alert('You need to pick up a KEY to go to the next level')
        }

        if (passableCells.indexOf(ts) !== -1 && (e === null || (e !== null && e instanceof Arrow && obj instanceof Boss) ||
                                                 (e !== null && e instanceof Fireball && obj instanceof Player) )) {   // если клетка с новыми координатами "проходима" и на ней нет объектов
            obj.pos_x = newX;
            obj.pos_y = newY;
            return 'move';                  // встаем на нее
        } else {
            if((obj instanceof Fireball || obj instanceof Arrow) && passableCells.indexOf(ts) === -1) {   // если стрела/выстрел уперлась в "стену" - уничтожить ее
                obj.kill()
            }
            return 'break';         // иначе - стоим
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