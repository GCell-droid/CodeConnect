// for user schema
const mongoose = require('mongoose');
const userSchema = mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        maxlength: 20,
        minlength: 3
    },
    lastName: {
        type: String
    },
    gender: {
        type: String,
        validate(value) {
            if (!["male", "female"].includes(value)) {
                throw new Error("Gender Not Valid")
            }
        }
    },
    age: {
        type: Number,
        min: 18
    },
    emailId: {
        type: String,
        trim: true,
        unique: true,
        required: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true
    },
    photUrl: {
        type: String,
        default: "https://static.vecteezy.com/system/resources/previews/045/944/199/non_2x/male-default-placeholder-avatar-profile-gray-picture-isolated-on-background-man-silhouette-picture-for-user-profile-in-social-media-forum-chat-greyscale-illustration-vector.jpg"
    },
    skills: {
        type: [String]
    },
    description: {
        type: String,
        default: "I am new here"
    }
}, { timestamps: true })
// const UserModel = mongoose.model("User", userSchema)
// model name always starts with capital letter
module.exports = mongoose.model("User", userSchema)
//model is basically class which will make its instance when we want to add user collection