const mongoose = require('mongoose'),
    bcrypt = require('bcrypt'),
    ethUtil = require('ethereumjs-util');

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    active: {
        type: Boolean,
        required: true,
        default: false
    },
    ethAddress: {
        type: String,
        trim: true,
        index: true,
        unique: true,
        sparse: true
    },
    password: {
        type: String
    },
    G_index: {
        type: Number,
        default: -1
    },
    stakedProjects: [
        {
            twrIndex: Number,
            project: Number, // either 0 or 1
            value: Number
        }
    ],
    correctAnswers: [
        {
            gkIndex: Number
        }
    ]
});

//authenticate input against database
UserSchema.statics.authenticate = function(email, password, callback) {
    User.findOne({ email: email }).exec(function(err, user) {
        if (err) {
            return callback(err);
        } else if (!user) {
            var err = new Error('User not found.');
            err.status = 401;
            return callback(err);
        }
        bcrypt.compare(password, user.password, function(err, result) {
            if (result === true) {
                return callback(null, user);
            } else {
                return callback();
            }
        });
    });
};

const verifySignature = (publicAddress, nonce, signature) => {
    const msg = `I am signing my one-time nonce: ${nonce}`;
    console.log('HERE frnejwt' + signature);
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
/*
    Ethereum Public Key Authentication
*/
UserSchema.statics.ethAddressAuthenticate = function(
    ethAddress,
    signature,
    nonce,
    callback
) {
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
    var user = this;
    if (!user.isModified('password')) return next();

    if (user.password) {
        bcrypt.hash(user.password, 10, function(err, hash) {
            if (err) {
                return next(err);
            }
            user.password = hash;
            next();
        });
    } else {
        next();
    }
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
