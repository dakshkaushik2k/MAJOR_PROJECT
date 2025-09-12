const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review=require("./review.js");
const { urlencoded } = require("express");

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  image: {
    url:String  ,
    filename:String,
  },
  price:{
    type: Number,
    required: true,
  },

  location: String,
  country: String,
  roomType: {
    type: String,
    enum: ["independent", "sharing"], 
    required: true,
  },
  
  roommateHobby: String,
  roommateOccupation: String,
  roommateAge: Number,

  reviews:[
    {
      type:Schema.Types.ObjectId,
      ref:"Review",
    },
  ],
  owner:{
    type:Schema.Types.ObjectId,
    ref:"User",
  }
  
});

listingSchema.post("findOneAndDelete",async (listing)=>{  // (listing) here listing is that one which is about to delete and we can perform any action on it
  if(listing){
    await Review.deleteMany({_id:{$in:listing.reviews}});
  }
});


//model of schema
const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;