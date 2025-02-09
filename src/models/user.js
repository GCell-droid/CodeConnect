const jwt = require('jsonwebtoken')
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
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
    session: {
        type: String
    },
    password: {
        type: String,
        required: true,
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


//Schema Methods
userSchema.methods.getJWT = async function () { //always use functin keyword don't use arrrow function here
    const user = this; //'this' will point to user document that we are using
    const token = await jwt.sign({ id: user._id }, "Myserverkey", { expiresIn: '7d' })
    return token;
}

userSchema.methods.validatePassword = async function (passwordInputedByUser) {
    const user = this;
    const isPasswordValid = await bcrypt.compare(passwordInputedByUser, user.password) //always maintain order as bcrypt.compare(passwordInputedByUser,passwordInDatabase)
    return isPasswordValid
}

module.exports = mongoose.model("User", userSchema)