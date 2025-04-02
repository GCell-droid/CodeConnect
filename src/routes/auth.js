const express = require('express')
const authRouter = express.Router();
const { validateSignup, validateLogin } = require('../utils/validate');
const bcrypt = require('bcrypt')
const UserModel = require('../models/user.js');
const userAuth = require('../middlewares/userAuth.js');
authRouter.post('/signup', async (req, res) => {
    try {
        validateSignup(req);
        const { firstName, lastName, password, emailId, age, gender, photUrl, skills, description } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new UserModel({ firstName, lastName, password: hashedPassword, emailId, age, gender, photUrl, skills, description });
        const token = await user.getJWT();
        res.cookie('token', token, { httpOnly: true, secure: true });
        await user.save()
        res.json(user)
    }
    catch (error) {
        res.status(404).send(error.message)
    }
})
authRouter.post('/login', async (req, res) => {
    try {
        validateLogin(req);
        const { emailId, password } = req.body;
        const User = await UserModel.findOne({ emailId });
        if (!User) {
            throw new Error("Invalid Credentials")
        }
        const isPasswordValid = await User.validatePassword(password)
        if (isPasswordValid) {
            const token = await User.getJWT();
            res.cookie('token', token, { httpOnly: true, secure: true });
            res.json(User);
        }
        else
            throw new Error("Invalid Credentials")
    } catch (error) {
        res.status(404).send(error.message)
    }
})
authRouter.post('/logout', userAuth, async (req, res) => {
    //userAuth is not necessary
    // res.clearCookie('token');
    res.cookie('token', null, {
        expires: new Date(Date.now())
    }).send("Logout Success")

})
module.exports = authRouter;