const express=require("express");
const router=express.Router({mergeParams: true});

const wrapAsync=require("../utils/wrapAsync.js");  // Requiring wrapAsync function
const {reviewSchema}=require("../schema.js"); //{Joi} Requiring listing Schema for Validation for schema
const ExpressErrors=require("../utils/expressErrors.js"); // Requiring ExpressError class for Handling errors(Custome made)
const Review=require("../models/review.js");  // Accessing the review models
const Listing=require("../models/listing.js");  // Accessing the Listing models
const { isLoggedIn, isReviewAuthor,validateReview} = require("../middleware.js");

const reviewsController=require("../controllers/review.js");



//Reviews
//post review route
router.post("/",
  isLoggedIn,
  validateReview,
  wrapAsync(reviewsController.createReview));

//Delete review route
router.delete("/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  wrapAsync(reviewsController.deleteReview));

module.exports=router;