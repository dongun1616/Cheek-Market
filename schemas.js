const Joi = require('joi');

//JOI 유효성 검사 스키마
module.exports.productSchema = Joi.object({
    product: Joi.object({
        title: Joi.string().required(),
        price: Joi.number().required().min(0),
        image: Joi.string().required(),
        location: Joi.string().required(),
        description: Joi.string().required(),
    }).required()
})

module.exports.userSchema = Joi.object({
    user: Joi.object({
        email: Joi.string().required(),
        location: Joi.string().required(),
        introduce: Joi.string().required(),
        nickname: Joi.string().required(),
    }).required()
})

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        body: Joi.string().required(),
        image: Joi.string(),
    }).required()
})
