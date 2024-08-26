// 로그인을 확인하는 함수
module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl
        req.flash('error', 'you must be signed in first')
        return res.redirect('/login');
    }
    next();
}

// 로그인후 원했던 라우트로 돌아가는 함수
module.exports.storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}