const express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    passport = require('passport'),
    mongoose = require('mongoose'),
    User = require('./models/User-model'),
    LocalStatergy = require('passport-local'),
    seedDb = require('./seed'),
    ethUtil = require('ethereumjs-util'),
    Game = require('./models/Game-model');
    
const url = process.env.DATABASEURL || 'mongodb://localhost/Startereum';
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

app.use(express.static(__dirname + '/public'));

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
app.get('/game', isLoggedIn, (req, res) => {
    res.redirect('/game/next');
});
let G_index = -1;
app.get('/game/next', isLoggedIn, (req, res) => {
    G_index++;
    if (G_index % 2 == 0) {
        res.redirect('/twr');
    } else {
        res.redirect('/gk');
    }
});
app.get('/game/prev', isLoggedIn, (req, res) => {
    G_index--;
    if (G_index % 2 == 0) {
        res.redirect('/twr');
    } else {
        res.redirect('/gk');
    }
});
app.get('/twr', isLoggedIn, (req, res) => {
    Game.find({})
        .populate('TWRs')
        .exec((err, game) => {
            let TWR = game[0].TWRs[G_index / 2];
            if (TWR === null || TWR === undefined) {
                res.render('home');
            } else {
                res.render('twr', { TWR });
            }
        });
});
app.get('/gk', isLoggedIn, (req, res) => {
    Game.find({})
        .populate('GKs')
        .exec((err, game) => {
            let GK = game[0].GKs[Math.floor(G_index / 2)];
            if (GK === null || GK === undefined) {
                res.render('home');
            } else {
                console.log(GK);
                res.render('gk', { GK });
            }
        });
});

app.post('/gk/submit', isLoggedIn, (req, res) => {
    Game.find({})
        .populate('GKs')
        .exec((err, game) => {
            let GK = game[0].GKs[Math.floor(G_index / 2)];
            console.log(GK.correctAnswerIndex+"  "+req.body.answer);
            if(req.body.answer === undefined){
                return res.send({ answer_correct: 'not selected' });
            }
            if (req.body.answer == GK.correctAnswerIndex) {
                return res.send({ answer_correct: true });
            } else {
                return res.send({ answer_correct: false });
            }
        });
});

app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/login');
});

app.get('*', (req, res) => {
    res.send('Oops ! ! ! !');
});
app.listen(process.env.PORT || 5000);



/////////////
// let express = require('express'),
//     app = express(),
//     bodyParser = require('body-parser'),
//     passport = require('passport'),
//     mongoose = require('mongoose'),
//     User = require('./models/User-model'),
//     LocalStatergy = require('passport-local'),
//     seedDb = require('./seed'),
//     Game = require('./models/Game-model');
// let indexRoutes = require('./routes/index'),
//     gameRoutes = require('./routes/game');

// let url = process.env.DATABASEURL || 'mongodb://localhost/Startereum';
// mongoose.connect(url);
// app.use(
//     require('express-session')({
//         secret: 'Minimlaborumeulaboreexcepteurquisnostrud',
//         resave: false,
//         saveUninitialized: false
//     })
// );

// seedDb();
// app.set('view engine', 'ejs');
// app.use(passport.initialize());
// app.use(passport.session());

// passport.use(new LocalStatergy(User.authenticate()));
// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());

// app.use(bodyParser.urlencoded({ extended: true }));

// app.use(express.static(__dirname + '/public'));

// app.use(indexRoutes);
// app.use(gameRoutes);


// app.listen(process.env.PORT || 5000);
