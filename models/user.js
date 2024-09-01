const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review');
const Product = require('./product');

const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    introduce: String,
    location: String,
    products: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Product'
        }
    ],
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
});
//로그인시 필요한 사용자 이름과 비번을 사용하게해주는 플러그인
UserSchema.plugin(passportLocalMongoose);

//사용자 삭제시 제품을 같이 삭제시키는 미들웨어
UserSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Product.deleteMany({
            _id: {
                $in: doc.products
            }
        })
    }
})
// //사용자 삭제시 리뷰을 같이 삭제시키는 미들웨어
UserSchema.post('findOneAndDelete', async function (doc) {
    console.log(doc)
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

module.exports = mongoose.model('User', UserSchema)