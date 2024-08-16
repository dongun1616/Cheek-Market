const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
    body: String,
    image: String
})

module.exports = mongoose.model('Review', reviewSchema);