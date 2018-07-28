let express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    passport = require('passport'),
    mongoose = require('mongoose'),
    User = require('./models/User-model'),
    LocalStatergy = require('passport-local'),
    seedDb = require('./seed'),
    ethUtil = require('ethereumjs-util');
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

app.use(express.static(__dirname + '/public'));

let isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
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
app.post('/register', (req, res) => {
    console.log(req.body);
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
    } else {
        return res.status(401).send({ error: 'Signature verification failed' });
    }
});
//Login Routes
app.get('/login', (req, res) => {
    res.render('login');
});
app.post(
    '/login',
    passport.authenticate('local', {
        successRedirect: '/game',
        failureRedirect: '/login'
    }),
    (req, res) => {}
);

app.get('/game', isLoggedIn, (req, res) => {
    res.render('game', { rikki: 'Rikki' });
});

app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/login');
});

app.get('/:name', (req, res) => {
    res.render('game', { rikki: req.params.name });
});

app.get('*', (req, res) => {
    res.send('Oops ! ! ! !');
});
app.listen(process.env.PORT || 5000);
