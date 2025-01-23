const express = require('express');
const bcrypt = require('bcrypt')
//correct way to connect to db
const { dbconnect } = require('./config/database')
const UserModel = require('./models/user.js');
const app = express();
const { validateSignup, validateLogin } = require('./utils/validate.js');
const cookieParser = require('cookie-parser')
const jwt = require('jsonwebtoken');
const userAuth = require('./middlewares/userAuth.js');
app.use(express.json());
app.use(cookieParser());
app.post('/signup', async (req, res) => {
    try {
        validateSignup(req);
        const { firstName, lastName, password, emailId, age, gender, photUrl, skills, description } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new UserModel({ firstName, lastName, password: hashedPassword, emailId, age, gender, photUrl, skills, description });
        await user.save()
        res.send("Data Added Success")
    }
    catch (error) {
        res.status(404).send("Error " + error.message)
    }
})
app.post('/login', async (req, res) => {
    try {
        validateLogin(req);
        const { emailId, password } = req.body;
        const User = await UserModel.findOne({ emailId });
        if (!User) {
            throw new Error("Invalid Credentials")
        }
        // const isPasswordValid = await bcrypt.compare(password, User.password);
        const isPasswordValid = User.validatePassword(password)
        if (isPasswordValid) {
            // var token = await jwt.sign({ id: User._id }, "Myserverkey", { expiresIn: "1d" }); //Hiding userid in token
            //we can use schema method also to generate token (written in user.js)
            const token = await User.getJWT();
            res.cookie('token', token);
            res.send("Login Success");
        }
        else
            throw new Error("Invalid Credentials")
    } catch (error) {
        res.status(404).send("Error " + error.message)
    }
})
app.get('/profile', userAuth, async (req, res) => { //added userAuth middleware now that handles all token authentication
    try {
        const userData = req.user;
        res.send(userData);
    }
    catch (err) {
        res.status(400).send("Error " + err.message)
    }

})
app.get('/user', async (req, res) => {
    try {
        const userEmail = req.body.emailId;
        const user = await UserModel.find({ emailId: userEmail });
        if (user.length === 0) {
            res.status(404).send("User Not Found");
        } else {
            res.send(user);
        }
    }
    catch {
        res.status(404).send("Unexpected Error")
    }
})
app.get('/feed', async (req, res) => {
    try {
        const feed = await UserModel.find({});
        if (feed.length == 0) {
            res.status(404).send("Try Again Later")
        } else {
            res.send(feed);
        }
    } catch (error) {
        res.status(404).send("Unexpected Error " + error.message)
    }



})
app.patch('/user/:emailId', async (req, res) => {
    try {
        const emailId = req.params.emailId;
        const ALLOWED_UPDATE = [
            "firstName",
            "lastName",
            "gender",
            "photUrl",
            "age",
            "password",
            "skills",
            "descrption"
        ]
        const isUpdate = Object.keys(req.body).every(k => ALLOWED_UPDATE.includes(k))
        if (!isUpdate) {
            throw new Error("Field Not allowed to update")
        }
        const user = await UserModel.findOneAndUpdate({ emailId: emailId }, req.body, { runValidators: true, returnDocument: "before" });
        // console.log(user)
        res.send("User Profile Updated")

    } catch (error) {
        res.status(404).send("Unexpected Error " + error.message)
    }
})
dbconnect().then(() => {
    console.log("DB connected Success")
    app.listen(7777, () => {
        console.log("Listening to http://localhost:7777")
    })
}).catch(() => {
    console.log("DB not connect")
})