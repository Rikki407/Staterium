const express = require('express');

const router = express.Router();
const Game = require('../models/Game-model');

const isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
};

router.get('/game', isLoggedIn, (req, res) => {
    res.redirect('/game/next');
});
let Gindex = -1;
router.get('/game/next', isLoggedIn, (req, res) => {
    Gindex++;
    if (Gindex % 2 === 0) {
        res.redirect('/twr');
    } else {
        res.redirect('/gk');
    }
});
router.get('/game/prev', isLoggedIn, (req, res) => {
    Gindex--;
    if (Gindex % 2 === 0) {
        res.redirect('/twr');
    } else {
        res.redirect('/gk');
    }
});
router.get('/twr', isLoggedIn, (req, res) => {
    Game.find({})
        .populate('TWRs')
        .exec((err, game) => {
            const TWR = game[0].TWRs[Gindex / 2];
            if (TWR === null || TWR === undefined) {
                res.render('home');
            } else {
                res.render('twr', { TWR });
            }
        });
});
router.get('/gk', isLoggedIn, (req, res) => {
    Game.find({})
        .populate('GKs')
        .exec((err, game) => {
            const GK = game[0].GKs[Math.floor(Gindex / 2)];
            if (GK === null || GK === undefined) {
                res.render('home');
            } else {
                console.log(GK);
                res.render('gk', { GK });
            }
        });
});

router.post('/gk/submit', isLoggedIn, (req, res) => {
    Game.find({})
        .populate('GKs')
        .exec((err, game) => {
            const GK = game[0].GKs[Math.floor(Gindex / 2)];
            console.log(`${GK.correctAnswerIndex} ${req.body.answer}`);
            if (req.body.answer === undefined) {
                return res.send({ answer_correct: 'not selected' });
            }
            if (req.body.answer === GK.correctAnswerIndex) {
                return res.send({ answer_correct: true });
            }
            return res.send({ answer_correct: false });
        });
});

module.exports = router;
