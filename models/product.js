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
    likes: [{
        type: Schema.Types.ObjectId, //배열안에 문자열로 추가
        ref: 'User'
    }]

});


//제품 삭제시 리뷰를 같이 삭제시키는 미들웨어
// ProductSchema.post('findOneAndDelete', async function (doc) {
//     if (doc) {
//         await Review.deleteMany({
//             _id: {
//                 $in: doc.reviews
//             }
//         })
//     }
// })
// 제품 삭제 시 관련된 리뷰를 삭제하는 미들웨어
ProductSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({ product_id: doc._id }); // ✅ product_id로 해당 제품과 관련된 리뷰 삭제
    }
});


module.exports = mongoose.model('Product', ProductSchema)