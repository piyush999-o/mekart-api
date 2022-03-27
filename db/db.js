const mongoose = require('mongoose');


const ConnectToMongo = () => {

    const mongo_URI = "mongodb+srv://piyush-999:mekart999@mekart.hvwbt.mongodb.net/mekart";
    mongoose.connect(mongo_URI, () => {
        console.log("Connect to MongoDB")
    })
}

module.exports = ConnectToMongo;