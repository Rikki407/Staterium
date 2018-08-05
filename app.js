const express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    session = require('express-session'),
    MongoStore = require('connect-mongo')(session),
    User = require('./models/User-model'),
    seedDb = require('./seed'),
    ethUtil = require('ethereumjs-util'),
    Game = require('./models/Game-model'),
    nodemailer = require('nodemailer');

const url = process.env.DATABASEURL || 'mongodb://localhost/Startereum';
mongoose.connect(url);
const db = mongoose.connection;
app.use(
    session({
        secret: 'Minimlaborumeulaboreexcepteurquisnostrud',
        resave: false,
        saveUninitialized: false,
        store: new MongoStore({
            mongooseConnection: db
        })
    })
);

seedDb();
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(__dirname + '/public'));

const isLoggedIn = (req, res, next) => {
    if (req.session && req.session.userId) {
        return next();
    }
    return res.redirect('/register');
};


//==Email Verification===
const smtpTransport = nodemailer.createTransport({
    host: 'smtp.gmail.com',

    auth: {
        type: 'login', // default
        user: 'rishablamba407@gmail.com',
        pass: process.env.GMAIL_PASSWORD
    }
});
let rand, mailOptions, host, link;
//=======================

//==============
//Routes
//==============

app.get('/', (req, res) => {
    res.render('home', { rikki: 'Rikki' });
});

app.get('/register', (req, res) => {
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
app.post('/register', (req, res, next) => {
    if (req.body.email && req.body.password) {
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
            return res.redirect('/game');
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
                return res.send({ redirect: '/' });
            });
        }
    }
});
//Login Routes
app.get('/login', (req, res) => {
    res.render('login');
});
app.post('/login', (req, res, next) => {
    if (req.body.email && req.body.password) {
        User.authenticate(req.body.email, req.body.password, (error, user) => {
            if (error || !user) {
                const err = new Error('Wrong email or password.');
                err.status = 401;
                return next(err);
            }
            req.session.userId = user._id;
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
//////
// Game Routes
//////
app.get('/game', isLoggedIn, (req, res) => {
    User.findById(req.session.userId, (error, user) => {
        if (user.G_index === -1) {
            user.G_index += 1;
        }
        user.save(err => {
            if (err) {
                console.log(err);
            } else {
                req.session.G_index = user.G_index;
                console.log('game' + user.G_index);
                if (user.G_index % 2 === 0) {
                    res.redirect('/twr');
                } else {
                    res.redirect('/gk');
                }
            }
        });
    });
});
app.get('/game/next', isLoggedIn, (req, res) => {
    User.findById(req.session.userId, (error, user) => {
        user.G_index += 1;
        req.session.G_index = user.G_index;
        user.save(err => {
            if (err) {
                console.log(err);
            } else {
                if (user.G_index % 2 === 0) {
                    res.redirect('/twr');
                } else {
                    res.redirect('/gk');
                }
            }
        });
    });
});
app.get('/game/prev', isLoggedIn, (req, res) => {
    User.findById(req.session.userId, (error, user) => {
        console.log('prev' + user.G_index);
        user.G_index -= 1;
        req.session.G_index = user.G_index;
        user.save(err => {
            if (err) {
                console.log(err);
            } else {
                if (user.G_index % 2 === 0) {
                    return res.redirect('/twr');
                } else {
                    return res.redirect('/gk');
                }
            }
        });
    });
});
app.get('/twr', isLoggedIn, (req, res) => {
    Game.find({})
        .populate('TWRs')
        .exec((err, game) => {
            let TWR = game[0].TWRs[req.session.G_index / 2];
            if (TWR === null || TWR === undefined) {
                res.redirect('/endGame');
            } else {
                res.render('twr', { TWR });
            }
        });
});
app.post('/twr', isLoggedIn, (req, res) => {
    User.findById(req.session.userId, (error, user) => {
        user.stakedProjects.push({
            twrIndex: req.session.G_index,
            project: req.body.project, // either 0 or 1
            value: req.body.value
        });
        user.save(err => {
            if (err) {
                console.log(err);
                return res.send(err);
            }
            return res.send(true);
        });
    });
});
app.get('/gk', isLoggedIn, (req, res) => {
    Game.find({})
        .populate('GKs')
        .exec((err, game) => {
            let GK = game[0].GKs[Math.floor(req.session.G_index / 2)];
            if (GK === null || GK === undefined) {
                res.redirect('/');
            } else {
                res.render('gk', { GK });
            }
        });
});

app.post('/gk', isLoggedIn, (req, res) => {
    Game.find({})
        .populate('GKs')
        .exec((err, game) => {
            let GK = game[0].GKs[Math.floor(req.session.G_index / 2)];
            console.log(GK.correctAnswerIndex + '  ' + req.body.answer);
            if (req.body.answer === undefined) {
                return res.send({ answer_correct: 'not selected' });
            }
            if (req.body.answer == GK.correctAnswerIndex) {
                return res.send({ answer_correct: true });
            } else {
                return res.send({ answer_correct: false });
            }
        });
});

app.get('/logout', (req, res, next) => {
    if (req.session) {
        // delete session object
        req.session.destroy(err => {
            if (err) {
                return next(err);
            } else {
                return res.redirect('/');
            }
        });
    }
});
app.get('/endGame', (req, res) => {
    res.render('endGame');
});

app.get('*', (req, res) => {
    res.send('Oops ! ! ! !');
});
app.listen(process.env.PORT || 5000);
