const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync')
const profiles = require('../controllers/profiles');
const { userSchema } = require('../schemas')
const { isLoggedIn, isAuthorProfile } = require('../middleware');

const ExpressError = require('../utils/ExpressError');
// JOI 사용자 유효성 검사 함수
const validateProfile = (req, res, next) => {
    const { error } = userSchema.validate(req.body);
    if (error) { //오류가 있으면 ExpressError 클래스 호출
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400);
    } else { //유효성 검사후 잘 작동하면 next를 호출
        next();
    }
}

//프로필(profile.ejs) 전송 라우트
router.get('/', catchAsync(profiles.renderProfile))

// 프로필편집(profileEdit.ejs) 수정라우트
router.get('/edit', isLoggedIn, isAuthorProfile, catchAsync(profiles.renderEditProfile))
//프로필편집(profileEdit.ejs) 폼에서 받아 제출하는 곳
router.put('/', isLoggedIn, isAuthorProfile, validateProfile, catchAsync(profiles.editProfile))

// 프로필 삭제 라우트
router.delete('/', isLoggedIn, isAuthorProfile, catchAsync(profiles.deleteProfile))

module.exports = router;