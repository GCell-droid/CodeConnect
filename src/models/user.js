// for user schema
const mongoose = require('mongoose');
const userSchema = mongoose.Schema({
    firstName: {
        type: String
    },
    lastName: {
        type: String
    },
    gender: {
        type: String
    },
    emailId: {
        type: String
    }
})
// const UserModel = mongoose.model("User", userSchema)
// model name always starts with capital letter
module.exports = mongoose.model("User", userSchema)
//model is basically class which will make its instance when we want to add user collection