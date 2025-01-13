const express = require('express');
const app = express();
// we can use multiple handlers for the same route
app.use('/user', (req, res, next) => {
    console.log("first handler");
    // res.send('responed by first handler');
    next();
}, (req, res) => {
    console.log("second handler");
    res.send('responed by second handler');
})
app.listen(7777, () => {
    console.log('Server is running on port  http://localhost:7777');
});