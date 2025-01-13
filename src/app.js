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
    res.send('responed by second handler');
    // next();
}
)
app.listen(7777, () => {
    console.log('Server is running on port  http://localhost:7777');
});