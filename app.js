const express = require('express');
const path = require('path');
const app = express();
const mongoose = require('mongoose');
const Product = require('./models/product');

// db 연결
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

app.get('/', (req, res) => {
    res.render('home') //home.ejs로 전송
})

// 예시 하드코딩
app.get('/makeproduct', async (req, res) => {
    const prod = new Product({ title: 'My Product', description: 'cheap product!' });
    await prod.save();
    res.send(prod);
})

app.listen(3000, () => {
    console.log('Serving on port 3000')
})