const express = require('express'),
    app = express(),
    passport = require('passport'),
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

app.use(passport.initialize());
passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

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
            User.findById(req.session.userId, (error, user) => {
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
        return res.redirect('/index');
    }
};

//////
// Game Routes
//////
app.get('/game', isLoggedIn, (req, res) => {
    User.findById(req.session.userId, (erroror, user) => {
        if (user.G_index === -1) {
            user.G_index += 1;
        }
        user.save(error => {
            if (error) {
                console.log(error);
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
    User.findById(req.session.userId, (erroror, user) => {
        user.G_index += 1;
        req.session.G_index = user.G_index;
        user.save(error => {
            if (error) {
                console.log(error);
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
    User.findById(req.session.userId, (erroror, user) => {
        console.log('prev' + user.G_index);
        user.G_index -= 1;
        req.session.G_index = user.G_index;
        user.save(error => {
            if (error) {
                console.log(error);
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
        .exec((error, game) => {
            let TWR = game[0].TWRs[req.session.G_index / 2];
            if (TWR === null || TWR === undefined) {
                res.redirect('/endGame');
            } else {
                res.render('twr', { TWR });
            }
        });
});
app.post('/twr', isLoggedIn, (req, res) => {
    User.findById(req.session.userId, (erroror, user) => {
        user.stakedProjects.push({
            twrIndex: req.session.G_index,
            project: req.body.project, // either 0 or 1 for project A or B
            value: req.body.value
        });
        user.save(error => {
            if (error) {
                console.log(error);
                return res.send(error);
            }
            Game.find({}, (error, game) => {
                TWRx.findById(game[0].TWRs[0], (error, twr) => {
                    if (twr === null || twr === undefined) {
                        return res.send(error);
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
                    twr.save(error => {
                        if (error) {
                            return res.send(error);
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
        .exec((error, game) => {
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
        .exec((error, game) => {
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

app.post('/comment', (req, res) => {
    console.log('Hi there ' + req.body.content);
    Comment.create(
        {
            content: req.body.content,
            author: req.session.userId,
            parentId: req.body.parentId
        },
        (error, comment) => {
            if (!error) {
                if (req.body.parentId == null) {
                    console.log('Root comment recorded');
                    return res.send(comment);
                }
                Comment.findById(req.body.parentId, (error, parentComment) => {
                    parentComment.children.push(comment);
                    console.log('here');
                    parentComment.save((error, data) => {
                        if (error) {
                            console.log(error);
                        } else {
                            console.log('Child comment recorded');
                            res.send({ redirect: '/comment' });
                        }
                    });
                });
            } else {
                console.log(error);
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
                    commentId: user._id,
                    parentId: user.parentId,
                    children: bluebird.map(user.children, getComment)
                });
            });
    }

    getComment(req.params.commentId).then(function(commentTree) {
        console.log(commentTree);
        res.end(`[${JSON.stringify(commentTree)}]`);
    });
});

app.get('/comment', (req, res) => {
    res.render('Feed');
});
app.get('/endGame', (req, res) => {
    res.render('endGame');
});
app.get('/index', (req, res) => {
    res.render('landing/index');
});
app.use(authRoutes);

app.get('*', (req, res) => {
    res.send('Oops ! ! ! !');
});
app.listen(process.env.PORT || 5000);
