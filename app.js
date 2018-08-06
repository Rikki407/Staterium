const express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    session = require('express-session'),
    MongoStore = require('connect-mongo')(session),
    User = require('./models/User-model'),
    seedDb = require('./seed'),
    Game = require('./models/Game-model');

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

const authRoutes = require('./routes/index');

const isLoggedIn = (req, res, next) => {
    if (req.session && req.session.userId) {
        if (req.session.active) {
            return next();
        } else if (req.session.active === undefined) {
            User.findById(req.session.userId, (err, user) => {
                if (user.active) {
                    req.session.active = true;
                    return next();
                }
                return res.redirect('/activateAccount');
            });
        } else {
            return res.redirect('/activateAccount');
        }
    } else {
        return res.redirect('/login');
    }
};

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

app.get('/endGame', (req, res) => {
    res.render('endGame');
});

app.use(authRoutes);

app.get('*', (req, res) => {
    res.send('Oops ! ! ! !');
});
app.listen(process.env.PORT || 5000);
