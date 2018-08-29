const express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'),
    session = require('express-session'),
    MongoStore = require('connect-mongo')(session),
    User = require('./models/User-model'),
    seedDb = require('./seed'),
    Game = require('./models/Game-model'),
    Comment = require('./models/Comments-model'),
    bluebird = require('bluebird');

TWRx = require('./models/TWR-model');

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
            project: req.body.project, // either 0 or 1 for project A or B
            value: req.body.value
        });
        user.save(err => {
            if (err) {
                console.log(err);
                return res.send(err);
            }
            Game.find({}, (err, game) => {
                TWRx.findById(game[0].TWRs[0], (err, twr) => {
                    if (twr === null || twr === undefined) {
                        return res.send(err);
                    } else {
                    }
                    if (req.body.project == 0) {
                        twr.projectA.usersStaked += 1;
                    } else {
                        twr.projectB.usersStaked += 1;
                    }
                    console.log(
                        req.body.project,
                        twr.projectA.usersStaked,
                        twr.projectB.usersStaked
                    );
                    twr.save(err => {
                        if (err) {
                            return res.send(err);
                        }
                        if (
                            twr.projectA.usersStaked >
                                twr.projectB.usersStaked &&
                            req.body.project == 0
                        ) {
                            return res.send(true);
                        } else if (
                            twr.projectB.usersStaked >
                                twr.projectA.usersStaked &&
                            req.body.project == 1
                        ) {
                            return res.send(true);
                        }
                        return res.send(false);
                    });
                });
            });
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

app.post('/comment/', (req, res) => {
    Comment.create(
        {
            content: 'Hi Radha',
            author: 'Rishab'
        },
        (err, comment) => {
            if (!err) {
                console.log('Root comment recorded');
                Comment.create(
                    {
                        content: 'Hi Rishab Lamba',
                        author: 'Radha Kulkarni'
                    },
                    (error, com) => {
                        comment.children.push(com);
                        comment.save((err, data) => {
                            if (err) {
                                console.log(err);
                            }else{
                                console.log('Child comment recorded');
                                res.send(data);
                            }
                        });
                    }
                );
            } else {
                console.log(err);
            }
        }
    );
});

app.get('/comment/:commentId', (req, res) => {
    function getComment(userId) {
        return Comment.findOne({ _id: userId })
            .lean()
            .exec()
            .then(user => {
                return bluebird.props({
                    author: user.author,
                    content: user.content,
                    children: bluebird.map(user.children, getComment)
                });
            });
    }

    // Then call getUser once on the root node, e.g.
    getComment(req.params.commentId).then(function(commentTree) {
        console.log(commentTree);
        res.render('Feed');
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
