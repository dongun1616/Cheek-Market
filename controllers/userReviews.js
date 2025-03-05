const Review = require('../models/review')
const User = require('../models/user')

// 사용자에 리뷰작성하는 라우트
module.exports.createUserReview = async (req, res) => {
    const user = await User.findById(req.params.id);
    const review = new Review({
        ...req.body.review,
        author: req.user._id,  // 작성자 추가
        user_id: user._id      // 사용자 리뷰이므로 user_id 추가
    });

    review.author = req.user._id;
    user.reviews.push(review);
    await review.save();
    await user.save();
    req.flash('success', 'Created new review!')
    res.redirect(`/users/${user._id}`);
}
// 사용자에 리뷰를 삭제하는 라우트
module.exports.deleteUserReview = async (req, res) => {
    const { id, reviewId } = req.params;
    await User.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review!')
    res.redirect(`/users/${id}`);
}