const express=require("express");
const router=express.Router({mergeParams: true});

const wrapAsync=require("../utils/wrapAsync.js");  // Requiring wrapAsync function
const {reviewSchema}=require("../schema.js"); //{Joi} Requiring listing Schema for Validation for schema
const ExpressErrors=require("../utils/expressErrors.js"); // Requiring ExpressError class for Handling errors(Custome made)
const Review=require("../models/review.js");  // Accessing the review models
const Listing=require("../models/listing.js");  // Accessing the Listing models



//Validate review  we will pass this ass a middle ware 
const validateReview= (req,res,next)=>{
  let {error}=reviewSchema.validate(req.body);

  if(error){
    const errorMessage = error.details.map(el => el.message).join(",");
    throw new ExpressErrors(400,errorMessage);
  }else{
    next();
  }
};



//Reviews
//post review route
router.post("/",validateReview,wrapAsync(async(req,res)=>{
  let {id}=req.params;
//   console.log(id); used for testing while merging parent route and child route
  let listing=await Listing.findById(id);
  let newReview=new Review(req.body.review);

  listing.reviews.push(newReview);

  await newReview.save();
  await listing.save();

  console.log("New review saved");
  res.redirect(`/listings/${id}`);
}));

//Delete review route
router.delete("/:reviewId",wrapAsync(async(req,res)=>{
  let {id ,reviewId}=req.params;

  await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
  await Review.findByIdAndDelete(reviewId);

  res.redirect(`/listings/${id}`);
}));

module.exports=router;