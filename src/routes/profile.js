const express = require('express');
const userAuth = require('../middlewares/userAuth.js');
const { validateEditProfile } = require('../utils/validate.js');
const bcrypt = require('bcrypt')
const profileRouter = express.Router();
profileRouter.get('/profile/view', userAuth, async (req, res) => {
    try {
        const userData = req.user; //coming from userAuth middleware
        res.send(userData);
    }
    catch (err) {
        res.status(400).send("Error " + err.message)
    }
})
profileRouter.patch('/profile/edit', userAuth, async (req, res) => {
    try {
        const isEditValid = validateEditProfile(req);
        if (!isEditValid) {
            throw new Error(" Field Not Allowed to Edit");
        }
        const loggedUser = req.user;
        Object.keys(req.body).every(key => {
            loggedUser[key] = req.body[key];
        })
        // as loggedUser is instance of user of UserModel so we can do loggedUser.save and call other methods defined in user model also
        await loggedUser.save();
        res.json({
            message: "Successfully Edited",
            user: loggedUser
        })

    } catch (err) {
        res.status(400).send("Error " + err.message);
    }
})
profileRouter.patch('/profile/changepassword', userAuth, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const loggedUser = req.user;
        // always use await if function defined is async
        const isPasswordValid = await loggedUser.validatePassword(currentPassword);
        if (!isPasswordValid) {
            throw new Error("Invalid Credentials :/")
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        loggedUser.password = hashedPassword;
        await loggedUser.save();
        res.send("Password Updated");
    } catch (err) {
        res.status(400).send(err.message);
    }
})
module.exports = profileRouter;