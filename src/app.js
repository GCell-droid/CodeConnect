require('dotenv').config();
const express = require('express');
const { dbconnect } = require('./config/database')
const app = express();
const cookieParser = require('cookie-parser')
const authRouter = require('./routes/auth.js');
const userRouter = require('./routes/user.js');
const connectionHandle = require('./routes/connectionHandle.js')
const profileRouter = require('./routes/profile.js');
const cors = require('cors')
app.use(cors({
    origin: ["http://localhost:5173", "https://connect-progammersfrontenet.vercel.app", "http://13.61.7.169/"],
    credentials: true,

}));
app.use(express.json());
app.use(cookieParser());
//using routes
app.use('/', authRouter);
app.use('/', profileRouter)
app.use('/', userRouter)
app.use('/', connectionHandle)

// console.log(process.env.MONGOURI)
dbconnect().then(() => {
    console.log("DB connected Success")
    app.listen(process.env.PORT, () => {
        console.log("Listening to PORT")
    })
}).catch(() => {
    console.log("DB not connect")
})