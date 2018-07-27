let mongoose = require('mongoose');

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

module.exports = mongoose.model('TWR', twrSchema);