const express=require("express");
const router = express.Router();

const wrapAsync=require("../utils/wrapAsync.js");  // Requiring wrapAsync function
const {listingSchema}=require("../schema.js"); //{Joi} Requiring listing Schema for Validation for schema
const ExpressErrors=require("../utils/expressErrors.js"); // Requiring ExpressError class for Handling errors(Custome made)
const Listing=require("../models/listing.js");  // Accessing the Listing models



const validateListing= (req,res,next)=>{
  let {error}=listingSchema.validate(req.body);

  if(error){
    const errorMessage = error.details.map(el => el.message).join(",");
    throw new ExpressErrors(400,errorMessage);
  }else{
    next();
  }
};


//Index route
router.get("/",wrapAsync(async (req,res)=>{
   let allListings=await Listing.find({});
   res.render("listings/index.ejs",{allListings});
}));

//New route
router.get("/new",(req,res)=>{
  res.render("listings/new.ejs");
});


//show route
router.get("/:id",wrapAsync(async (req,res)=>{
  let {id}=req.params;
  const listing=await Listing.findById(id).populate("reviews");
  if(!listing){
    req.flash("error","Listing does not exist!");
    res.redirect("/listings");
  }
  
  res.render("listings/show.ejs",{listing});
}));


//create route
router.post(
  "/",
  validateListing,
  wrapAsync(async (req,res,next)=>{    
    const newlisting=new Listing(req.body.listing);
    await newlisting.save();
    req.flash("success","New Listing Created!");
    res.redirect("/listings");
}));

// Edit Route
router.get("/:id/edit",wrapAsync(async (req,res)=>{
  let {id}=req.params;
  let listing=await Listing.findById(id);
  if(!listing){
    req.flash("error","Listing does not exist!");
    res.redirect("/listings");
  }
  res.render("listings/edit.ejs",{listing});
}));

//update route
router.put(
   "/:id",
    validateListing,
    wrapAsync(async (req,res)=>{
      let {id}=req.params;
      await Listing.findByIdAndUpdate(id,{...req.body.listing});
      req.flash("success","Listing Updated!");
      res.redirect(`/listings/${id}`);
}));

//DELETE ROUTE

router.delete("/:id",wrapAsync(async (req,res)=>{
  let {id}=req.params;
  await Listing.findByIdAndDelete(id);  //when this called as a midddleware in listing.js middleware will also be called
  req.flash("success","Listing Deleted!");
  res.redirect("/listings");
}));

module.exports=router;