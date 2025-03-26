const express=require("express");
const MongoStore = require('connect-mongo');


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


const dbURL="mongodb+srv://dakshkaushik2k:CSAI22139@cluster0.jsth8mx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

main()
.then(()=>{console.log("Connected successfully");})
.catch(err => console.log(err));

const store=MongoStore.create({
  mongoUrl:dbURL,
  crypto:{
    secret:"mySuperSecretCode",
  },
  touchAfter: 24*3600,
})

store.on("error",()=>{
  cosole.log("Error in mongo Session store",err);
})

async function main() {
  await mongoose.connect(dbURL);

}

app.get("/",(req,res)=>{
    res.send("I am root")
})



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

app.listen(8080,()=>{
    console.log("Listening on port 8080");
});