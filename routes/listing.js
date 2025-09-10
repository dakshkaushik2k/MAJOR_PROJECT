const express = require("express");
const router = express.Router();
const listingsController = require("../controllers/listing");
const { isLoggedIn, isOwner, validateListing } = require("../middleware");
const wrapAsync = require("../utils/wrapAsync");

// ------------------------ LISTINGS ROUTES ------------------------

// Show all listings
router.get("/", wrapAsync(listingsController.index));

// Show form to create new listing (protected)
router.get("/new", isLoggedIn, wrapAsync(listingsController.renderNewForm));

// Create a new listing (protected + validation)
router.post("/", isLoggedIn, validateListing, wrapAsync(listingsController.createListing));

// Show a specific listing
router.get("/:id", wrapAsync(listingsController.showListing));

// Show edit form for a listing (protected + must be owner)
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingsController.editRenderForm));

// Update a listing (protected + must be owner + validation)
router.put("/:id", isLoggedIn, isOwner, validateListing, wrapAsync(listingsController.updateListing));

// Delete a listing (protected + must be owner)
router.delete("/:id", isLoggedIn, isOwner, wrapAsync(listingsController.destroyListing));

module.exports = router;
