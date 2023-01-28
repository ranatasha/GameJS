class EventsManager {
    bind = {};      // подход, позволяющий сопоставить кодам нажатых клавиш - действия(обеспечивает адаптируемость под текущие требования и облегчает поддержку кода)
    action = {};    // объект, содержащий свойства-действия и контролирует их булевыми значениями true, false - выполнять определенное действие или нет
    constructor(canvas){
        this.bind[87] = 'up';       // W
        this.bind[65] = 'left';     // A
        this.bind[83] = 'down';     // S
        this.bind[68] = 'right';    // D
                                    // выстрелы игрока с помощью стрелок
        this.bind[38] = 'fire_up';  // arrow_up
        this.bind[37] = 'fire_left';  // arrow_left
        this.bind[40] = 'fire_down';  // arrow_down
        this.bind[39] = 'fire_right';  // arrow_right
        /*canvas.addEventListener('mousedown', (((self) => () => {    // слушает событие нажатой кнопки мыши
            self.onMouseDown(event);
        })(this)));
        canvas.addEventListener('mouseup', (((self) => () => {
            self.onMouseUp(event);
        })(this)));*/
        document.body.addEventListener('keydown', (((self) => () => {   // слушает событие нажатой кнопки клавиатуры
            self.onKeyDown(event);                                      // событие произошло - вызывает обработчик события(прописаны ниже)
        })(this)));
        //document.body.addEventListener('keydown', this.onKeyDown)
        document.body.addEventListener('keyup', (((self) => () => {
            self.onKeyUp(event);
        })(this)));
        //document.body.addEventListener('keydown', this.onKeyDown)
    }
    // onMouseDown (event) {
    //     this.action['fire'] = true;
    //     this.action.click = {};
    //     this.action.click.pos_x = event.offsetX;
    //     this.action.click.pos_y = event.offsetY;
    // }
    // onMouseUp (event) {
    //     this.action['fire'] = false;
    // }
    onKeyDown (event) {
        const act = this.bind[event.keyCode];
        if (act !== 'fire_up' && act !== 'fire_down' && act !== 'fire_right' && act !== 'fire_left') // стрелять одновременно с движением можно
            for(let prop in this.action) {    //  чтобы предотвратить: при одновременном нажатии кнопок в true устанавливаются несколько actions
                    this.action[prop] = false;                  // а вот 2 движения в gameManager при их проверке на true у player'a будут в некоторых случаях и move_x, и move_y не ноль=>спрайт не отобразится 
            }
        
        if (act) { // если нажатой кнопке есть сопоставляемое в объекте this.bind действие
            this.action[act] = true;        // готовимся к выполнению действия
        }
    }

    onKeyUp (event) {
        const act = this.bind[event.keyCode];    // action = 'up' | 'left' | 'right' | 'down'
        if (act) {
            this.action[act] = false;
        }
    }
}