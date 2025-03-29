const Listing = require("../models/listing");  // ✅ Import the Listing model
const express=require("express");
const router = express.Router();

const wrapAsync=require("../utils/wrapAsync.js");  // Requiring wrapAsync function
const {listingSchema}=require("../schema.js"); //{Joi} Requiring listing Schema for Validation for schema
const {isLoggedIn, isOwner ,validateListing}=require("../middleware.js");

const listingsController=require("../controllers/listing.js");

//Router of router  to merge routes with same routes with different request
router
  .route("/")
  .get(wrapAsync(listingsController.index))
  .post(
    isLoggedIn,
    validateListing,
    wrapAsync(listingsController.createListing)
  );


//Index route
// router.get("/",wrapAsync(listingsController.index));

//New route
router.get("/new",isLoggedIn,listingsController.renderNewForm);


//show route
router.get("/:id",wrapAsync(listingsController.showListing));


//create route
// router.post(
  // "/",
  // isLoggedIn,
  // validateListing,
  // wrapAsync(listingsController.createListing));

// Edit Route
router.get("/:id/edit",isLoggedIn,isOwner,wrapAsync(listingsController.editRenderForm));

//update route
router.put(
   "/:id",
   isLoggedIn,
   isOwner,
    validateListing,
    wrapAsync(listingsController.updateListing));

//DELETE ROUTE

router.delete("/:id",isLoggedIn,isOwner,wrapAsync(listingsController.destroyListing));

module.exports=router;