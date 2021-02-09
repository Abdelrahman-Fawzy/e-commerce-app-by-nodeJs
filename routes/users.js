const e = require('express');
const express = require('express');
const router = express.Router();
const passport = require('passport');
const bcrypt = require('bcrypt')

var User = require('../models/user');

router.get('/register', (req, res) => {
    res.render('register', {
        title: "Register"
    })
});

router.post('/register', (req, res) => {
    var name = req.body.name;
    var email = req.body.email;
    var username = req.body.username;
    var password = req.body.password;
    var password2 = req.body.password2;

    req.checkBody("name", "Name Must Have A Value").notEmpty();
    req.checkBody("email", "Email Must Have A Value").notEmpty();
    req.checkBody("username", "Username Must Have A Value").notEmpty();
    req.checkBody("password", "Password Must Have A Value").notEmpty();
    req.checkBody("password2", "Passwords Don't Match").equals(password);

    var errors = req.validationErrors();

    if (errors) {
        res.render('register', {
            errors: errors,
            user: null,
            title: "Register"
        })
    } else {
        User.findOne({username: username}, (err, user) => {
            if (user) {
                req.flash('danger', 'This User Is Exist');
                res.redirect('/users/register')
            } else {
                var user = new User({
                    name: name,
                    email: email,
                    username: username,
                    password:password,
                    admin: 0
                });

                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(user.password, salt, (err, hash) => {
                        if (err) return console.log(err)
                        else {
                            user.password = hash;

                            user.save((err) => {
                                if (err) return console.log(err)
                                else {
                                    req.flash('success', 'You Are Now Registerd')
                                    res.redirect('/users/login')
                                }
                            })
                        }
                    })
                })
            }
        })
    }

});

router.get('/login', (req, res) => {
    res.render('login', {
        title: "Log In"
    })
});

router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/users/login',
        failureFlash: true
    })(req, res, next);
});

router.get('/logout', (req, res) => {
    req.logOut();

    req.flash('success', 'You are logged out')
    res.redirect('/users/login')
})

module.exports = router