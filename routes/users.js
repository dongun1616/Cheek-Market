const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync')
const passport = require('passport');
const { userSchema } = require('../schemas')
const { storeReturnTo, isLoggedIn } = require('../middleware');

const ExpressError = require('../utils/ExpressError');
const User = require('../models/user');

// JOI 사용자 유효성 검사 함수
const validateUser = (req, res, next) => {
    const { error } = userSchema.validate(req.body);
    if (error) { //오류가 있으면 ExpressError 클래스 호출
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400);
    } else { //유효성 검사후 잘 작동하면 next를 호출
        next();
    }
}

//회원가입(register.ejs) 전송 라우트
router.get('/register', (req, res) => {
    res.render('users/register')
})
//회원가입(register.ejs) 제출 라우트
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

//로그인(login.ejs) 전송 라우트
router.get('/login', (req, res) => {
    res.render('users/login');
})
//로그인(login.ejs) 제출 라우트
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

//프로필(profile.ejs) 전송 라우트
router.get('/users/:id', isLoggedIn, catchAsync(async (req, res) => {
    const user = await User.findById(req.params.id).populate('reviews')
    if (!user) {
        req.flash('error', 'Cannot find that user!');
        return res.redirect('/products')
    }
    res.render('users/profile', { user })
}))

// 프로필편집(profileEdit.ejs) 수정라우트
router.get('/users/:id/edit', isLoggedIn, catchAsync(async (req, res) => {
    const user = await User.findById(req.params.id);
    res.render('users/profileEdit', { user })
}))
//프로필편집(profileEdit.ejs) 폼에서 받아 제출하는 곳
router.put('/users/:id', isLoggedIn, validateUser, catchAsync(async (req, res) => {
    const { id } = req.params;
    const user = await User.findByIdAndUpdate(id, { ...req.body.user })
    req.flash('success', 'Successfully updated users!')
    res.redirect(`/users/${user._id}`)
}))

// 프로필 삭제 라우트
router.delete('/users/:id', isLoggedIn, catchAsync(async (req, res) => {
    const { id } = req.params;
    await User.findByIdAndDelete(id)
    req.flash('success', 'Successfully deleted user!')
    res.redirect('/products');
}))

module.exports = router;