const Review=require("../models/review");
const Listing=require("../models/listing");

module.exports.createReview=async(req,res)=>{
    let {id}=req.params;
  //   console.log(id); used for testing while merging parent route and child route
    let listing=await Listing.findById(id);
    let newReview=new Review(req.body.review);
    newReview.author=req.user._id;    // Here req.user this the logged in  user
    console.log(newReview);

    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    console.log("New review saved");

    req.flash("success","New Review Added!");
    res.redirect(`/listings/${id}`);
};

module.exports.deleteReview=async(req,res)=>{
    let {id ,reviewId}=req.params;
  
    await Listing.findByIdAndUpdate(id,{$pull:{reviews:reviewId}});
    await Review.findByIdAndDelete(reviewId);
  
    req.flash("success","Review Deleted!");
    res.redirect(`/listings/${id}`);
};