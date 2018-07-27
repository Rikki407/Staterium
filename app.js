let express = require('express');
let app = express();
let bodyParser = require('body-parser');
let mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/Starterium');

app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');


app.get('/', (req, res) => {
    res.render('game.ejs', { rikki: 'Rikki' });
});
app.get('/:name', (req, res) => {
    res.render('game.ejs', { rikki: req.params.name });
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
