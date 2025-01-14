const express = require('express');
//correct way to connect to db
const { dbconnect } = require('./config/database')
const UserModel = require('./models/user.js');
const app = express();
app.post('/signup', async (req, res) => { //add user
    //creating new instance of the usermodel
    const user = new UserModel({
        firstName: "Virat",
        lastName: "Kohli",
        gender: "Male",
        emailId: "viratkohli@gmail.com"
    })
    // to save document in user collection in DevConnect Db.. use '.save' on instance of UserModel 
    await user.save() //.save returns promise so use async function
    res.send("Data Added Success")
})
dbconnect().then(() => {
    console.log("DB connected Success") //if db connection success then only server should listens
    app.listen(7777, () => {
        console.log("Listening to http://localhost:7777")
    })
}).catch(() => {
    console.log("DB not connect")
})