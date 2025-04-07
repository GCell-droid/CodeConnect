const mongoose = require('mongoose');
const messageSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        require: true,
    },
    text: {
        type: String,
        require: true,
    },
    status: {
        type: String,
        default: "Not Seen",
        validate(value) {
            if (!["Seen", "Not Seen"].includes(value)) {
                throw new Error("Message Status Not Valid")
            }
        }
    }
}, { timestamps: true })

const chatSchema = new mongoose.Schema({
    //using participants array so that multiple people can chat or group chat feature 
    participants: [{ type: mongoose.Types.ObjectId, ref: "User", require: true }],
    messages: [messageSchema],
})


const Chat = mongoose.model("Chat", chatSchema);
module.exports = { Chat };