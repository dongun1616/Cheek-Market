const express = require('express')
const router = express.Router({ mergeParams: true });//app.js의 매개변수와 함께 review.js 파일의 매개변수가 병합된다.
const catchAsync = require('../utils/catchAsync')
const userReviews = require('../controllers/userReviews');
const { reviewSchema } = require('../schemas')
const { isLoggedIn, isAuthorReview } = require('../middleware')

const ExpressError = require('../utils/ExpressError');

// JOI 리뷰 유효성 검사 함수
const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) { //오류가 있으면 ExpressError 클래스 호출
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400);
    } else { //유효성 검사후 잘 작동하면 next를 호출
        next();
    }
}

// 사용자에 리뷰작성하는 라우트
router.post('/', isLoggedIn, validateReview, catchAsync(userReviews.createUserReview))

// 사용자에 리뷰를 삭제하는 라우트
router.delete('/:reviewId', isLoggedIn, isAuthorReview, catchAsync(userReviews.deleteUserReview))

module.exports = router;