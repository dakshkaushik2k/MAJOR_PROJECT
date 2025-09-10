const express = require("express");
const router = express.Router();
const listingController = require("../controllers/listing");
const multer = require("multer");
const { storage } = require("../cloudConfig");  // ✅ Cloudinary storage
const upload = multer({ storage });             // ✅ use cloud storage

// List all listings
router.get("/", listingController.index);

// Search listings
router.get("/search", listingController.search);

// Render new listing form
router.get("/new", listingController.renderNewForm);

// Create new listing
router.post("/", upload.single("image"), listingController.createListing);

// Show single listing
router.get("/:id", listingController.showListing);

// Render edit form
router.get("/:id/edit", listingController.editRenderForm);

// Update listing
router.put("/:id", upload.single("image"), listingController.updateListing);

// Delete listing
router.delete("/:id", listingController.destroyListing);

module.exports = router;
