let mongoose = require('mongoose');
let passportLocalMongoose = require('passport-local-mongoose');

let UserSchema = new mongoose.Schema({
    email: String,
    username: String,
    password: String,
    emailPassword: String
});
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);
