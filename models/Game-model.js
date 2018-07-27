let mongoose = require('mongoose');

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

module.exports = mongoose.model('Game', gameSchema);