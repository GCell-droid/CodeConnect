
const express = require('express');
const app = express();
// app.use("/", (request, response) => {
//     response.send('Hello from dashboard Express');
// })
// above handler not only works for '/' but for anything that starts with / that's why below handler were overwritten and not working 
app.use("/hello/me", (request, response) => {
    response.send('Hello Nitesh');
})
app.use("/test", (request, response) => {
    response.send('Hello from test Express');
})
// above handler not only works for /test but for anything that starts with /test but not for /test123 
// /test/123 will work but /test123 will not work
app.use("/hello", (request, response) => {
    response.send('Hello Hello Hello');
})
app.use("/", (request, response) => {
    response.send('Hello from dashboard Express');
})
// order also matters in the handlers if we put / handler at last then it will work for all the requests that are not handled by any above handler 

app.listen(3005, () => {
    console.log("Only runs when server starts http://localhost:3005")
})