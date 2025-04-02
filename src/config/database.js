const mongoose = require('mongoose');
const dbconnect = async () => { //mongoose.connect returns promise
    await mongoose.connect(process.env.MONGOURI)
    // if we write anything after connect url like /ConnectDev then it will create database and refer to it
};
module.exports = {
    dbconnect
}