const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema();

commentSchema.add({
    author: String,
    content: String,
    parentId: String,
    children: [{ type: mongoose.Schema.Types.ObjectId, ref: 'comment' }]
});

module.exports = mongoose.model('comment', commentSchema);
