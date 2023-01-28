/*export*/ class MapManager {

    constructor(lvl) {
        this.lvl = lvl; // соответствующий уровень карты
        this.mapData = null;    // переменная для хранения JSON-карты
        this.tLayer = null;     // весь JSON с типом tilelayer - слой тайлов карты
        this.xCount = 0;        // кол-во блоков по горизонтали
        this.yCount = 0;        // кол-во блоков по вертикали
        this.tSize = {x: 16, y: 16};    // размер блока в пикселях
        this.mapSize = {x: 16, y: 16};  // ширина и высота карты (вычисляется, но для удобства и экономии вычислений, на каждом цикле обновления карты)
        this.tilesets = [];             //  массив описаний блоков карты(их номера, размеры, координаты и тд)
        this.imgLoadCount = 0;          // кол-во загруженных изображений, необходимо, чтобы отображать карту ТОЛЬКО после загрузки ВСЕХ изображений
        this.imgLoaded = false;
        this.jsonLoaded = false;
        this.enemiesCount = 0;
        this.loadMap(`/public/data/lvl${lvl}.json`);
    }

    // загрузка из файла
    loadMap(path) {     // загрузка карты в формате JSON из внешнего файла;  path - путь до JSON карты, относительно HTML-страницы или абсолютный путь
        const request = new XMLHttpRequest(); // создание AJAX-запроса
        request.onreadystatechange = () => {    // эта функция будет вызвана сразу после отправки запроса
            if (request.readyState === 4 && request.status === 200) {       //  readyState - хранит инфу о гоовности ответа
                this.parseMap(request.responseText); // обработка полученного с сервера текста, будет парсить полученный JSON в виде текста
            }
        };
        request.open('GET', path, true); // отправка асинхронногоGET-запроса (JS продолжает, не дожидаясь ответа с сервера)
        request.send();
    }

    // парсим JSON-карту в объект MapManager
    parseMap(tilesJSON) { // установка полей MapManager в соответствии с полученными из JSON значениями
        this.mapData = JSON.parse(tilesJSON);   // парсим полученный с сервера JSON-строку в объект
        this.xCount = this.mapData.width;       // сохранение кол-ва блоков по горизонтали
        this.yCount = this.mapData.height;      // сохранение кол-ва блоков по вертикали
        this.tSize.x = this.mapData.tilewidth;  // сохранение ширины блока
        this.tSize.y = this.mapData.tileheight; // сохранение высоты блока
        this.mapSize.x = this.xCount * this.tSize.x;    // вычисление ширины карты
        this.mapSize.y = this.yCount * this.tSize.y;    // вычисление высоты карты

        for (let i = 0; i < this.mapData.tilesets.length; i++) {
            var img = new Image();
            // загружаем изображения tileset'ов
            img.onload = () => {
                this.imgLoadCount++;
                if (this.imgLoadCount === this.mapData.tilesets.length) {
                    this.imgLoaded = true;              // все изображения загружены
                }
            };
            img.src = '/public' + this.mapData.tilesets[i].image.slice(2);
            //console.log('SRC: ', img.src)
            //img.src = this.mapData.tilesets[i].image;

            // обрабатываем инфу о tilesets
            const t = this.mapData.tilesets[i];         // t хранит tileset
            const ts = {                                // сохраняем его основные свойства
                firstgid: t.firstgid,
                image: img,
                name: t.name,
                xCount: Math.floor(t.imagewidth / this.tSize.x),
                yCount: Math.floor(t.imageheight / this.tSize.y)
            };
            this.tilesets.push(ts);                     // пушим обработанный tileset в список tilesets нашего созданного MapManager'a
        }
        this.jsonLoaded = true;     // после обработки всех тайлссетов
    }

    // отрисовываем в контексте полученную карту-объект
    draw(ctx) {
        if (!this.imgLoaded || !this.jsonLoaded) {  // если карта не загружена, то повторить отрисовку через 100мс
            setTimeout(() => {
                this.draw(ctx);
            }, 100);
        } else {                                    // если карта загружена - начинаем отрисовку
            // назначаем tLayer - слой тайлов, слой блоков карты
            if (this.tLayer === null) {             // убеждаемся, что поле this.tLayer - настроено, подготовлено
                for (let id = 0; id < this.mapData.layers.length; id++) {   // проходимся по слоям карты mapdata и ищем слой tilelayer
                    const layer = this.mapData.layers[id];
                    if (layer.type === 'tilelayer') {
                        this.tLayer = layer;    // нашли - назначили
                        break;
                    }
                }
            }
            for (let i = 0; i < this.tLayer.data.length; i++) {     // проходимся по блокам карты
                if (this.tLayer.data[i] !== 0) {
                    const tile = this.getTile(this.tLayer.data[i]); // вызываем getTile(), чтобы получить объект-тайл с путем до его изображения и его координатами.
                    const pX = (i % this.xCount) * this.tSize.x;    // получаем координаты блока карты в пикселях, куда будем рисовать тайл
                    const pY = Math.floor(i / this.xCount) * this.tSize.y;
                    ctx.drawImage(tile.img, tile.px, tile.py, this.tSize.x,     // отрисовываем тайл в нужном месте на холсте
                        this.tSize.y, pX, pY, this.tSize.x, this.tSize.y);
                }
            }

        }
    }

    //  вспомогательная функция, вызывается в draw(), чтобы получить объект-тайл со всей инфой
    getTile(tileIndex) {    // функция получения блока-тайла из массива tilelayer в виде объекта  с информацией о пути до изображения тайла и координатами самого тайла
        let tile = {        // tileIndex - номер-категория тайла, чтобы понять, что за изображение там стоит
            img: null,
            px: 0, py: 0
        };
        const tileset = this.getTileset(tileIndex); // объект-tileset, в какой tileset входит этот тайл, чтобы получить доступ к изображению всего tileset
        tile.img = tileset.image;                   // копируем ссылку на изображение tileset'a
        const id = tileIndex - tileset.firstgid;    // нумерация тайлов в tileset идет с 1(tileset.firstgid=1), тогда индекс тайла в массиве tileset = tileIndex - firstgid
                                                    // а если tileset - продолжение предыдущего, то нумерация блоков("категория тайла") может начаться 31, например, поскольку
                                                    // первые 30 тайлов были в предыдущем tileset
        const x = id % tileset.xCount;              // координаты тайла в tileset по блокам
        const y = Math.floor(id / tileset.xCount);
        tile.px = x * this.tSize.x;                 // координаты тайла в tileset в пикселях
        tile.py = y * this.tSize.y;
        return tile;
    }

    //  вспомогательная функция, вызывается в getTile(), чтобы получить объект-tileset, в который входит заданный тайл
    getTileset(tileIndex) {
        for (var i = this.tilesets.length - 1; i >= 0; i--)
            if (this.tilesets[i].firstgid <= tileIndex) {   // если первый индекс в tileset <= "категория"/номер тайла, то тк перебираем tilesetы с конца, возвращаем текущий tileset
                return this.tilesets[i];
            }
        return null;    // если такого tileset не найдено
    }
    
    parseEntities(gameManager/*, physicManager, soundManager*/) {   // разбор слоя объектов -  objectgroup
        if (!this.imgLoaded || !this.jsonLoaded) {
            setTimeout(() => { this.parseEntities(gameManager/*, physicManager, soundManager*/); }, 100);
        } else
            for (let j = 0; j < this.mapData.layers.length; j++)    // перебираем слои JSON-карты и находим среди них слой объектов -  objectgroup
                if(this.mapData.layers[j].type === 'objectgroup') {

                    const entities = this.mapData.layers[j];        // сохраняем список объектов
                    for (let i = 0; i < entities.objects.length; i++) {     // перебираем объекты слоя
                        const e = entities.objects[i];
                        try {
                            const obj = new gameManager.factory[e.class](/*physicManager, soundManager*/);      // создаем объект с помощью фабрики GameManager'a по классу объекта
                            if(e.class === 'Skeleton' || e.class === 'Boss')
                                this.enemiesCount++;
                            obj.name = e.name;
                            obj.pos_x = e.x;
                            obj.pos_y = e.y;
                            obj.size_x = e.width;
                            obj.size_y = e.height;
                            gameManager.entities.push(obj); // добавляем в GameManger ссылку на объект, чтобы смогли отслеживать его
                            if(obj.name === 'Player')
                                gameManager.initPlayer(obj);    // если объект - Player, то инициализируем его через GameManager
                        } catch (ex) {
                            console.log('Error while creating: [' + e.id + '] ' + e.class + ', ' + ex);
                        }
                    }
                }
    }
    getTilesetIdx(x, y){    // получение индекса тайла из тайлсета, используя координаты тайла на карте в пикселях
        const wX = x;
        const wY = y;
        const idx = Math.floor(wY / this.tSize.y) * this.xCount + Math.floor(wX / this.tSize.x); // кол-во строк тайлов до тайла * кол-во блоков по горизонтали  +
                                                                                                       // + кол-во блоков до тайла по горизонтали = индекс массива mapData
        return this.tLayer.data[idx];   // возвращает индекс тайла из тайлсета по индексу в массиве mapData
    }
}