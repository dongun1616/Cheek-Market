const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync')
const products = require('../controllers/products');
const { productSchema } = require('../schemas')
const { isLoggedIn, isAuthorProduct } = require('../middleware')
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage })

const ExpressError = require('../utils/ExpressError');

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
router.get('/', catchAsync(products.index))

// 제품 검색 라우트
router.get("/search", catchAsync(products.search))

// 제품생성(new.ejs)전송라우트(new 라우트는 :id를 사용한 라우트보다 위에 있어야 한다.)
router.get('/new', isLoggedIn, products.renderNewForm)
// 제품생성(new.ejs) 제출라우트
router.post('/', isLoggedIn, upload.array('image'), validateProduct, catchAsync(products.createProduct))

// 제품상세(show.ejs) 전송라우트
router.get('/:id', catchAsync(products.showProduct))
// 제품 관심(like) 전송라우트
router.get('/:id/like', isLoggedIn, catchAsync(products.likeProduct))

// 제품수정(edit.ejs) 전송라우트
router.get('/:id/edit', isLoggedIn, isAuthorProduct, catchAsync(products.renderEditForm))
// 제품수정(edit.ejs) 폼에서 받아 제출라우트
router.put('/:id', isLoggedIn, isAuthorProduct, upload.array('image'), validateProduct, catchAsync(products.editProduct))

// 제품 삭제 라우트
router.delete('/:id', isLoggedIn, isAuthorProduct, catchAsync(products.deleteProduct))

module.exports = router;