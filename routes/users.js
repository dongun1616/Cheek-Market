const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync')
const passport = require('passport');
const users = require('../controllers/users');
const { storeReturnTo } = require('../middleware');

//회원가입(register.ejs) 전송 라우트
router.get('/register', users.renderRegister)
//회원가입(register.ejs) 제출 라우트
router.post('/register', catchAsync(users.register))

//로그인(login.ejs) 전송 라우트
router.get('/login', users.renderLogin)
//로그인(login.ejs) 제출 라우트
router.post('/login', storeReturnTo, passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), users.login);

//로그아웃 라우트
router.get('/logout', users.logout);

module.exports = router;