const express = require('express');
const userAuth = require('../middlewares/userAuth');
const ConnectionRequest = require('../models/connectionRequest');
const requestRouter = express.Router();
const UserModel = require('../models/user');
const { status } = require('express/lib/response');
const connectionRequest = require('../models/connectionRequest');
requestRouter.post('/request/:status/:toUserId', userAuth, async (req, res) => {
    try {
        const fromUserId = req.user._id;
        const toUserId = req.params.toUserId;
        const status = req.params.status;
        //status cannot be random- handled
        const allowedStatus = ["ignored", "interested"]
        if (!allowedStatus.includes(status)) {
            //always use return otherwise server crashes if we try to sent multiple user request
            return res.status(404).json({ message: `${status} is not valid` })
        }
        // to himself - handled in schema based using pre
        // if (fromUserId == toUserId) {
        //     return res.status(404).json({ message: `Cannot send request to own` })
        // }
        //user id cannot be random- handled
        const toUser = await UserModel.findById(toUserId);
        if (!toUser) {
            return res.status(404).json({ message: `User does not exists` })
        }


        //request exist and never forget await in db query 
        //new or syntax
        // const connectionreqAlreadyExist = await ConnectionRequest.findOne({
        //     $or: [{ fromUserId: fromUserId, toUserId: toUserId }, { fromUserId: toUserId, toUserId: fromUserId }]
        // })
        const connectionreqAlreadySent = await ConnectionRequest.findOne(
            { fromUserId: fromUserId, toUserId: toUserId }
        )
        if (connectionreqAlreadySent) {
            return res.status(404).json({ message: `Request Already Exist` })
        }
        const connectionreqAlreadyGot = await ConnectionRequest.findOne(
            { fromUserId: toUserId, toUserId: fromUserId })
        if (connectionreqAlreadyGot) {
            return res.status(404).json({ message: `You have already recieved request. Check Request Box` })
        }
        const request = await new ConnectionRequest({
            fromUserId,
            toUserId,
            status,
        });
        await request.save();
        res.send({
            message: `Request ${status}`,
            requestData: request,
        })
    } catch (err) {
        res.status(400).send("Connection Error " + err.message);
    }

})
requestRouter.post("/request/review/:status/:requestId", userAuth, async (req, res) => {
    try {
        const AllowedStatus = ["accepted", "rejected"];
        const { status, requestId } = req.params;
        if (!AllowedStatus.includes(status)) {
            return res.status(400).json({ "message": "Status Not Valid" });
        }
        const user = req.user;
        //only finding request that is intereseted and belong to user._id
        const request = await ConnectionRequest.findOne({
            _id: requestId,
            toUserId: user._id,
            status: "interested"
        })
        if (!request) {
            return res.status(404).json({ "message": "Request Not found" });
        }
        request.status = status;
        request.save();
        return res.json({ "message": `Request ${status}`, request });

    }
    catch (err) {
        return res.status(400).json({ "message": "Error in request review " + err.message });
    }
})

module.exports = requestRouter;