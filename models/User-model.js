const mongoose = require('mongoose'),
    bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        trim: true
    },
    ethAddress: {
        type: String,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    }
});
UserSchema.statics.authenticate = (email, password, callback) => {
    User.findOne({ email }).exec((err, user) => {
        if (err) {
            return callback(err);
        } else if (!user) {
            const error = new Error('User not found.');
            error.status = 401;
            return callback(error);
        }
        bcrypt.compare(password, user.password, (error, result) => {
            if (result === true) {
                return callback(null, user);
            }
            return callback();
        });
    });
};
UserSchema.methods.ethAddressAuthenticate = (
    ethAddress,
    signature,
    nonce,
    callback
) => {
    User.findOne({ ethAddress }).exec((err, user) => {
        if (err) {
            return callback(err);
        } else if (!user) {
            const error = new Error('User not found.');
            error.status = 401;
            return callback(error);
        }
    });
};

UserSchema.pre('save', function(next) {
    const user = this;
    bcrypt.hash(user.password, 10, function(err, hash) {
        if (err) {
            return next(err);
        }
        user.password = hash;
        next();
    });
});
const User = mongoose.model('User', UserSchema);

module.exports = User;
