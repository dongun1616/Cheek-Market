const express = require('express');
const path = require('path');
const app = express();
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const catchAsync = require('./utils/catchAsync')
const methodOverride = require('method-override');
const Product = require('./models/product'); //스키마 가져오기

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
app.post('/products', catchAsync(async (req, res) => {
    const product = new Product(req.body.product);
    await product.save();
    res.redirect(`/products/${product._id}`)
}))

// show.ejs로 전송 상세라우트
app.get('/products/:id', catchAsync(async (req, res) => {
    const product = await Product.findById(req.params.id);
    res.render('products/show', { product }) //product 불러와서 렌더링
}))

// edit.ejs로 전송 수정라우트
app.get('/products/:id/edit', catchAsync(async (req, res) => {
    const product = await Product.findById(req.params.id);
    res.render('products/edit', { product })
}))
// edit 편집폼에서 받아 제출하는 곳
app.put('/products/:id', catchAsync(async (req, res) => {
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

app.use((err, req, res, next) => { //오류 문구
    res.send('Oh boy, something went wrong!')
})

//서버연결 확인 문구
app.listen(3000, () => {
    console.log('Serving on port 3000')
})