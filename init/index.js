const mongoose=require("mongoose");
const initData=require("./data.js");  // requiring the data from lisitngs.js
const Listing=require("../models/listing.js");
// import dotenv from "dotenv";
// dotenv.config();
const mongoURL="mongodb://127.0.0.1:27017/wanderlust";
// mongoURL=process.env.ATLASDB_URL;
main()
.then(()=>{console.log("Connected successfully");})
.catch(err => console.log(err));

async function main() {
  await mongoose.connect(mongoURL);

}

const initDB=async ()=>{
    await Listing.deleteMany({});
    initData.data=initData.data.map((obj)=>({...obj,owner:"68060838b6324ced3ac399d3"}));
    await Listing.insertMany(initData.data);
    console.log("Data was initialized");
}

initDB();