const express = require('express');
const userAuth = require('../middlewares/userAuth.js')
const ConnectionRequest = require('../models/connectionRequest.js')
const userRouter = express.Router();
const UserModel = require('../models/user.js');
const SAFE_DATA_TO_GET = "firstName lastName photoUrl description gender age skills";
userRouter.get('/feed', userAuth, async (req, res) => {
    try {
        //pagination 
        //query -> start with ?
        //params ->start with :
        let limit = req.query.limit || 10;
        limit = limit > 10 ? 10 : limit;
        const page = req.query.page || 1;
        let skip = (page - 1) * limit;
        //it is bad to overfetch 
        const user = req.user;
        const sentRequest = await ConnectionRequest.find({
            $or: [{ fromUserId: user._id }, { toUserId: user._id }]
        }).select("fromUserId toUserId");
        // const hideUsers = sentRequest.map((f) => f.toUserId.toString() === user._id.toString() ? f.fromUserId.toString() : f.toUserId.toString())
        const hideUsers = new Set();
        sentRequest.forEach((f) => {
            hideUsers.add(f.fromUserId.toString());
            hideUsers.add(f.toUserId.toString())
        })
        hideUsers.add(user._id)
        // const filteredFeed = feed.filter((f) => {
        //     const fId = f._id.toString();
        //     return fId !== user._id.toString() && !toIds.includes(fId);
        // });
        const filteredFeed = await UserModel.find({
            _id: { $nin: Array.from(hideUsers) } //not in array of hideusers
        }).select(SAFE_DATA_TO_GET).skip(skip).limit(limit) //adding skip and limit for pagination
        res.send(filteredFeed);
    } catch (error) {
        res.status(404).send("Error getting feed: " + error.message)
    }
})
userRouter.get('/user/requests', userAuth, async (req, res) => {
    try {
        const user = req.user;
        const inboxArray = await ConnectionRequest.find({
            toUserId: user._id,
            status: "interested"
        }).populate('fromUserId', "firstName lastName photoUrl description gender age skills")
        if (inboxArray.length == 0) {
            return res.json({ "message": "No Requests at a moment", inboxArray })
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
            .populate('toUserId', SAFE_DATA_TO_GET)
        const filteredData = acceptedRequest.map(r => {
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