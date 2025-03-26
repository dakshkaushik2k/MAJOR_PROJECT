const Joi = require('joi');
const { Schema } = require('mongoose');
// Schema for Listing validation
const listingSchema=Joi.object({   //Joi.object means we have a object inside Joi
    // listing : Joi.object().required(),  // listing Joi ke according object honi chye or required honi chye
    listing: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        image : Joi.string().allow("",null),
        price : Joi.number().required().min(0),
        location : Joi.string().required(),
        country: Joi.string().required()
    }).required()
});

module.exports={listingSchema};

//Schema for review Validation

module.exports.reviewSchema=Joi.object({
    review:Joi.object({
        comment:Joi.string().required(),
        rating:Joi.number().required().min(1).max(5),
    }).required(),
    

}).required();