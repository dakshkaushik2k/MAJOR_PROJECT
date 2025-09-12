const express = require("express");
const router = express.Router();
const listingsController = require("../controllers/listing");
const { isLoggedIn, isOwner, validateListing } = require("../middleware");
const wrapAsync = require("../utils/wrapAsync");

router.get("/", wrapAsync(listingsController.index));

router.get("/new", isLoggedIn, wrapAsync(listingsController.renderNewForm));

router.post("/", isLoggedIn, validateListing, wrapAsync(listingsController.createListing));

router.get("/:id", wrapAsync(listingsController.showListing));

router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingsController.editRenderForm));

router.put("/:id", isLoggedIn, isOwner, validateListing, wrapAsync(listingsController.updateListing));

router.delete("/:id", isLoggedIn, isOwner, wrapAsync(listingsController.destroyListing));

module.exports = router;
