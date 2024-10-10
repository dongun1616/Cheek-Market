const User = require('../models/user')
const Product = require('../models/product');
const Review = require('../models/review');

//회원가입(register.ejs) 전송 라우트
module.exports.renderRegister = (req, res) => {
    res.render('users/register')
}
//회원가입(register.ejs) 제출 라우트
module.exports.register = async (req, res, next) => {
    try {
        const { email, username, password, introduce, location, reviews, products, nickname } = req.body;
        const user = new User({ email, username, introduce, location, reviews, products, nickname });
        const registerdUser = await User.register(user, password);
        req.login(registerdUser, err => {
            if (err) return next(err);
            req.flash('success', `Welcome to Cheek-Market ${nickname}!!`)
            res.redirect('/products');
        })
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('register');
    }
}

//로그인(login.ejs) 전송 라우트
module.exports.renderLogin = (req, res) => {
    res.render('users/login');
}
//로그인(login.ejs) 제출 라우트
module.exports.login = (req, res) => {
    const user = new User(req.body.user);
    req.flash('success', 'Welcome back!');
    const redirectUrl = res.locals.returnTo || '/products';
    res.redirect(redirectUrl);
}

//로그아웃 라우트
module.exports.logout = (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Goodbye!');
        res.redirect('/products');
    });
}

//프로필(profile.ejs) 전송 라우트
module.exports.renderProfile = async (req, res) => {
    const user = await User.findById(req.params.id).populate({ //중첩 채우기 
        path: 'reviews',
        populate: {
            path: 'author'
        }
    })
    // 사용자 리뷰의 평균을 구하는 함수
    let sumReview = 0;
    for (let i = 0; i < user.reviews.length; i++) {
        sumReview += user.reviews[i].rating;
    }
    const avgReview = sumReview / user.reviews.length;
    // //사용자 리뷰 평균 반올림
    const avgReviewRound = Math.round(avgReview)
    // // 사용자 리뷰 평균 소수점
    const avgReviewPoint = Math.round(avgReview * 10) / 10
    if (!user) {
        req.flash('error', 'Cannot find that user!');
        return res.redirect('/products')
    }
    res.render('users/profile', { user, avgReviewRound, avgReviewPoint })
}

//사용자 관심목록(LikeList.ejs) 전송 라우트
module.exports.likeList = async (req, res) => {
    const userId = req.params.id.toString(); // 요청된 사용자 ID
    const loggedInUserId = req.user._id.toString(); // 로그인된 사용자 ID

    // 요청된 사용자 ID와 로그인된 사용자 ID가 다른 경우 접근 차단
    if (userId !== loggedInUserId) {
        req.flash('error', 'You do not have permission to view this page');
        return res.redirect('/products'); // 접근 권한 없을 때 메인 페이지로 리다이렉트
    }

    // 사용자가 좋아요한 제품을 찾음
    const products = await Product.find({ likes: userId }).sort({ _id: -1 }).populate('author');
    res.render('users/likeList', { products });
}

// 프로필편집(profileEdit.ejs) 수정라우트
module.exports.renderEditProfile = async (req, res) => {
    const { id } = req.params;
    const user = await User.findById(id);
    res.render('users/profileEdit', { user })
}
//프로필편집(profileEdit.ejs) 폼에서 받아 제출하는 곳
module.exports.editProfile = async (req, res) => {
    const { id } = req.params;
    const user = await User.findByIdAndUpdate(id, { ...req.body.user })
    req.flash('success', 'Successfully updated users!')
    res.redirect(`/users/${user._id}`)
}

// 프로필 삭제 라우트
module.exports.deleteProfile = async (req, res) => {
    const { id } = req.params;

    // 사용자에서 리뷰 삭제
    //사용자의 리뷰를 찾아 삭제
    const deleteReviewsResult = await Review.find({ author: id });
    const deletedReviewIds = deleteReviewsResult.map(review => review._id);

    // 다른 사용자 프로필에서 해당 리뷰를 제거
    await User.updateMany(
        { 'reviews': { $in: deletedReviewIds } },
        { $pull: { reviews: { $in: deletedReviewIds } } }
    );
    // 사용자 리뷰 삭제
    await Review.deleteMany({ author: id });

    // 제품에서 좋아요 리뷰 삭제
    // 모든 제품에서 삭제된 리뷰를 참조하고 있는 사용자 리뷰 제거
    await Product.updateMany(
        { 'reviews': { $in: deletedReviewIds } }, // 삭제된 리뷰 ID가 있는 제품 찾기
        { $pull: { reviews: { $in: deletedReviewIds } } } // 리뷰 배열에서 삭제
    );
    // 제품에서 사용자 ID 제거 및 삭제된 리뷰 ID 제거
    await Product.updateMany(
        {
            $or: [
                { likes: id },
                { 'reviews.author': id }
            ]
        },
        {
            $pull: {
                likes: id,
                reviews: { author: id } // 리뷰 작성자를 제품 리뷰 배열에서 제거
            }
        }
    );
    // 사용자 삭제
    await User.findByIdAndDelete(id);

    req.flash('success', 'Your profile and all associated reviews have been successfully deleted.');
    res.redirect('/products');
}
