
const express = require('express');
const app = express();
// app.use("/", (request, response) => {
//     response.send('Hello from dashboard Express');
// })
// above handler not only works for '/' but for anything that starts with / that's why below handler were overwritten and not working 

app.use("/test", (request, response) => {
    response.send('Hello from test Express');
})
// above handler not only works for /test but for anything that starts with /test but not for /test123 
// /test/123 will work but /test123 will not work
app.use("/hello", (request, response) => {
    response.send('Hello Hello Hello');
})
app.listen(3005, () => {
    console.log("Only runs when server starts http://localhost:3005")
})