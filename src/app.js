require('dotenv').config();
const express = require('express');
const { dbconnect } = require('./config/database')
const app = express();
const cookieParser = require('cookie-parser')
const authRouter = require('./routes/auth.js');
const userRouter = require('./routes/user.js');
const connectionHandle = require('./routes/connectionHandle.js')
const profileRouter = require('./routes/profile.js');
const http = require('http');
const cors = require('cors');
const initialiseSocket = require('./utils/socket.js');
app.use(cors({
    origin: ["http://localhost:5173", "https://connect-progammersfrontenet.vercel.app", "http://13.61.7.169/"],
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use('/', authRouter);
app.use('/', profileRouter)
app.use('/', userRouter)
app.use('/', connectionHandle)
const server = http.createServer(app);
initialiseSocket(server);
dbconnect().then(() => {
    console.log("DB connected Success")
    server.listen(process.env.PORT, () => {
        console.log("Listening to PORT")
    })
}).catch(() => {
    console.log("DB not connect")
})