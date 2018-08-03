const mongoose = require('mongoose'),
    bcrypt = require('bcrypt'),
    ethUtil = require('ethereumjs-util');

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
        type: String
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
const verifySignature = (publicAddress, nonce, signature) => {
    const msg = `I am signing my one-time nonce: ${nonce}`;

    const msgBuffer = ethUtil.toBuffer(msg);
    const msgHash = ethUtil.hashPersonalMessage(msgBuffer);
    const signatureBuffer = ethUtil.toBuffer(signature);
    const signatureParams = ethUtil.fromRpcSig(signatureBuffer);
    const publicKey = ethUtil.ecrecover(
        msgHash,
        signatureParams.v,
        signatureParams.r,
        signatureParams.s
    );
    const addressBuffer = ethUtil.publicToAddress(publicKey);
    const address = ethUtil.bufferToHex(addressBuffer);

    // The signature verification is successful if the address found with
    // ecrecover matches the initial publicAddress
    if (address.toLowerCase() === publicAddress.toLowerCase()) {
        return true;
    }
    return false;
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
        const isSignatureTrue = verifySignature(ethAddress, nonce, signature);
        if (isSignatureTrue) {
            return callback(null, user);
        }
        return callback();
    });
};

UserSchema.pre('save', function(next) {
    const user = this;
    if (user.password) {
        bcrypt.hash(user.password, 10, function(err, hash) {
            if (err) {
                return next(err);
            }
            user.password = hash;
        });
    }
    next();
});
const User = mongoose.model('User', UserSchema);

module.exports = User;
