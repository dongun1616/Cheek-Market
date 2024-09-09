const Product = require('../models/product'); //스키마 가져오기
const User = require('../models/user')

// index 전송 라우트
module.exports.index = async (req, res) => {
    const products = await Product.find({}).populate('author');
    res.render('products/index', { products }) //products 불러와서 렌더링
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
    const product = await Product.findByIdAndUpdate(id, { ...req.body.product })
    req.flash('success', 'Successfully updated product!')
    res.redirect(`/products/${product._id}`)
}

// 제품 삭제 라우트
module.exports.deleteProduct = async (req, res) => {
    const { id } = req.params;
    console.log(id, req.user.id)
    await User.findByIdAndUpdate(req.user.id, { $pull: { products: id } })
    await Product.findByIdAndDelete(id)
    req.flash('success', 'Successfully deleted product!')
    res.redirect('/products');
}