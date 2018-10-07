const mongoose = require('mongoose');
const validator = require('validator');
const uuidv3 = require('uuid/v3');

const Schema = mongoose.Schema;

const userSchema = Schema({
    email: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true,
        validate: [validator.isEmail, 'Please Supply a valid email address'],
        required: 'Please Supply an email address'
    },
    token: {
        type: String
    },
    quotas: {
        type: Schema.Types.Mixed,
        default: {}
    }
}, { minimize: false });

userSchema.statics.findOneOrCreate = function findOneOrCreate(condition, callback) {

    const self = this;

    self.findOne(condition, (error, result) => {
        if (result) {
            return callback(error, result);
        } else {

            condition.token = uuidv3(condition.email, uuidv3.URL);

            self.create(condition, (error, result) => {
                return callback(error, result);
            });
        }
    });
};


module.exports = mongoose.model('User', userSchema);
