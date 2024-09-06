const User = require('../models/user')
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
    // 리뷰 작성자 삭제 반복문
    while (await Review.findOne({ author: id })) {
        await Review.findOneAndDelete({ author: id })
    }
    await User.findByIdAndDelete(id)
    req.flash('success', 'Successfully deleted user!')
    res.redirect('/products');
}
