const ExpressErrors=require("./utils/expressErrors.js"); // Requiring ExpressError class for Handling errors(Custome made)
const Listing=require("./models/listing.js");  // Accessing the Listing models
const {listingSchema,reviewSchema}=require("./schema.js"); //{Joi} Requiring listing Schema for Validation for schema
const Review = require("./models/review.js");

module.exports.isLoggedIn=(req,res,next)=>{
    console.log(req.user);
    if(!req.isAuthenticated()){  //User must logged in For creating new Lisitngs
        req.session.redirectUrl=req.originalUrl;
        req.flash("error","You must be logged in first");
        return res.redirect("/login");
    }
    next();
}

module.exports.saveRedirectUrl=(req,res,next)=>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl=req.session.redirectUrl;
    }
    next();
};

module.exports.isOwner=async (req,res,next)=>{
    let { id } = req.params;
    let listing = await Listing.findById(id);
    // Ensure `res.locals.currUser` is properly set
    if (!listing.owner.equals(req.user._id)) {
      req.flash("error", "You are not the owner of this listing");
      return res.redirect(`/listings/${id}`);
    }
    next();
}

module.exports.validateListing= (req,res,next)=>{
  let {error}=listingSchema.validate(req.body);

  if(error){
    const errorMessage = error.details.map(el => el.message).join(",");
    throw new ExpressErrors(400,errorMessage);
  }else{
    next();
  }
};

//Validate review  we will pass this ass a middle ware 
module.exports.validateReview= (req,res,next)=>{
  let {error}=reviewSchema.validate(req.body);

  if(error){
    const errorMessage = error.details.map(el => el.message).join(",");
    throw new ExpressErrors(400,errorMessage);
  }else{
    next();
  }
};

module.exports.isReviewAuthor=async (req,res,next)=>{
  let { id,reviewId } = req.params;
  let review = await Review.findById(reviewId);
  // Ensure `res.locals.currUser` is properly set
  if (!review.author.equals(res.locals.currentUser._id)) {
    req.flash("error", "You are not the author of this review");
    return res.redirect(`/listings/${id}`);
  }
  next();
}
