const jwt = require('jsonwebtoken');
const UserModel = require('../models/user')
const userAuth = async (req, res, next) => {
    try {
        const { token } = req.cookies;
        if (!token) {
            return res.status(401).send("Login Again")
        }
        const { id } = jwt?.verify(token, process.env.JWT_SECRET); //we get decoded data
        const userData = await UserModel.findById(id);
        if (!userData) {
            throw new Error("Invalid User :/")
        }
        req.user = userData;
        //to avoid redundant finding user we can attach it to request.user so we can access it in another middleware
        next();//giving control to next middleware
    } catch (err) {
        res.status(400).send("Auth Error:" + err.message);
    }
}
module.exports = userAuth;