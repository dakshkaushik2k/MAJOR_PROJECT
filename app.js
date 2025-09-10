if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();

const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");

const User = require("./models/user.js");
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

// ------------------------ ROUTES IMPORT ------------------------
const listingRoutes = require("./routes/listing");
const reviewsController = require("./controllers/review.js");
const userController = require("./controllers/user.js");

// ------------------------ DB CONNECTION ------------------------
const mongoURL = process.env.ATLASDB_URL || "mongodb://127.0.0.1:27017/wanderlust";
mongoose.connect(mongoURL)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => console.log(err));

// ------------------------ SESSION STORE ------------------------
const store = MongoStore.create({
  mongoUrl: mongoURL,
  crypto: { secret: process.env.SECRET },
  touchAfter: 24 * 3600,
});

store.on("error", err => console.log("Mongo Session Store Error:", err));

const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 7*24*60*60*1000,
    maxAge: 7*24*60*60*1000
  }
};

// ------------------------ APP CONFIG ------------------------
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));
app.use(session(sessionOptions));
app.use(flash());

// ------------------------ PASSPORT CONFIG ------------------------
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ------------------------ GLOBAL LOCALS MIDDLEWARE ------------------------
app.use((req, res, next) => {
  res.locals.currentUser = req.user || null; // ✅ always defined
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

// ------------------------ ROUTES ------------------------
app.get("/", (req, res) => res.redirect("/listings"));
app.use("/listings", listingRoutes);

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

app.route("/signup")
  .get(userController.renderSignUpPage)
  .post(wrapAsync(userController.signUp));

app.route("/login")
  .get(userController.renderLoginPage)
  .post(
    saveRedirectUrl,
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: true
    }),
    userController.login
  );

app.get("/logout", userController.logout);

// ------------------------ ERROR HANDLING ------------------------
app.all("*", (req, res, next) => {
  next(new ExpressErrors(404, "Page Not Found"));
});

app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong!" } = err;
  res.status(statusCode).render("error.ejs", { err });
});

// ------------------------ SERVER START ------------------------
const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`🚀 Server listening on port ${port}`));
