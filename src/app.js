const express = require('express');
const app = express();
// this will match all http methods api calls to /test
// app.use("/user", (request, response) => {
//     response.send('Hello test user');
// })

//this will match only get http method api calls to /test
// app.get("/user", (request, response) => {
//     console.log(request.query)
//     response.send('Hello user');
// })
// app.get("/user", (request, response) => {
//     console.log(request.query)
//     console.log(request.params)
//     response.send('Hello user');
// })
//dynamic route
app.get("/user/:userid", (request, response) => {
    console.log(request.query)
    console.log(request.params)
    response.send('Hello user');
})
//this will match only post http method api calls to /test
app.post("/user", (request, response) => {
    console.log("Save Data")
    response.send('Success');
})
app.delete("/user", (request, response) => {
    console.log("Deleting")
    response.send('Data removed');
})

//order matters so it will not interfere with above handlers
app.use("/user", (request, response) => {
    response.send('Hello test user');
})
app.listen(3005, () => {
    console.log("Only runs when server starts http://localhost:3005")
})