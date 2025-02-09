const validator = require('validator');
const { default: isEmail } = require('validator/lib/isEmail');
const validateSignup = (req) => {
    const { emailId, firstName, lastName, password } = req.body;
    if (firstName.length < 3 || lastName < 3)
        throw new Error("Enter Valid Name :/");
    if (!validator.isEmail(emailId))
        throw new Error("Enter Valid Email Id :/");
    if (!validator.isStrongPassword(password))
        throw new Error("Use Strong Password :)");
}
const validateLogin = (req) => {
    const { emailId } = req.body;
    if (!isEmail(emailId))
        throw new Error("Invalid Email ID")
}
const validateEditProfile = (req) => {
    const AllowedEditFields = [
        "firstName",
        "lastName",
        "photoUrl",
        "gender",
        "description",
        "skills",
        "age"
    ]
    const isEditValid = Object.keys(req.body).every(key => AllowedEditFields.includes(key));
    return isEditValid
}
module.exports = {
    validateSignup,
    validateLogin,
    validateEditProfile,
}