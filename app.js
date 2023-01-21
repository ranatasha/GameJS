import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import gameRouter from './routes/game.js'

const port = 8080;
const server = express();


//решаем отсутствие глобальных переменных __filename и __dirname решением из документации Node.js
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

server.set('views', path.join(__dirname, 'views'));
server.set('view engine', 'pug');

//server.use(express.json())

server.use('/public', express.static(path.join(__dirname, 'public')));
server.use('/', gameRouter)

server.get('/start', (req, res) => res.render('start') )

server.get('*', (req, res) => res.redirect(`http://localhost:${port}/start`));


server.listen(port, () => {
    console.log(`Server has been started on port ${port}...`)
})

