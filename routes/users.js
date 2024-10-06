const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync')
const passport = require('passport');
const users = require('../controllers/users');
const { userSchema } = require('../schemas')
const { storeReturnTo, isLoggedIn, isAuthorProfile } = require('../middleware');

const ExpressError = require('../utils/ExpressError');
const Review = require('../models/review')
const User = require('../models/user')

const validateProfile = (req, res, next) => {
    const { error } = userSchema.validate(req.body);
    if (error) { //오류가 있으면 ExpressError 클래스 호출
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400);
    } else { //유효성 검사후 잘 작동하면 next를 호출
        next();
    }
}

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

//프로필(profile.ejs) 전송 라우트
router.get('/users/:id', catchAsync(users.renderProfile))

//사용자 관심목록(likeList.ejs) 전송 라우트
router.get('/users/:id/likeList', isLoggedIn, catchAsync(users.likeList))

// 프로필편집(profileEdit.ejs) 수정라우트
router.get('/users/:id/edit', isLoggedIn, isAuthorProfile, catchAsync(users.renderEditProfile))
//프로필편집(profileEdit.ejs) 폼에서 받아 제출하는 곳
router.put('/users/:id/', isLoggedIn, isAuthorProfile, validateProfile, catchAsync(users.editProfile))

// 프로필 삭제 라우트
router.delete('/users/:id/', isLoggedIn, isAuthorProfile, catchAsync(users.deleteProfile))

module.exports = router;