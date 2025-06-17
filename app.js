if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}

console.log(process.env.SECRET);

const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const app = express();

const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");

const Listing = require("./models/listing");
const Review = require("./models/review");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressErrors = require("./utils/expressErrors.js");
const { listingSchema, reviewSchema } = require("./schema.js");
const {
  isLoggedIn,
  isOwner,
  isReviewAuthor,
  validateListing,
  validateReview,
  saveRedirectUrl,
} = require("./middleware.js");

const listingsController = require("./controllers/listing.js");
const reviewsController = require("./controllers/review.js");
const userController = require("./controllers/user.js");

const ejsMate = require("ejs-mate");
app.engine("ejs", ejsMate);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));

const multer = require("multer");
const { storage } = require("./cloudConfig.js");
const upload = multer({ storage });

const dbURL = process.env.ATLASDB_URL;
const mongoURL= "mongodb://127.0.0.1:27017/wanderlust";


main()
  .then(() => {
    console.log("Connected successfully");
  })
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect(dbURL);
}

const store = MongoStore.create({
  mongoUrl: dbURL,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600,
});

store.on("error", () => {
  console.log("Error in Mongo Session Store", err);
});

const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  req.setTimeout(60000);
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

// ------------------------ LISTING ROUTES ------------------------

app
  .route("/listings")
  .get(wrapAsync(listingsController.index))
  .post(
    isLoggedIn,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingsController.createListing)
  );

app.get("/listings/new", isLoggedIn, listingsController.renderNewForm);
app.get("/listings/search", wrapAsync(listingsController.search));

app
  .route("/listings/:id")
  .get(wrapAsync(listingsController.showListing))
  .put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(listingsController.updateListing)
  )
  .delete(isLoggedIn, isOwner, wrapAsync(listingsController.destroyListing));

app.get(
  "/listings/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingsController.editRenderForm)
);

// ------------------------ REVIEW ROUTES ------------------------

app.post(
  "/listings/:id/reviews",
  isLoggedIn,
  validateReview,
  wrapAsync(reviewsController.createReview)
);

app.delete(
  "/listings/:id/reviews/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  wrapAsync(reviewsController.deleteReview)
);

// ------------------------ USER ROUTES ------------------------

app
  .route("/signup")
  .get(userController.renderSignUpPage)
  .post(wrapAsync(userController.signUp));

app
  .route("/login")
  .get(userController.renderLoginPage)
  .post(
    saveRedirectUrl,
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: true,
    }),
    userController.login
  );

app.get("/logout", userController.logout);

// ------------------------ ERROR HANDLING ------------------------

app.all("*", (req, res, next) => {
  next(new ExpressErrors(404, "Page Not Found"));
});

app.use((err, req, res, next) => {
  let { statusCode = 500, message = "Something went wrong!" } = err;
  res.status(statusCode).render("error.ejs", { err });
});

// ------------------------ SERVER START ------------------------

const port = process.env.PORT || 8080;
app.listen(8080, () => {
  console.log(`Listening on port ${8080}`);
});
