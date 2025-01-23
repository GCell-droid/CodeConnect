const jwt = require('jsonwebtoken');
const UserModel = require('../models/user')
const userAuth = async (req, res, next) => {
    try {
        const cookie = req.cookies;
        const { token } = cookie;
        if (!token) {
            throw new Error("Login Agin :)")
        }
        const { id } = jwt.verify(token, "Myserverkey"); //we get decoded data
        const userData = await UserModel.findById(id);
        if (!userData) {
            throw new Error("Invalid User :/")
        }
        req.user = userData;
        //to avoid redundant finding user we can attack it to request.user so we can access it in another middleware
        next();//giving control to next middleware
    } catch (err) {
        res.status(400).send(err.message);
    }
}
module.exports = userAuth;