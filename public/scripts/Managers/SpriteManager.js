export class SpriteManager {
    image = new Image();
    sprites = [];   // массив объектов-спрайтов (содержат имя, координаты спрайта на изображении, длина и ширина изображения спрайта)
    imgLoaded = false;
    jsonLoaded = false;
    constructor() {
        // Атлас - JSON с инфой о размещении каждого отдельного изображения в Spritesheet
        this.loadAtlas('http://localhost:3001/public/data/sprites.json', 'public/assets/sprites/spritesheet.png');
    }
    loadAtlas(atlasJson, atlasImg) {    // передаем путь до atlasJSON, чтобы отправить запрос на сервер, и до atlasImg, чтобы загрузить изображение атласа
        const request = new XMLHttpRequest();
        request.onreadystatechange =  () => {
            if (request.readyState === 4 && request.status === 200) {   // получили с сервера
                this.parseAtlas(request.responseText);                  // парсим полученный json
            }
        };
        request.open('GET', atlasJson, true);            // асинхронный запрос для получения atlasJSON с сервера
        request.send();
        this.loadImg(atlasImg);                                         // загружаем изображение
    }
    loadImg(imgName) {      // загружаем к атласу изображение
        this.image.onload =  () => {
            this.imgLoaded = true;
        };
        this.image.src = imgName;                                       // сохраняем путь до изображения атласа, откуда каждый спрайт будет "извлекать" свой кусочек-изображение
    }
    parseAtlas(atlasJSON) {                                             // распарсив atlasJSON, можем заполнить массив объектов-спрайтов this.sprites = []
        const atlas = JSON.parse(atlasJSON);
        for (const name in atlas.frames) {                              // перебираем "ключи" спрайтов, например, name = 'player_left1'
            const {frame} = atlas.frames[name];                         // излекаем из frames для спрайта объект frame, содерж. координаты, длину и ширину спрайта(изображения) в spritesheet
            this.sprites.push({name: name, x: frame.x, y: frame.y, w: frame.w, h:
                frame.h});
        }
        this.jsonLoaded = true;
    }
    drawSprite(ctx, name, x, y) {                                       // заливка спрайта
                    // ctx нужен, чтобы знать, на каком холсте заливать
                    // name - знать, какой спрайт нужно залить, н-р, player_left1
                    // x, y - координаты, куда заливать

        if (!this.imgLoaded || !this.jsonLoaded) {                      // проверяем, что и изображение и JSON обработаны, все поля установлены
            setTimeout( ()=> { this.drawSprite(ctx, name,
                x, y); }, 100);
        } else {
            const sprite = this.getSprite(name);    // извлекаем искомый спрайт-объект с именем name из массива this.sprites[]
            ctx.drawImage(this.image, sprite.x, sprite.y, sprite.w, sprite.h, x,    // отрисовываем на холсте
                y, sprite.w, sprite.h);
        }
    }
    getSprite(name) {   // извлекаем искомый спрайт-объект с именем name из массива this.sprites[]
        for (let i = 0; i < this.sprites.length; i++) {
            const s = this.sprites[i];
            if (s.name === name)
                return s;
        }
        return null;
    }
}