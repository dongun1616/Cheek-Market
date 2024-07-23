const express = require('express');
const path = require('path');
const app = express();
const mongoose = require('mongoose');
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


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }))//req.body 파싱을 허용

// 예시 하드코딩
// app.get('/makeproduct', async (req, res) => {
//     const prod = new Product({ title: 'My Product', description: 'cheap product!' });
//     await prod.save();
//     res.send(prod);
// })

//home.ejs로 전송
app.get('/', (req, res) => { //home.ejs로 전송
    res.render('home')
})

// index.ejs로 전송 메인라우트
app.get('/products', async (req, res) => {
    const products = await Product.find({});
    res.render('products/index', { products }) //products 불러와서 렌더링
})

// new.ejs로 전송 생성라우트(new 라우트는 :id를 사용한 라우트보다 위에 있어야 한다.)
app.get('/products/new', (req, res) => {
    res.render('products/new')
})
// new 생성폼에서 받아 제출되는 곳
app.post('/products', async (req, res) => {
    const product = new Product(req.body.product);
    await product.save();
    res.redirect(`/products/${product._id}`)
})

// show.ejs로 전송 상세라우트
app.get('/products/:id', async (req, res) => {
    const product = await Product.findById(req.params.id);
    res.render('products/show', { product }) //product 불러와서 렌더링
})


//서버연결 확인 문구
app.listen(3000, () => {
    console.log('Serving on port 3000')
})