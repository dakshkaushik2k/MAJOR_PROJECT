const express=require("express");
const app=express();

const mongoose=require("mongoose");
const Listing=require("./models/listing.js");  // Accessing the Listing models
const wrapAsync=require("./utils/wrapAsync.js");  // Requiring wrapAsync function
const ExpressErrors=require("./utils/expressErrors.js"); // Requiring ExpressError class for Handling errors(Custome made)
const {listingSchema}=require("./schema.js"); //{Joi} Requiring listing Schema for Validation for schema


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


const mongoURL="mongodb://127.0.0.1:27017/wanderlust";

main()
.then(()=>{console.log("Connected successfully");})
.catch(err => console.log(err));

async function main() {
  await mongoose.connect(mongoURL);

}

app.get("/",(req,res)=>{
    res.send("I am root")
})



//Index route
app.get("/listings",wrapAsync(async (req,res)=>{
   let allListings=await Listing.find({});
   res.render("listings/index.ejs",{allListings});
}));

//New route
app.get("/listings/new",(req,res)=>{
  res.render("listings/new.ejs");
});


//show route
app.get("/listings/:id",wrapAsync(async (req,res)=>{
  let {id}=req.params;
  const listing=await Listing.findById(id);
  
  res.render("listings/show.ejs",{listing});
}));



const validateListing= (req,res,next)=>{
  let {error}=listingSchema.validate(req.body);

  if(error){
    const errorMessage = error.details.map(el => el.message).join(",");
    throw new ExpressErrors(400,errorMessage);
  }else{
    next();
  }
};

//create route
app.post(
  "/listings",
  validateListing,
  wrapAsync(async (req,res,next)=>{    
    const newlisting=new Listing(req.body.listing);
    await newlisting.save();
    res.redirect("/listings");
}));

// Edit Route
app.get("/listings/:id/edit",wrapAsync(async (req,res)=>{
  let {id}=req.params;
  let listing=await Listing.findById(id);
  res.render("listings/edit.ejs",{listing});
}));

//update route
app.put(
  "/listings/:id",
    validateListing,
    wrapAsync(async (req,res)=>{
      let {id}=req.params;
      await Listing.findByIdAndUpdate(id,{...req.body.listing});
      res.redirect(`/listings/${id}`);
}));

//DELETE ROUTE

app.delete("/listings/:id",wrapAsync(async (req,res)=>{
  let {id}=req.params;
  await Listing.findByIdAndDelete(id);
  res.redirect("/listings");
}));

// app.get("/testlisting",async(req,res)=>{
//   let sampleListing=new Listing({
//     title:"New home",
//     description:"Sweet place",
//     price:1200,
//     location:"Delhi",
//     country:"India",
//   });

//   await sampleListing.save()
//   .then(()=>{ console.log("Saved succesfully");})
//   .catch((err)=>{ console.log(err)});

//   res.send("Saved succesfully");

// });

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