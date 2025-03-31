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
    origin: "http://localhost:5173",
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());
//using routes
app.use('/', authRouter);
app.use('/', profileRouter)
app.use('/', userRouter)
app.use('/', connectionHandle)
dbconnect().then(() => {
    console.log("DB connected Success")
    app.listen(7777, () => {
        console.log("Listening to http://localhost:7777")
    })
}).catch(() => {
    console.log("DB not connect")
})