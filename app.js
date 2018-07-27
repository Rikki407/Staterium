let express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    passport = require('passport'),
    mongoose = require('mongoose'),
    User = require('./models/User-model'),
    localStatergy = require('passport-local'),
    passportLocalMongoose = require('passport-local-mongoose');

mongoose.connect('mongodb://localhost/Startereum');

app.use(
    require('express-session')({
        secret: 'Minimlaborumeulaboreexcepteurquisnostrud',
        resave: false,
        saveUninitialized: false
    })
);

let seedDb = require('./seed');
seedDb();
app.set('view engine', 'ejs');
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(__dirname + '/public'));

//==============
//Routes
//==============

app.get('/', (req, res) => {
    res.render('game.ejs', { rikki: 'Rikki' });
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
                res.redirect('/');

            });
        }
    );
});
app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/:name', (req, res) => {
    res.render('game', { rikki: req.params.name });
});
app.post('/addFriend', (req, res) => {
    console.log(req.body);
    res.send('Post request hit!');
    res.redirect('/');
});

app.get('*', (req, res) => {
    res.send('Oops ! ! ! !');
});
app.listen(3000, () => {
    console.log('Server started on Port 3000');
});
