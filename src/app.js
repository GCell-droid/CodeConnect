
const express = require('express');
const app = express();
app.use("/", (request, response) => {
    response.send('Hello from dashboard Express');
})
app.use("/test", (request, response) => {
    response.send('Hello from test Express');
})
app.use("/hello", (request, response) => {
    response.send('Hello Hello Hello');
})
app.listen(3005, () => {
    console.log("Only runs when server starts http://localhost:3005")
})