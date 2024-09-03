const Product = require('./models/product'); //스키마 가져오기
const User = require('./models/user');
const Review = require('./models/review');

// 로그인을 확인하는 미들웨어
module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl
        req.flash('error', 'you must be signed in first')
        return res.redirect('/login');
    }
    next();
}

// 로그인후 원했던 라우트로 돌아가는 미들웨어
module.exports.storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}

// 사용자 제품 편집/삭제 권한을 확인하는 미들웨어
module.exports.isAuthorProduct = async (req, res, next) => {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/products/${id}`)
    } else {
        next();
    }
}

// 사용자 프로필 편집/삭제 권한을 확인하는 미들웨어
module.exports.isAuthorProfile = async (req, res, next) => {
    const { id } = req.user;
    const user = await User.findById(id);
    console.log(user)
    if (!user._id.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/users/${id}`)
    } else {
        next();
    }
}

// 사용자 리뷰 삭제 권한을 확인하는 미들웨어
module.exports.isAuthorReview = async (req, res, next) => {
    const { reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect('/products')
    } else {
        next();
    }
}
