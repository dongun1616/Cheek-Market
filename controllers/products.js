const Product = require('../models/product'); //스키마 가져오기
const User = require('../models/user')
const Like = require('../models/like')
const { cloudinary } = require('../cloudinary');

// index 전송 라우트
module.exports.index = async (req, res) => {
    const products = await Product.find({}).sort({ _id: -1 }).populate('author');
    res.render('products/index', { products }) //products 불러와서 렌더링
}

// 제품 검색 라우트
module.exports.search = async (req, res) => {
    const keyword = req.query.inputText; // 쿼리 스트링에서 'keyword' 파라미터 읽기
    const titles = await Product.find({ title: { $regex: keyword } }).sort({ _id: -1 })
    const locations = await Product.find({ location: { $regex: keyword } }).sort({ _id: -1 })
    res.render('products/search', { titles, locations, keyword }) //titles , locations, keyword 불러와서 렌더링
}

// new 제품생성폼 전송 라우트
module.exports.renderNewForm = (req, res) => {
    res.render('products/new')
}
// new 제품 생성 제출 라우트
module.exports.createProduct = async (req, res) => {
    const user = await User.findById(req.user.id);
    const product = new Product(req.body.product);
    product.images = req.files.map(f => ({ url: f.path, filename: f.filename }))
    product.author = req.user._id;
    user.products.push(product)
    await product.save();
    await user.save();
    req.flash('success', 'Successfully made a new product!');
    res.redirect(`/products/${product._id}`)
}

// show 제품 상세 전송 라우트
module.exports.showProduct = async (req, res) => {
    const product = await Product.findById(req.params.id).populate({ //중첩 채우기 
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if (!product) {
        req.flash('error', 'Cannot find that product!');
        return res.redirect('/products')
    }
    res.render('products/show', { product }) //product 불러와서 렌더링
}
// like 제품 좋아요 전송 라우트
module.exports.likeProduct = async (req, res) => {
    const product = await Product.findById(req.params.id)
    const user = await User.findById(req.user._id)
    // const like = await Like.findById(req.body.like);
    const productId = product.id // 제품 아이디
    const productAuthorId = product.author.toString() //제품 작성자 아이디
    const userId = user._id.toString() //로그인한 아이디
    if (productAuthorId == userId) {
        product.like = product.like += 1;
        await product.save();
        console.log(product.like)
    } else {
        product.like = product.like -= 1;
        await product.save();
        console.log(product.like)
    }
    res.redirect(`/products/${product._id}`)
}

// edit 제품수정폼 전송 라우트
module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
        req.flash('error', 'Cannot find that product!');
        return res.redirect('/products');
    }
    res.render('products/edit', { product })
}

// edit 제품 수정 제출라우트
module.exports.editProduct = async (req, res) => {
    const { id } = req.params;
    const product = await Product.findByIdAndUpdate(id, { ...req.body.product });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    product.images.push(...imgs);
    await product.save();
    // 이미지를 DB와 Cloudinary에서 삭제하는 함수
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await product.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash('success', 'Successfully updated product!')
    res.redirect(`/products/${product._id}`)
}

// 제품 삭제 라우트
module.exports.deleteProduct = async (req, res) => {
    const { id } = req.params;
    await User.findByIdAndUpdate(req.user.id, { $pull: { products: id } })
    await Product.findByIdAndDelete(id)
    req.flash('success', 'Successfully deleted product!')
    res.redirect('/products');
}