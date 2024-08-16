const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductSchema = new Schema({ //메인제품 스키마
    title: String,
    image: String,
    price: Number,
    description: String,
    location: String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
});
//스키마 안에 임시로 리뷰 넣어둠 ->나중에 사용자 모델에 옮길예정

module.exports = mongoose.model('product', ProductSchema)