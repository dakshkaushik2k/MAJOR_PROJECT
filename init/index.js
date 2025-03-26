const mongoose=require("mongoose");
const initData=require("./data.js");  // requiring the data from lisitngs.js
const Listing=require("../models/listing.js");

const mongoURL="mongodb://127.0.0.1:27017/wanderlust";

main()
.then(()=>{console.log("Connected successfully");})
.catch(err => console.log(err));

async function main() {
  await mongoose.connect(mongoURL);

}

const initDB=async ()=>{
    await Listing.deleteMany({});
    await Listing.insertMany(initData.data);

    console.log("Data was initialized");

}

initDB();