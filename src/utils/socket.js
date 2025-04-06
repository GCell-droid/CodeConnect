const socket = require('socket.io');
const initialiseSocket = (server) => {
    const io = socket(server, {
        cors: {
            origin: ["http://localhost:5173", "https://connect-progammersfrontenet.vercel.app", "http://13.61.7.169/"],
            credentials: true,
        }
    })
    const getRoomId = () => {

    }
    io.on("connection", (socket) => {
        //handle events
        socket.on("joinChat", ({ toUserId, fromUserId }) => {
            // creating room in which two individual can chat
            // room id is used to identify which is chating to whom (all member of room will recieve the message)
            // sorting so that both of them connects to same roomId. so they can chat
            const roomId = [toUserId, fromUserId].sort().join("_")
            socket.join(roomId)
            //joining room so that he can see message that it has recieved in that room
        })
        socket.on("sendMessage", ({ sender, toUserId, fromUserId, message }) => {
            const roomId = [toUserId, fromUserId].sort().join("_");
            // console.log(toUserId + " : " + message);
            //sending message to roomId and emitting (emitting means basically sending to server something with path (like messageRecieved))
            io.to(roomId).emit("messageRecieved", { sender, toUserId, fromUserId, message });
        })
        socket.on("disconnect", () => {

        })
    })
}
module.exports = initialiseSocket;