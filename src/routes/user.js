const express = require('express');
const userAuth = require('../middlewares/userAuth.js')
const ConnectionRequest = require('../models/connectionRequest.js')
const userRouter = express.Router();
const UserModel = require('../models/user.js');
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
const SAFE_DATA_TO_GET = "firstName lastName photoUrl description gender age";
userRouter.get('/user/requests', userAuth, async (req, res) => {
    try {
        const user = req.user;
        const inboxArray = await ConnectionRequest.find({
            toUserId: user._id,
            status: "interested"
        }).populate('fromUserId', "firstName lastName photoUrl description gender age") //another way of writing populate just write we want in string with space
        if (inboxArray.length == 0) {
            return res.json({ "message": "No Request at a moment" })
        }
        return res.json({ "message": "Request Inbox", inboxArray })
    } catch (err) {
        return res.status(400).json({ "message": "Error in getting request box " + err.message });
    }
})
userRouter.get("/user/connections", userAuth, async (req, res) => {
    try {
        const user = req.user;
        const acceptedRequest = await ConnectionRequest.find({
            $or: [{
                toUserId: user._id,
                status: "accepted"
            },
            {
                fromUserId: user._id,
                status: "accepted"
            }]
        }
        ).populate('fromUserId', SAFE_DATA_TO_GET)
            .populate('toUserId', SAFE_DATA_TO_GET)//jisko populatea karna hai uski id aaegi matlab hume fromUserid ki detail chahiye
        const filteredData = acceptedRequest.map(r => {
            // we know that either one of toUserid or fromUserId will be logged in user
            // if (r.toUserId._id == user._id) { // we can't directly equals mongo db ids so caonveting ids to string
            if (r.toUserId._id.toString() == user._id.toString()) {
                return r.fromUserId
            }
            return r.toUserId;
        })
        return res.json({ "message": "Accepted Requests", filteredData })
    } catch (err) {
        return res.status(400).json({ "message": "Error in getting accepted request box " + err.message });
    }
})
module.exports = userRouter;