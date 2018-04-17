var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');

var UserSchema = new Schema({
    name: String,
    username: { type: String, required: true, index: { unique: true }},
    password: { type: String, required: true, select: false }
});

//hash the password before save
UserSchema.pre('save',function(next){
    var user = this;

    if(!user.isModified('password'))
        return next();

    bcrypt.hash(user.password, null, null, function(err, hash){
        if(err) return next(err);

        user.password = hash;
        next();
    })
});

UserSchema.methods.comparePassword = function(password, callback){
    var user = this;

    bcrypt.compare(password, user.password, function(err, isMatch){
        callback(isMatch);
    })
};

module.exports = mongoose.model('User', UserSchema);
