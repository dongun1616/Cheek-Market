const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync')
const { productSchema } = require('../schemas')
const ExpressError = require('../utils/ExpressError');
const Product = require('../models/product'); //스키마 가져오기

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

// index.ejs로 전송 메인라우트
router.get('/', catchAsync(async (req, res) => {
    const products = await Product.find({});
    res.render('products/index', { products }) //products 불러와서 렌더링
}))

// new.ejs로 전송 생성라우트(new 라우트는 :id를 사용한 라우트보다 위에 있어야 한다.)
router.get('/new', (req, res) => {
    res.render('products/new')
})
// new 생성폼에서 받아 제출되는 곳
router.post('/', validateProduct, catchAsync(async (req, res) => {
    // if (!req.body.product) throw new ExpressError('Invalid Product Data', 400);

    const product = new Product(req.body.product);
    await product.save();
    res.redirect(`/products/${product._id}`)
}))

// show.ejs로 전송 상세라우트
router.get('/:id', catchAsync(async (req, res) => {
    const product = await Product.findById(req.params.id).populate('reviews')
    res.render('products/show', { product }) //product 불러와서 렌더링
}))

// edit.ejs로 전송 수정라우트
router.get('/:id/edit', catchAsync(async (req, res) => {
    const product = await Product.findById(req.params.id);
    res.render('products/edit', { product })
}))
// edit 편집폼에서 받아 제출하는 곳
router.put('/:id', validateProduct, catchAsync(async (req, res) => {
    const { id } = req.params;
    const product = await Product.findByIdAndUpdate(id, { ...req.body.product })
    res.redirect(`/products/${product._id}`)
}))

// delete.ejs로 전송 삭제 라우트
router.delete('/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Product.findByIdAndDelete(id)
    res.redirect('/products');
}))

module.exports = router;