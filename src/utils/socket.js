const socket = require('socket.io');
const crypto = require('crypto');
const { Chat } = require('../models/chat');
const connectionRequest = require('../models/connectionRequest');
const initialiseSocket = (server) => {
    const io = socket(server, {
        cors: {
            origin: ["http://localhost:5173", "https://connect-progammersfrontenet.vercel.app", "http://13.61.7.169/"],
            credentials: true,
        }
    })
    const getRoomId = (toUserId, fromUserId) => {
        return crypto.createHash('sha256').update([toUserId, fromUserId].sort().join("$$")).digest('hex');
    }
    io.on("connection", (socket) => {
        socket.on("joinChat", async ({ toUserId, fromUserId }) => {
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
            if (areFriend) {
                const roomId = getRoomId(toUserId, fromUserId);
                socket.join(roomId)
            }
        })
        socket.on("sendMessage", async ({ sender, toUserId, fromUserId, message }) => {
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
                if (areFriend) {
                    const roomId = getRoomId(toUserId, fromUserId);
                    //if chat exist or not
                    let chat = await Chat.findOne({ participants: { $all: [toUserId, fromUserId] } });
                    if (!chat) {
                        chat = await new Chat({
                            participants: [fromUserId, toUserId],
                            messages: []
                        })
                    }
                    //pushing message to chat array
                    chat.messages.push({ senderId: fromUserId, text: message });
                    await chat.save();
                    io.to(roomId).emit("messageRecieved", { sender, toUserId, fromUserId, message });
                } else {
                    throw new Error("Not Friends, Sent Connection First")
                }
            } catch (err) {
            }
        })
        socket.on("disconnect", () => {

        })
    })
}
module.exports = initialiseSocket;