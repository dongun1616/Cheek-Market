const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync')
const User = require('../models/user');


router.get('/register', (req, res) => {
    res.render('users/register')
})

//profile.ejs로 전송 라우트
router.get('/users', catchAsync(async (req, res) => {
    const user = await User.findById(req.params.id).populate('reviews')
    res.render('products/profile', { user })
}))

//회원가입 제출 라우트
router.post('/register', catchAsync(async (req, res) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registerdUser = await User.register(user, password);
        req.flash('success', `Welcome to Cheek-Market ${username}!!`)
        res.redirect('/products');
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('register');
    }
}))

module.exports = router;