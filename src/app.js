const express = require('express');
//correct way to connect to db
const { dbconnect } = require('./config/database')
const UserModel = require('./models/user.js');
const app = express();
app.use(express.json());// using middleware to use json format //this will work for every request to server as we are not specifying path
app.post('/signup', async (req, res) => {
    try {
        const ALLOWED_FIELDS = [
            "emailId",
            "firstName",
            "lastName",
            "gender",
            "photUrl",
            "age",
            "password",
            "skills",
            "descrption"
        ]
        const isAllowed = Object.keys(req.body).every(k => ALLOWED_FIELDS.includes(k))
        //Object.keys return array of key names
        //.every returns true if every element in array satisfy that condition
        if (!isAllowed) {
            throw new Error("Insert Only given field")
        }
        const user = new UserModel(req.body);
        await user.save()
        res.send("Data Added Success")
    }
    catch (error) {
        res.status(404).send("Unexpected Error " + error.message)
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