import express from 'express';

let router = express.Router();

router.get('/game', (req, res) => {
    console.log('Rendering page for game...')
    res.render('game');
});

export default router;