let express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    passport = require('passport'),
    mongoose = require('mongoose'),
    User = require('./models/User-model'),
    LocalStatergy = require('passport-local'),
    seedDb = require('./seed');
mongoose.connect('mongodb://localhost/Startereum');

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
    console.log(req.body.password);
    User.register(
        new User({ username: req.body.username }),
        req.body.password,
        (err, user) => {
            if (err) {
                console.log(err);
                return res.render('register');
            }
            passport.authenticate('local')(req, res, () => {
                res.redirect('/game');
            });
        }
    );
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
app.listen(3000, () => {
    console.log('Server started on Port 3000');
});
