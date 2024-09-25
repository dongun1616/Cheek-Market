const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
    url: String,
    filename: String
})
// 이미지 편집 폼에서 썸네일 크기 200으로 제한
ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200')
})

const ProductSchema = new Schema({ //메인제품 스키마
    title: String,
    images: [ImageSchema],
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ],
    like: {
        type: Number,
        default: 0,
    }
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