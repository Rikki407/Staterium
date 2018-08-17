let mongoose = require('mongoose');

let twrSchema = new mongoose.Schema({
    projectA: {
        logo: String,
        dream: String,
        author: String,
        description: String,
        usersStaked: {
            type: Number,
            default: 0
        }
    },
    projectB: {
        logo: String,
        dream: String,
        author: String,
        description: String,
        usersStaked: {
            type: Number,
            default: 0
        }
    },
    minStake: Number,
    maxStake: Number,
    endTime: Number
});

module.exports = mongoose.model('TWR', twrSchema);