const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review');
const Product = require('./product');

const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
    nickname: {
        type: String,
        required: true,
        unique: true,
    },
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
    ],
});

//로그인시 필요한 사용자 이름과 비번을 사용하게해주는 플러그인
UserSchema.plugin(passportLocalMongoose);

// 사용자 삭제 시 관련된 제품을 삭제하는 미들웨어
UserSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        // 관련된 제품 삭제
        await Product.deleteMany({
            _id: {
                $in: doc.products
            }
        });
    }
});
UserSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({ user_id: doc._id }); // 해당 사용자가 작성한 모든 리뷰 삭제
    }
});

module.exports = mongoose.model('User', UserSchema)