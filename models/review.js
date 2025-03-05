const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReviewSchema = new Schema({
    body: String,
    rating: Number,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    product_id: {  // 제품 리뷰일 경우
        type: Schema.Types.ObjectId,
        ref: 'Product',
        default: null // 기본값을 null로 설정
    },
    user_id: {  // 사용자 리뷰일 경우
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null
    }
});

module.exports = mongoose.model('Review', ReviewSchema);