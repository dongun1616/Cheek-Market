const mongoose = require('mongoose');
const Review = require('./review')
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

//제품 삭제시 리뷰를 같이 삭제시키는 미들웨어
ProductSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

module.exports = mongoose.model('product', ProductSchema)