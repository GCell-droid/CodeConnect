const express = require('express');
const bcrypt = require('bcrypt')
//correct way to connect to db
const { dbconnect } = require('./config/database')
const UserModel = require('./models/user.js');
const app = express();
const { validateSignup, validateLogin } = require('./utils/validate.js');
app.use(express.json());
app.post('/signup', async (req, res) => {
    try {
        validateSignup(req);
        const { firstName, lastName, password, emailId, age, gender, photUrl, skills, description } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);//.hash returns promise
        console.log(hashedPassword);
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
        const isUser = await UserModel.findOne({ emailId });
        if (!isUser) {
            throw new Error("Invalid Credentials")
        }
        const isPasswordValid = await bcrypt.compare(password, isUser.password);
        if (isPasswordValid)
            res.send("Login Success");
        else
            throw new Error("Invalid Credentials")
    } catch (error) {
        res.status(404).send("Error " + error.message)
    }
})
//get user by email
app.get('/user', async (req, res) => {
    try {
        const userEmail = req.body.emailId;
        const user = await UserModel.find({ emailId: userEmail }); //return arrays which match emailId
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
//feed api
app.get('/feed', async (req, res) => {
    try {
        const feed = await UserModel.find({}); //if empty then return all elements
        if (feed.length == 0) {
            res.status(404).send("Try Again Later")
        } else {
            res.send(feed);
        }
    } catch (error) {
        res.status(404).send("Unexpected Error " + error.message)
    }



})
//update user
app.patch('/user/:emailId', async (req, res) => {
    try {
        const emailId = req.params.emailId;//using dynamic route to get email id as it can't be part of allowed update, we don't want emailid to be able to updated
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
        //Object.keys return array of key names
        //.every returns true if every element in array satisfy that condition
        if (!isUpdate) {
            throw new Error("Field Not allowed to update")
        }
        const user = await UserModel.findOneAndUpdate({ emailId: emailId }, req.body, { runValidators: true, returnDocument: "before" });//return user document before update
        //function findOneAndUpdate(filter, update, options) {}
        console.log(user)
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