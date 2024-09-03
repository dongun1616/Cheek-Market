const Product = require('../models/product'); //스키마 가져오기
const Review = require('../models/review')

// 제품에 리뷰작성하는 라우트
module.exports.createReview = async (req, res) => {
    const product = await Product.findById(req.params.id)
    const review = new Review(req.body.review);
    review.author = req.user._id;
    product.reviews.push(review);
    await review.save();
    await product.save();
    req.flash('success', 'Created new review!')
    res.redirect(`/products/${product._id}`);
}

// 제품에 리뷰를 삭제하는 라우트
module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    await Product.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review!')
    res.redirect(`/products/${id}`);
}