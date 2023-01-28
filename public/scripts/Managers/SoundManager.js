class SoundManager{
    clips = {};
    context = null;
    gainNode = null;
    loaded = false;
    constructor() {
        this.context = new AudioContext();
        this.gainNode = this.context.createGain ?
            this.context.createGain() : this.context.createGainNode();
        this.gainNode.connect(this.context.destination);

    }
    load (path, callback) { // загрузка клипа, буфера. callback - ф-ция, к-я должна быть вызвана в случае успешной загрузки

        if (this.clips[path]) {     // если клип, буффер уже загружен и установлен в поле, то сразу
            callback(this.clips[path]); // вызываем загруженный клип
            return; // выход
        }
        // если еще не загружен
        const clip = {path: path, buffer: null, loaded: false}; // создаем клип и устанавливаем переданные свойства

        clip.play =  (volume, loop) => {                        // функция для проигрывания клипа
            this.play(this.path, {looping: loop?loop:false,         // вызывает soundManager.play()
                volume: volume?volume:1});
        };
        this.clips[path] = clip;    // помещаем в массив по ключу-пути созданный клип
        const request = new XMLHttpRequest();   // запрашиваем и загружаем буфер с сервера
        request.open('GET', path, true);
        request.responseType = 'arraybuffer';
        request.onload = () => {    // как только
            this.context.decodeAudioData(request.response,      // загружаем
                function (buffer) {
                    clip.buffer = buffer;   // устанавливаем буфер в клип
                    clip.loaded = true;
                    callback(clip);         // вызываем callback, поскольку буфер успешно загружен
                });
        };
        request.send();
    }
    loadArray(array) {
        for (let i = 0; i < array.length; i++) {
            this.load(array[i],  () => {
                if (array.length === Object.keys(this.clips).length) {
                    for (const sd in this.clips)
                        if (!this.clips[sd].loaded) return;
                    this.loaded = true;
                }
            });
        }
    }
    play (path, settings) {
        if (!this.loaded) {
            setTimeout(() => { this.play(path, settings); },
                1000);
            return;
        }
        let looping = false;
        let volume = 0.2;
        if (settings) {
            if (settings.looping)
                looping = settings.looping;
            if (settings.volume)
                volume = settings.volume;
        }
        const sd = this.clips[path];
        if (sd === null)
            return false;
        const sound = this.context.createBufferSource();
        sound.buffer = sd.buffer;
        sound.connect(this.gainNode);
        sound.loop = looping;
        this.gainNode.gain.value = volume;
        sound.start(0);
        return true;
    }

}