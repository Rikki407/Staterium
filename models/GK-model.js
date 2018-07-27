let mongoose = require('mongoose');

let gkSchema = new mongoose.Schema({
    question: String,
    answers: [String],
    correctAnswerIndex: Number,
    answerDiscussion: String
});
module.exports = mongoose.model('GK', gkSchema);