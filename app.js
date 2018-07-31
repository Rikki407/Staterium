let express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    passport = require('passport'),
    mongoose = require('mongoose'),
    User = require('./models/User-model'),
    LocalStatergy = require('passport-local'),
    seedDb = require('./seed'),
    ethUtil = require('ethereumjs-util'),
    Game = require('./models/Game-model');
let url = process.env.DATABASEURL || 'mongodb://localhost/Startereum';
mongoose.connect(url);
app.use(
    require('express-session')({
        secret: 'Minimlaborumeulaboreexcepteurquisnostrud',
        resave: false,
        saveUninitialized: false
    })
);

seedDb();
app.set('view engine', 'ejs');
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStatergy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(__dirname+'/public'));

let isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
};

let verifySignature = (req, res, next) => {
    let nonce = req.body.nonce;
    let signature = req.body.signature.signature;
    const msg = `I am signing my one-time nonce: ${nonce}`;
    let publicAddress = req.body.signature.publicAddress;
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
    } else {
        res.send({ redirect: '/' });
    }
};
//==============
//Routes
//==============

app.get('/', (req, res) => {
    res.render('home', { rikki: 'Rikki' });
});
app.get('/register', (req, res) => {
    res.render('register');
});
app.post('/register', verifySignature, (req, res) => {
    User.register(
        new User({ username: req.body.username, email: req.body.email }),
        req.body.password,
        (err, user) => {
            if (err) {
                res.send({ redirect: '/register' });
            }
            passport.authenticate('local')(req, res, () => {
                res.send({ redirect: '/game' });
            });
        }
    );
});
//Login Routes
app.get('/login', (req, res) => {
    res.render('login');
});
app.post('/login', verifySignature, (req, res, next) => {
    passport.authenticate('local', function(err, user, info) {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.send({ redirect: '/register' });
        }
        req.logIn(user, function(err) {
            if (err) {
                return next(err);
            }
            return res.send({ redirect: '/game' });
        });
    })(req, res, next);
});
//////
// Game Routes
//////
let G_index = 0;
app.get('/game', isLoggedIn, (req, res) => {
    if (G_index % 2 == 0) {
        res.redirect('/twr');
    } else {
        res.redirect('/gk');
    }
    G_index++;
});
let TWR_index = 0;
app.get('/twr/dk', isLoggedIn, (req, res) => {
    Game.find({})
        .populate('TWRs')
        .exec((err, game) => {
            let TWR = game[0].TWRs[TWR_index];
            if (TWR === null || TWR === undefined) {
                res.render('home');
            } else {
                res.render('twr', { TWR });
            }
            TWR_index++;
        });
});
let GK_index = 0;
app.get('/gk', isLoggedIn, (req, res) => {
    Game.find({})
        .populate('GKs')
        .exec((err, game) => {
            let GK = game[0].GKs[GK_index];
            if (GK === null || GK === undefined) {
                res.render('home');
            } else {
                res.render('gk', { GK });
            }
            GK_index++;
        });
});

app.get('/gk', (req, res) => {
    res.render('gk');
});

app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/login');
});

app.get('*', (req, res) => {
    res.send('Oops ! ! ! !');
});
app.listen(process.env.PORT || 5000);
