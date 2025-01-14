const mongoose = require('mongoose');
const dbconnect = async () => { //mongoose.connect returns promise
    await mongoose.connect("mongodb+srv://niteshpariharprojects:KERv7Qr6GCMaXkoK@connectdevelopers.ij0qf.mongodb.net/ConnectDev")
    // if we write anything after connect url like /ConnectDev then it will create database and refer to it
};
module.exports = {
    dbconnect
}