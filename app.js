const express=require("express");
const MongoStore = require('connect-mongo');
const session=require("express-session");
const flash=require("connect-flash");


const app=express();

const mongoose=require("mongoose");
const wrapAsync=require("./utils/wrapAsync.js");  // Requiring wrapAsync function
const ExpressErrors=require("./utils/expressErrors.js"); // Requiring ExpressError class for Handling errors(Custome made)

//Require the routExpress router to bloatedness of primary app.js
const listings=require("./routes/listing.js");
//Require the routExpress router to bloatedness of primary app.js
const reviews=require("./routes/review.js");


// Using Ejs-mate
const ejsMate=require("ejs-mate");    
app.engine("ejs",ejsMate);

//for using method-override
const methodOverride=require("method-override");
app.use(methodOverride("_method"));

//setting up EJS   creating views folder
const path=require("path");
app.set("view engine","ejs");
app.set("views", path.join(__dirname,"views"));

// accesing req.params
app.use(express.urlencoded({extended:true}));

//using static files (in public folder)
app.use(express.static(path.join(__dirname,"/public")));


main()
.then(()=>{console.log("Connected successfully");})
.catch(err => console.log(err));



async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");

}

const sessionOptions={
  secret:"mySuperSecretCode",
  resave:false,
  saveUninitialized:true,
  cookie:{
    expires: Date.now() + 7*26*60*60*1000, // these are milisecons for 1 week
    maxAge:7*26*60*60*1000,
    httpOnly:true,
  },
};

app.get("/",(req,res)=>{
  res.send("I am root")
})

app.use(session(sessionOptions));
app.use(flash());

app.use((req,res,next)=>{
  res.locals.success=req.flash("success");
  res.locals.error=req.flash("error");
  next();
});






app.use("/listings",listings);
app.use("/listings/:id/reviews",reviews);


// Standard response for routes which not existed/ Not created yet
app.all("*",(req,res,next)=>{
  next(new ExpressErrors(404,"Page Not Found"));
});

app.use((err,req,res,next)=>{
  let {statusCode = 500, message = "Something went wrong!"}=err;   // Deconstructing The error getting the message and status code
  res.status(statusCode).render("error.ejs",{err});
  // res.status(statusCode).send(message);
});

const port = process.env.PORT || 8080;

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});