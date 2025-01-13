const express = require('express');
const app = express();
const { adminAuth } = require('./middlewares/adminAuth.js');
const { userAuth } = require('./middlewares/userAuth.js');
// app.use('/user', (req, res, next) => {
//     console.log("first handler");
//     // res.send('responed by first handler');
//     next();
// });
// //works as previous ones . we can wrap our function in array also
// app.use('/user', (req, res, next) => {
//     console.log("second handler");
//     res.send('responed by second handler');
//     next();
// });

// these functions are called middlewares
// when we go to /user then it will go though middlewares then respone will be sent if there


//Authorisation
app.use('/admin', adminAuth);
// If we don't use middleware then we have to write the same code for auth for both admin code /update and /delete again
app.get('/admin/updateData', (req, res) => {
    console.log("At /admin/updateData path");
    res.send('Admin data updated');
})
app.get('/admin/deleteData', (req, res) => {
    console.log("At /admin/updateData path");
    res.send('User Data Deleted');
})
app.post('/user/login', (req, res) => {
    res.send("Login success")
})
app.get('/user', userAuth, (req, res, next) => { //another way of writing just for noticing
    console.log("User Authorised Success");
    res.send("Welcome User")
}
);
app.listen(7777, () => {
    console.log('Server is running on port  http://localhost:7777');
});