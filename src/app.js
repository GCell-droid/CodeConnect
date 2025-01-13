const express = require('express');
const app = express();
app.get('/user', (req, res, next) => {
    // try {
    throw new Error('Random error');
    res.send("User Responded")
    // } catch {
    //     res.status(500).send("User Error Occured")
    // }
})
app.use('/', (err, req, res, next) => {
    if (err)
        res.status(500).send("Gracefull Error occured")
})
app.listen(7777, () => {
    console.log("Listening to port 7777")
})