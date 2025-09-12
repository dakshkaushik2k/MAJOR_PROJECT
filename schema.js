const Joi = require('joi');


const listingSchema = Joi.object({
  listing: Joi.object({
    title: Joi.string().required(),

    description: Joi.string().required(),

    image: Joi.string().allow("", null),

    price: Joi.number().required().min(0),

    location: Joi.string().required(),

    country: Joi.string().required(),

    roomType: Joi.string().valid("independent", "sharing").required(),

    roommateHobby: Joi.string().when("roomType", {
      is: "sharing",
      then: Joi.string().required(),
      otherwise: Joi.string().allow(""),
    }),

    roommateOccupation: Joi.string().when("roomType", {
      is: "sharing",
      then: Joi.string().required(),
      otherwise: Joi.string().allow(""),
    }),

    roommateAge: Joi.alternatives().conditional("roomType", {
      is: "sharing",
      then: Joi.number().min(0).required(),
      otherwise: Joi.number().allow(null, ""),
    }),
  }).required(),
});

module.exports = { listingSchema };

const reviewSchema = Joi.object({
  review: Joi.object({
    comment: Joi.string().required(),
    rating: Joi.number().required().min(1).max(5),
  }).required(),
}).required();

module.exports.reviewSchema = reviewSchema;
