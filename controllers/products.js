const Product = require('../models/product'); //스키마 가져오기
const Review = require('../models/review')
const User = require('../models/user')

module.exports.index = async (req, res) => {
    const products = await Product.find({}).populate('author');
    res.render('products/index', { products }) //products 불러와서 렌더링
}

module.exports.renderNewForm = (req, res) => {
    res.render('products/new')
}

module.exports.createProduct = async (req, res) => {
    const user = await User.findById(req.user.id);
    const product = new Product(req.body.product);
    user.products.push(product)
    product.author = req.user._id;
    await product.save();
    await user.save();
    req.flash('success', 'Successfully made a new product!');
    res.redirect(`/products/${product._id}`)
}

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

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
        req.flash('error', 'Cannot find that product!');
        return res.redirect('/products');
    }
    res.render('products/edit', { product })
}

module.exports.editProduct = async (req, res) => {
    const { id } = req.params;
    const product = await Product.findByIdAndUpdate(id, { ...req.body.product })
    req.flash('success', 'Successfully updated product!')
    res.redirect(`/products/${product._id}`)
}

module.exports.deleteProduct = async (req, res) => {
    const { id } = req.params;
    console.log(id, req.user.id)
    await User.findByIdAndUpdate(req.user.id, { $pull: { products: id } })
    await Product.findByIdAndDelete(id)
    req.flash('success', 'Successfully deleted product!')
    res.redirect('/products');
}