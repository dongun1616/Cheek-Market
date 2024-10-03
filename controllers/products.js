const Product = require('../models/product'); //스키마 가져오기
const User = require('../models/user')
const { cloudinary } = require('../cloudinary');

// index 전송 라우트
module.exports.index = async (req, res) => {
    const products = await Product.find({}).sort({ _id: -1 }).populate('author');
    res.render('products/index', { products }) //products 불러와서 렌더링
}

// 제품 검색 라우트
module.exports.search = async (req, res) => {
    const keyword = req.query.inputText; // 쿼리 스트링에서 'keyword' 파라미터 읽기
    const titles = await Product.find({ title: { $regex: keyword, $options: 'i' } }).sort({ _id: -1 }).populate('author')
    const locations = await Product.find({ location: { $regex: keyword, $options: 'i' } }).sort({ _id: -1 }).populate('author')
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
    const userId = req.user ? req.user._id.toString() : null; // req.user가 있으면 변환 없으면 null
    if (!product) {
        req.flash('error', 'Cannot find that product!');
        return res.redirect('/products')
    }
    res.render('products/show', { product, userId }) //product, userId 불러와서 렌더링
}
// like 제품 좋아요 전송 라우트
module.exports.likeProduct = async (req, res) => {
    const productId = req.params.id;
    const userId = req.user._id.toString(); // 인증된 사용자 ID
    // 제품 검색
    const product = await Product.findById(productId);

    if (!product) {
        req.flash('error', 'Product not found'); // 플래시 메시지 설정
        return res.redirect(`/products/${productId}`); // 리다이렉트
    }

    // 좋아요 추가
    if (!product.likes.includes(userId)) { //제품 모델 like안에 userId가 포함되어 있지 않으면
        product.likes.push(userId);
        await product.save();
        req.flash('success', 'You liked this product!'); // 플래시 메시지 설정
        return res.redirect(`/products/${productId}`); // 리다이렉트
    }
    req.flash('error', 'You already liked this product!'); // 플래시 메시지 설정
    return res.redirect(`/products/${productId}`); // 리다이렉트
}
// like 제품 좋아요 삭제 라우트
module.exports.likeDelete = async (req, res) => {
    const productId = req.params.id;
    const userId = req.user._id.toString(); // 인증된 사용자 ID

    // 제품 검색
    const product = await Product.findById(productId);

    // 제품이 없는 경우
    if (!product) {
        req.flash('error', 'Product not found'); // 플래시 메시지 설정
        return res.redirect(`/products/${productId}`); // 리다이렉트
    }

    // 좋아요 취소
    if (product.likes.includes(userId)) {
        //현재 사용자의 ID가 포함되어 있는지 확인하고, 일치하지 않는 항목만 남깁니다.(삭제)
        product.likes = product.likes.filter(id => id.toString() !== userId.toString());
        await product.save();
        req.flash('success', 'You unliked this product!'); // 성공 메시지 설정
        return res.redirect(`/products/${productId}`); // 리다이렉트
    }
    req.flash('error', 'You have not liked this product yet!'); // 플래시 메시지 설정
    return res.redirect(`/products/${productId}`); // 리다이렉트
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