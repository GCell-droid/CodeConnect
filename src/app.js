const express = require('express');
const { dbconnect } = require('./config/database')
const app = express();
const cookieParser = require('cookie-parser')
const authRouter = require('./routes/auth.js');
const userRouter = require('./routes/user.js');
const profileRouter = require('./routes/profile.js');
app.use(express.json());
app.use(cookieParser());
//using routes
app.use('/', authRouter);
app.use('/', profileRouter)
app.use('/', userRouter)
dbconnect().then(() => {
    console.log("DB connected Success")
    app.listen(7777, () => {
        console.log("Listening to http://localhost:7777")
    })
}).catch(() => {
    console.log("DB not connect")
})