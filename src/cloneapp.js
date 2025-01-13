const express = require('express');
const app = express();
// we can use multiple handlers for the same route
app.use('/user', (req, res, next) => {
    console.log("first handler");
    next();
    console.log("after")
    res.send('responed by first handler');
}, (req, res, next) => {
    console.log("second handler");
    // res.send('responed by second handler');
    next();
}, (req, res, next) => {
    console.log("3 handler");
    // res.send('responed by 3 handler');
    next();
}, (req, res, next) => {
    console.log("4 handler");
    // res.send('responed by 3 handler');
    // next();
}
    // if there is response.send() in any handler then it will be executed and depends on where next is placed. if there is only one then it will be executed.
)
app.listen(7777, () => {
    console.log('Server is running on port  http://localhost:7777/user');
});