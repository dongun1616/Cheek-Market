const express = require('express');
const path = require('path');
const app = express();
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');

const products = require('./routes/products'); //제품 라우트 가져오기
const reviews = require('./routes/reviews'); //리뷰 라우트 가져오기

// db 연결 몽구스 연결
mongoose.connect('mongodb://localhost:27017/cheek-market')
    .then(() => {
        console.log("Mongo connection open!")
    })
    .catch(err => {
        console.log("oh no mongo connection error!!")
        console.log(err);
    })


app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')) //views페이지의 폴더 기본경로로 사용

app.use(express.urlencoded({ extended: true }))//req.body 파싱을 허용
app.use(methodOverride('_method')); //methodOverride 패키지를 _method로 요청을 받게만든다.
app.use(express.static(path.join(__dirname, 'public'))); //public 폴더를 정적 에셋으로 설정

//session 세팅
const sessionConfig = {
    secret: 'thisbeabettersecret!',
    resave: false, //경고 메시지 비활성화
    saveUninitialized: true,
    cookie: {
        httponly: true, //브라우저가 제 3자에게 쿠키를 유출하지 않도록 한다.(보안코드)
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, //쿠키 만료기한 설정
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig));
app.use(flash());

// flash 세팅
app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error')
    next();
})

app.use('/products', products); //제품 라우트 지정
app.use('/products/:id/reviews', reviews); //리뷰 라우트 지정

//home.ejs로 전송
app.get('/', (req, res) => { //home.ejs로 전송
    res.render('home')
})

//모든 경로 콜백 404
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404))
})

app.use((err, req, res, next) => { //공통된 오류 문구
    const { statusCode = 500 } = err;
    if (!err.message) err.message = 'Oh No, Something went wrong!'
    res.status(statusCode).render('error', { err })
})

//서버연결 확인 문구
app.listen(3000, () => {
    console.log('Serving on port 3000')
})