const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema();

commentSchema.add({
    content: String,
    children: [commentSchema],
    author: String
});

module.exports = mongoose.model('TWR', commentSchema);
