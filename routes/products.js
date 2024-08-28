const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync')
const { productSchema } = require('../schemas')
const { isLoggedIn } = require('../middleware')

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

// 메인(index.ejs) 전송 메인라우트
router.get('/', catchAsync(async (req, res) => {
    const products = await Product.find({});
    res.render('products/index', { products }) //products 불러와서 렌더링
}))

// 제품생성(new.ejs)전송라우트(new 라우트는 :id를 사용한 라우트보다 위에 있어야 한다.)
router.get('/new', (req, res) => {
    res.render('products/new')
})
// 제품생성(new.ejs) 제출라우트
router.post('/', isLoggedIn, validateProduct, catchAsync(async (req, res) => {
    // if (!req.body.product) throw new ExpressError('Invalid Product Data', 400);
    const product = new Product(req.body.product);
    await product.save();
    req.flash('success', 'Successfully made a new product!');
    res.redirect(`/products/${product._id}`)
}))

// 제품상세(show.ejs) 전송라우트
router.get('/:id', catchAsync(async (req, res) => {
    const product = await Product.findById(req.params.id).populate('reviews')
    if (!product) {
        req.flash('error', 'Cannot find that product!');
        return res.redirect('/products')
    }
    res.render('products/show', { product }) //product 불러와서 렌더링
}))

// 제품수정(edit.ejs) 전송라우트
router.get('/:id/edit', isLoggedIn, catchAsync(async (req, res) => {
    const product = await Product.findById(req.params.id);
    res.render('products/edit', { product })
}))
// 제품수정(edit.ejs) 폼에서 받아 제출라우트
router.put('/:id', isLoggedIn, validateProduct, catchAsync(async (req, res) => {
    const { id } = req.params;
    const product = await Product.findByIdAndUpdate(id, { ...req.body.product })
    req.flash('success', 'Successfully updated product!')
    res.redirect(`/products/${product._id}`)
}))

// 제품 삭제 라우트
router.delete('/:id', isLoggedIn, catchAsync(async (req, res) => {
    const { id } = req.params;
    await Product.findByIdAndDelete(id)
    req.flash('success', 'Successfully deleted product!')
    res.redirect('/products');
}))

module.exports = router;