const Joi = require('joi');

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