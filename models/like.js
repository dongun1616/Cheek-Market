const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LikeSchema = new Schema({
    userFrom: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    productId: {
        type: Schema.Types.ObjectId,
        ref: 'Product'
    }
});

module.exports = mongoose.model('Like', LikeSchema);