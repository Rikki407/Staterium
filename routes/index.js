const express = require('express');

const router = express.Router();
const User = require('../models/User-model');
const passport = require('passport');
const ethUtil = require('ethereumjs-util');

const verifySignature = (req, res, next) => {
    const nonce = req.body.nonce;
    const signature = req.body.signature.signature;
    const msg = `I am signing my one-time nonce: ${nonce}`;
    const publicAddress = req.body.signature.publicAddress;
    const msgBuffer = ethUtil.toBuffer(msg);
    const msgHash = ethUtil.hashPersonalMessage(msgBuffer);
    const signatureBuffer = ethUtil.toBuffer(signature);
    const signatureParams = ethUtil.fromRpcSig(signatureBuffer);
    const publicKey = ethUtil.ecrecover(
        msgHash,
        signatureParams.v,
        signatureParams.r,
        signatureParams.s
    );
    const addressBuffer = ethUtil.publicToAddress(publicKey);
    const address = ethUtil.bufferToHex(addressBuffer);

    // The signature verification is successful if the address found with
    // ecrecover matches the initial publicAddress
    if (address.toLowerCase() === publicAddress.toLowerCase()) {
        return next();
    }
    res.send({ redirect: '/' });
};
router.get('/', (req, res) => {
    res.render('home', { rikki: 'Rikki' });
});
router.get('/register', (req, res) => {
    res.render('register');
});
router.post('/register', verifySignature, (req, res) => {
    User.register(
        new User({ username: req.body.username, email: req.body.email }),
        req.body.password,
        err => {
            if (err) {
                res.send({ redirect: '/register' });
            }
            passport.authenticate('local')(req, res, () => {
                res.send({ redirect: '/game' });
            });
        }
    );
});

router.get('/login', (req, res) => {
    res.render('login');
});
router.post('/login', verifySignature, (req, res, next) => {
    passport.authenticate('local', (err, user) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.send({ redirect: '/register' });
        }
        req.logIn(user, (err2) => {
            if (err2) {
                return next(err2);
            }
            return res.send({ redirect: '/game' });
        });
    })(req, res, next);
});
router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/login');
});

module.exports = router;
