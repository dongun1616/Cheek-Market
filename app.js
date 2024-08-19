const express = require('express');
const path = require('path');
const app = express();
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const { productSchema, reviewSchema } = require('./schemas')
const catchAsync = require('./utils/catchAsync')
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');
const Product = require('./models/product'); //스키마 가져오기
const Review = require('./models/review');

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
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }))//req.body 파싱을 허용
app.use(methodOverride('_method')); //methodOverride 패키지를 _method로 요청을 받게만든다.

// JOI 제품 유효성 검사 함수
const validateProduct = (req, res, next) => {
    const { error } = productSchema.validate(req.body);
    if (error) { //오류가 있으면 ExpressError 클래스 호출
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400);
    } else { //유효성 검사후 잘 작동하면 next를 호출
        next();
    }
}
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

//home.ejs로 전송
app.get('/', (req, res) => { //home.ejs로 전송
    res.render('home')
})

// index.ejs로 전송 메인라우트
app.get('/products', catchAsync(async (req, res) => {
    const products = await Product.find({});
    res.render('products/index', { products }) //products 불러와서 렌더링
}))

// new.ejs로 전송 생성라우트(new 라우트는 :id를 사용한 라우트보다 위에 있어야 한다.)
app.get('/products/new', (req, res) => {
    res.render('products/new')
})
// new 생성폼에서 받아 제출되는 곳
app.post('/products', validateProduct, catchAsync(async (req, res) => {
    // if (!req.body.product) throw new ExpressError('Invalid Product Data', 400);

    const product = new Product(req.body.product);
    await product.save();
    res.redirect(`/products/${product._id}`)
}))

// show.ejs로 전송 상세라우트
app.get('/products/:id', catchAsync(async (req, res) => {
    const product = await Product.findById(req.params.id).populate('reviews')
    res.render('products/show', { product }) //product 불러와서 렌더링
}))

// edit.ejs로 전송 수정라우트
app.get('/products/:id/edit', catchAsync(async (req, res) => {
    const product = await Product.findById(req.params.id);
    res.render('products/edit', { product })
}))
// edit 편집폼에서 받아 제출하는 곳
app.put('/products/:id', validateProduct, catchAsync(async (req, res) => {
    const { id } = req.params;
    const product = await Product.findByIdAndUpdate(id, { ...req.body.product })
    res.redirect(`/products/${product._id}`)
}))

// delete.ejs로 전송 삭제 라우트
app.delete('/products/:id/', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Product.findByIdAndDelete(id)
    res.redirect('/products');
}))

// 제품에 리뷰작성하는 라우트(사용자 모델 생성시 옮기기)
app.post('/products/:id/reviews', validateReview, catchAsync(async (req, res) => {
    const product = await Product.findById(req.params.id);
    const review = new Review(req.body.review);
    product.reviews.push(review);
    await review.save();
    await product.save();
    res.redirect(`/products/${product._id}`);
}))

// 제품에 리뷰를 삭제하는 라우트
app.delete('/products/:id/reviews/:reviewId', catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Product.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/products/${id}`);
}))

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