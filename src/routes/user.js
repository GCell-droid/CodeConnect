const express = require('express');
const userRouter = express.Router();
const UserModel = require('../models/user.js');
userRouter.get('/user', async (req, res) => {
    try {
        const userEmail = req.body.emailId;
        const user = await UserModel.find({ emailId: userEmail });
        if (user.length === 0) {
            res.status(404).send("User Not Found");
        } else {
            res.send(user);
        }
    }
    catch {
        res.status(404).send("Unexpected Error")
    }
})
userRouter.get('/feed', async (req, res) => {
    try {
        const feed = await UserModel.find({});
        if (feed.length == 0) {
            res.status(404).send("Try Again Later")
        } else {
            res.send(feed);
        }
    } catch (error) {
        res.status(404).send("Unexpected Error " + error.message)
    }
})
// userRouter.patch('/user/:emailId', async (req, res) => {
//     try {
//         const emailId = req.params.emailId;
//         const ALLOWED_UPDATE = [
//             "firstName",
//             "lastName",
//             "gender",
//             "photUrl",
//             "age",
//             "password",
//             "skills",
//             "descrption"
//         ]
//         const isUpdate = Object.keys(req.body).every(k => ALLOWED_UPDATE.includes(k))
//         if (!isUpdate) {
//             throw new Error("Field Not allowed to update")
//         }
//         const user = await UserModel.findOneAndUpdate({ emailId: emailId }, req.body, { runValidators: true, returnDocument: "before" });
//         res.send("User Profile Updated")

//     } catch (error) {
//         res.status(404).send("Unexpected Error " + error.message)
//     }
// })
module.exports = userRouter;