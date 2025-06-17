const Listing=require("../models/listing");

module.exports.index=async (req,res)=>{
    let allListings=await Listing.find({});
    res.render("listings/index.ejs",{allListings});
};

module.exports.renderNewForm=async (req,res)=>{
    res.render("listings/new.ejs");
}

module.exports.showListing=async (req,res)=>{
    let {id}=req.params;
    const listing=await Listing.findById(id)
       .populate({
        path:"reviews",
        populate:{path:"author"},
      })
      .populate("owner");
    if(!listing){
      req.flash("error","Listing does not exist!");
      res.redirect("/listings");
    }
    
    console.log(listing);
    res.render("listings/show.ejs",{listing});
  };

module.exports.createListing=async (req,res,next)=>{  
    const url=req.file.path;
    const filename=req.file.filename;
    console.log(url,"..",filename);
    const newlisting=new Listing(req.body.listing);
    newlisting.owner=req.user._id;
    newlisting.image={url,filename};
    await newlisting.save();
    req.flash("success","New Listing Created!");
    res.redirect("/listings");
}

module.exports.editRenderForm = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);

  if (!listing) {
      req.flash("error", "Listing does not exist!");
      return res.redirect("/listings");  // Added return
  }

  let originalImageUrl = listing.image.url;
  console.log("Transformed Image URL:", originalImageUrl);

  originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");

  res.render("listings/edit.ejs", { listing, originalImageUrl });
};



// this will get the searches result in var listing 
module.exports.search = async (req, res) => {
  const { search } = req.query;
  let listings;

  if (search) {
    listings = await Listing.find({
      title: { $regex: search, $options: 'i' } 
    });
  } else {
    listings = await Listing.find({});
  } 
  console.log(listings );
  res.render('listings/index', { listings });
};





module.exports.updateListing=async (req,res)=>{
  let {id}=req.params;
  let listing=await Listing.findByIdAndUpdate(id,{...req.body.listing});

  if(typeof req.file!=undefined){
    const url=req.file.path;
    const filename=req.file.filename;

    listing.image={url,filename};
    await listing.save();
  }
  req.flash("success","Listing Updated!");
  res.redirect(`/listings/${id}`);
}



module.exports.destroyListing=async (req,res)=>{
    let {id}=req.params;
    await Listing.findByIdAndDelete(id);  //when this called as a midddleware in listing.js middleware will also be called
    req.flash("success","Listing Deleted!");
    res.redirect("/listings");
};