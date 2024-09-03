const User = require('../models/user')

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
    console.log(user);
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
