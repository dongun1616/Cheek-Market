const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync')
const User = require('../models/user');
const passport = require('passport');
const { storeReturnTo, isLoggedIn } = require('../middleware');

//회원가입 라우트
router.get('/register', (req, res) => {
    res.render('users/register')
})
//회원가입 제출 라우트
router.post('/register', catchAsync(async (req, res, next) => {
    try {
        const { email, username, password, introduce, location } = req.body;
        const user = new User({ email, username, introduce, location });
        const registerdUser = await User.register(user, password);
        req.login(registerdUser, err => {
            if (err) return next(err);
            req.flash('success', `Welcome to Cheek-Market ${username}!!`)
            res.redirect('/products');
        })
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('register');
    }
}))

//로그인 라우트
router.get('/login', (req, res) => {
    res.render('users/login');
})
router.post('/login', storeReturnTo, passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), (req, res) => {
    const user = new User(req.body.user);
    console.log(user);
    req.flash('success', 'Welcome back!');
    const redirectUrl = res.locals.returnTo || '/products';
    res.redirect(redirectUrl);
});

//로그아웃 라우트
router.get('/logout', (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Goodbye!');
        res.redirect('/products');
    });
});

//profile.ejs로 전송 라우트
router.get('/users/:id', isLoggedIn, catchAsync(async (req, res) => {
    const user = await User.findById(req.params.id).populate('reviews')
    if (!user) {
        req.flash('error', 'Cannot find that user!');
        return res.redirect('/products')
    }
    res.render('users/profile', { user })
}))

module.exports = router;