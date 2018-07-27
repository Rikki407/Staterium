let mongoose = require('mongoose');
mongoose.connect(
    'mongodb://localhost:27017/Startereum',
    { useNewUrlParser: true }
);

let twrSchema = new mongoose.Schema({
    projectA: {
        logo: String,
        dream: String,
        author: String,
        description: String
    },
    projectB: {
        logo: String,
        dream: String,
        author: String,
        description: String
    },
    minStake: Number,
    maxStake: Number,
    endTime: Number
});

let TWR = mongoose.model('TWR', twrSchema);
let newTWR = {
    projectA: {
        logo:
            'https://www.designevo.com/res/templates/thumb_small/blue-wing-and-circle.png',
        dream: `Eu cupidatat anim tempor sunt qui aliqua irure esse duis. Magna sunt cupidatat ut Lorem tempor amet ex. Irure
        in consequat eu minim esse et voluptate laborum. Mollit aliqua culpa ipsum Lorem sit i`,
        author: `Eu cupidatat anim tempor sunt qui aliqua irure esse duis. Magna sunt cupidatat ut Lorem tempor amet ex. Irure
        in consequat eu minim esse et voluptate laborum. Mollit aliqua culpa ipsum Lorem sit in enim anim est
        dolore anim anim magna. Ex consectetur Lorem veniam adipisicing. Ut nulla veniam duis velit occaecat
        qui.`,
        description: `Somebody once told me the world is gonna roll me. I ain't the sharpest tool in the shed. She was looking kind of dumb with 
        her finger and her thumb in the shape of an \"L\" on her forehead. Well the years start coming and they don't stop coming. Fed to the rules 
        and I hit the ground running. Didn't make sense not to live for fun. Your brain gets smart but your head gets dumb. So much to do, so much to see. 
        So what's wrong with taking the back streets? You'll never know if you don't go. You'll never shine if you don't glow.</p><p>Hey now, you're an all-star
        , get your game on, go play. Hey now, you're a rock star, get the show on, get paid. And all that glitters is gold. Only shooting stars break the mold.
        </p><p>It's a cool place and they say it gets colder. You're bundled up now, wait till you get older. But the meteor men beg to differ. Judging by the 
        hole in the satellite picture. The ice we skate is getting pretty thin. The water's getting warm so you might as well swim. My world's on fire, how about 
        yours? That's the way I like it and I never get bored.`
    },
    projectB: {
        logo: `https://www.designevo.com/res/templates/thumb_small/symmetrical-red-and-blue-polygon-company.png`,
        dream: `Eu cupidatat anim tempor sunt qui aliqua irure esse duis. Magna sunt cupidatat ut Lorem tempor amet ex. Irure
        in consequat eu minim esse et voluptate laborum. Mollit aliqua culpa ipsum Lorem sit in enim anim est
        dolore anim anim magna. Ex consectetur Lorem veniam adipisicing. Ut nulla veniam duis velit occaecat
        qui.`,
        author: `Eu cupidatat anim tempor sunt qui aliqua irure esse duis. Magna sunt cupidatat ut Lorem tempor amet ex. Irure
        in consequat eu minim esse et voluptate laborum. adipisicing. Ut nulla veniam duis velit occaecat qui.`,
        description: `Somebody once told me the world is gonna roll me. I ain't the sharpest tool in the shed. She was looking kind of dumb with 
        her finger and her thumb in the shape of an on her forehead. Well the years start coming and they don't stop coming. Fed to the rules and 
        I hit the ground running. Didn't make sense not to live for fun. Your brain gets smart but your head gets dumb. So much to do, so much to see. 
        So what's wrong with taking the back streets? You'll never know if you don't go. You'll never shine if you don't glow.Hey now, you're an all-star, 
        get your game on, go play. Hey now, you're a rock star, get the show on, get paid. And all that glitters is gold. Only shooting stars break the mold.
        It's a cool place and they say it gets colder. You're bundled up now, wait till you get older. But the meteor men beg to differ. Judging by the hole 
        in the satellite picture. The ice we skate is getting pretty thin. The water's getting warm so you might as well swim. My world's on fire, how about 
        yours? That's the way I like it and I never get bored.`
    },
    minStake: 5,
    maxStake: 50
};

let gkSchema = new mongoose.Schema({
    question: String,
    answers: [String],
    correctAnswerIndex: Number,
    answerDiscussion: String
});
let GK = mongoose.model('GK', gkSchema);
let newGK = {
    question: `The challenge with making crypto versions of the dollar, rupee etc. fiat currencies is that_________ `,
    answers: [
        `Central banks are not authorized by law to create them.`,
        `Crypto exchanges may ban such fiat-linked tokens.`,
        `The new crypto-token will immediately float in value against the original fiat.`,
        `No nation or central bank yet owns its own blockchain.`
    ],
    correctAnswerIndex: 2,
    answerDiscussion: `All market traded commodities float in value, including currencies. 
    \nFor a discussion of state issued cryptotokens read more here: https://mashable.com/2018/01/08/cryptocurrency-bitcoin-governments/`
};

let gameSchema = new mongoose.Schema({
    TWRs: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'TWR'
        }
    ],
    GKs: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'GK'
        }
    ]
});

let Game = mongoose.model('Game', gameSchema);
// Game.create({}, (err, game) => {
//     if (err) {
//         console.log(err);
//     } else {
//         console.log('New Game \n' + game);
//     }
// });

// Game.findOne({ _id: '5b5b1cffc84a5a947c640b57' }, (err, game) => {
//     TWR.findOne({ _id: '5b5b1d67ef241494e01e9302' }, (err, twr) => {
//         GK.findOne({ _id: '5b5b1e2a7e8f8e95230ba5b1' }, (err, gk) => {
//             game.TWRs.push(twr);
//             game.GKs.push(gk);
//             game.save((err, data) => {
//                 if (err) {
//                     console.log(err);
//                 } else {
//                     console.log(data);
//                 }
//             });
//         });
//     });
// });
TWR.find({}, (err, data) => {
    console.log(data);
});

