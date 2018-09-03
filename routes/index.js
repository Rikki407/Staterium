const express = require('express'),
    passport = require('passport'),
    GoogleStrategy = require('passport-google-oauth').OAuth2Strategy,
    router = express.Router(),
    ethUtil = require('ethereumjs-util'),
    nodemailer = require('nodemailer'),
    User = require('../models/User-model');

const keys = require('../config/configKeys');

console.log(process.env.GMAIL_PASSWORD);

passport.use(
    new GoogleStrategy(
        {
            clientID: keys.google.clientID,
            clientSecret: keys.google.clientSecret,
            callbackURL: 'http://localhost:5000/auth/google/callback'
        },
        (accessToken, refreshToken, profile, done) => {
            console.log(profile);
            return done(null, 'success');
        }
    )
);

router.get(
    '/auth/google',
    passport.authenticate('google', {
        scope: ['profile']
    })
);

router.get(
    '/auth/google/callback',
    passport.authenticate('google'),
    (req, res) => {
        res.send('you have reached your destination');
    }
);

//==Email Verification===
const smtpTransport = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    auth: {
        type: 'login', // default
        user: 'rishablamba407@gmail.com',
        pass: keys.gmail.password
    }
});
let host;
const sendVerificationMail = (user, host) => {
    const link = 'http://' + host + '/verify?id=' + user._id;
    const mailOptions = {
        to: user.email,
        subject: 'Please confirm your Email account',
        html: `Hello,<br> Please Click on the link to verify your email.<br><a href=
                            ${link}
                            >Click here to verify</a>`
    };
    console.log(mailOptions);

    smtpTransport.sendMail(mailOptions, function(error, response) {
        if (error) {
            console.log(error);
        } else {
            console.log('Message sent: ' + response);
        }
    });
};

router.get('/verify', (req, res) => {
    User.findById(req.query.id, (err, user) => {
        if (user) {
            console.log(req.protocol + ':/' + req.get('host'));
            if (req.protocol + '://' + req.get('host') === 'http://' + host) {
                console.log(
                    'Domain is matched. Information is from Authentic email'
                );
                user.active = true;
                req.session.active = true;
                console.log('email is verified' + req.session.active);
                user.save(err => {
                    if (err) {
                        res.send(err);
                    } else {
                        console.log('User Account activated');
                        res.redirect('/');
                    }
                });
            }
        } else {
            res.send('<h1>Request is from unknown source</h1>');
        }
    });
});
router.get('/activateAccount', (req, res) => {
    res.render('activateAccount');
});
//=======================

//==============
//Routes
//==============

router.get('/', (req, res) => {
    res.render('home');
});

router.get('/register', (req, res) => {
    res.render('register');
});

const verifySignature = (publicAddress, nonce, signature) => {
    const msg = `I am signing my one-time nonce: ${nonce}`;

    const msgBuffer = ethUtil.toBuffer(msg);
    const msgHash = ethUtil.hashPersonalMessage(msgBuffer);
    console.log(signature);
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
        return true;
    }
    return false;
};
router.post('/register', (req, res, next) => {
    host = req.get('host');

    if (req.body.email && req.body.password) {
        console.log('hehehehe' + req.body.password);
        const userData = {
            email: req.body.email,
            password: req.body.password
        };
        //use schema.create to insert data into the db
        User.create(userData, (err, user) => {
            if (err) {
                return next(err);
            }
            req.session.userId = user._id;
            sendVerificationMail(user, req.get('host'));
            return res.redirect('/activateAccount');
        });
    } else if (req.body.ethAddress && req.body.nonce && req.body.signature) {
        const userData = {
            ethAddress: req.body.ethAddress,
            email: req.body.email
        };
        if (
            verifySignature(
                req.body.ethAddress,
                req.body.nonce,
                req.body.signature
            )
        ) {
            User.create(userData, (err, user) => {
                if (err) {
                    console.log(err);
                    return res.send({ redirect: '/register' });
                }
                req.session.userId = user._id;
                sendVerificationMail(user, req.get('host'));
                return res.send({ redirect: '/activateAccount' });
            });
        }
    } else {
        return res.send('<h1>Choose A method Of Authentication</h1>');
    }
});
//Login Routes
router.get('/login', (req, res) => {
    res.render('login');
});
router.post('/login', (req, res, next) => {
    if (req.body.email && req.body.password) {
        User.authenticate(req.body.email, req.body.password, (error, user) => {
            if (error || !user) {
                const err = new Error('Wrong email or password.');
                err.status = 401;
                return next(err);
            }
            req.session.userId = user._id;
            req.session.active = user.active;
            return res.redirect('/game');
        });
    } else if (req.body.ethAddress && req.body.nonce && req.body.signature) {
        User.ethAddressAuthenticate(
            req.body.ethAddress,
            req.body.signature,
            req.body.nonce,
            (error, user) => {
                if (error || !user) {
                    const err = new Error('Wrong email or password.');
                    err.status = 401;
                    return next(err);
                }
                req.session.userId = user._id;
                return res.send({ redirect: '/game' });
            }
        );
    }
});
router.get('/logout', (req, res, next) => {
    if (req.session) {
        // delete session object
        req.session.destroy(err => {
            if (err) {
                return next(err);
            }
            return res.redirect('/login');
        });
    }
});

module.exports = router;
