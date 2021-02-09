var LocalStrategy = require('passport-local').Strategy;
const User = require('../models/user');
var bcrypt = require('bcrypt');

module.exports = function (passport) {
    passport.use(new LocalStrategy(function (username, password, done) {
        User.findOne({username: username}, (err, user) => {
            if (err) return console.log(err)
            else {
                if (!user) {
                    return done(null, false, {message: "No User Is Found"})
                } else {
                    bcrypt.compare(password, user.password, (err, isMatch) => {
                        if (err) return console.log(err)
                        else {
                            if (isMatch) {
                                return done(null, user)
                            } else {
                                return done(null, false, {message: "Wrong Password"})
                            }
                        }
                    });
                }
            }
        });
    }));

    passport.serializeUser((user, done) => {
        done(null, user.id)
    });

    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => {
            done(err, user)
        })
    })
}