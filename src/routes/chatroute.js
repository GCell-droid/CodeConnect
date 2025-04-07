const express = require('express');
const userAuth = require('../middlewares/userAuth');
const { Chat } = require('../models/chat');
const connectionRequest = require('../models/connectionRequest');
const chatRouter = express.Router();
chatRouter.get("/chat/:toUserId", userAuth, async (req, res) => {
    const fromUserId = req.user._id;
    const { toUserId } = req.params;
    try {
        const areFriend = await connectionRequest.findOne({
            $or: [{
                fromUserId: toUserId,
                toUserId: fromUserId,
                status: "accepted"
            },
            {
                toUserId: toUserId,
                fromUserId: fromUserId,
                status: "accepted"
            }]
        })
        if (!areFriend) {
            throw new Error("Not Friends, Sent Connection Request First");
        }
        let chat = await Chat.findOne({ participants: { $all: [fromUserId, toUserId] } }).populate({
            path: "messages.senderId",
            select: "firstName photoUrl"
        });
        if (!chat) {
            chat = new Chat({
                participants: [fromUserId, toUserId],
                messages: [],
            })
            await chat.save();
        }
        res.json(chat);

    } catch (err) {
        res.status(401).send(err.message)
    }
})
module.exports = chatRouter