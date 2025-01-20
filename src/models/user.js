// for user schema
const mongoose = require('mongoose');
const validator = require('validator')
const userSchema = mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        maxLength: 20,
        minLength: 3
    },
    lastName: {
        type: String,
        maxLength: 20,
        minLength: 3
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
        validate(value) {
            if (!validator.isEmail(value))
                throw new Error("Email Not valid")
        }
    },
    password: {
        type: String,
        required: true,
        validate(value) {
            if (value.length > 15)
                throw new Error("Password exceed Limit")
            if (!validator.isStrongPassword(value))
                throw new Error("Use Strong Password")
        }
    },
    photUrl: {
        type: String,
        default: "https://static.vecteezy.com/system/resources/previews/045/944/199/non_2x/male-default-placeholder-avatar-profile-gray-picture-isolated-on-background-man-silhouette-picture-for-user-profile-in-social-media-forum-chat-greyscale-illustration-vector.jpg",
        validate(value) {
            if (!validator.isURL(value))
                throw new Error("Image URL Not valid")
        }
    },
    skills: {
        type: [String],
        validate(value) {
            if (value.length > 10)
                throw new Error("Exceed Maximum allowed no. of field")
        }
    },
    description: {
        type: String,
        default: "I am new here",
        validate(value) {
            if (value.length > 100)
                throw new Error("Exceeds Limit")
        }
    }
}, { timestamps: true })
// const UserModel = mongoose.model("User", userSchema)
// model name always starts with capital letter
module.exports = mongoose.model("User", userSchema)
//model is basically class which will make its instance when we want to add user collection