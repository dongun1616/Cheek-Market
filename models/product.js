const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductSchema = new Schema({ //메인제품 스키마
    title: String,
    image: String,
    price: Number,
    description: String,
    location: String
});

module.exports = mongoose.model('product', ProductSchema)