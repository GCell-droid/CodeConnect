const mongoose = require('mongoose');
const connectionRequestSchema = new mongoose.Schema({
    toUserId: {
        type: mongoose.Schema.Types.ObjectId,
        //using ref
        ref: "User",
        require: true
    },
    fromUserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        require: true
    },
    status: {
        type: String,
        enum: {
            values: ["accepted", "rejected", "interested", "ignored"],
            message: `Value not valid`
        },
        require: true
    },
}, { timestamps: true })
connectionRequestSchema.index({ toUserId: 1, fromUserId: 1 })
connectionRequestSchema.pre("save", function () {
    const connectionRequest = this;
    if (connectionRequest.fromUserId.equals(connectionRequest.toUserId)) {
        // we need to use equals as they both are objectid type so need to parse it 
        throw new Error("Can't send request to own id");
    }
    // next();

})
module.exports = new mongoose.model('ConnectionRequestModel', connectionRequestSchema);