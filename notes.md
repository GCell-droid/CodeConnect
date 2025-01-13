# Namaste Node
## Lecture 4 Routes and Requests
### Code
``` js
// app.use("/", (request, response) => {
//     response.send('Hello from dashboard Express');
// })
// above handler not only works for '/' but for anything that starts with / that's why below handler were overwritten and not working 

app.use("/test", (request, response) => {
    response.send('Hello from test Express');
})
// above handler not only works for /test but for anything that starts with /test but not for /test123 
// /test/123 will work but /test123 will not work
```
### Notes
Order also matters if / handler is at last then it will works as expected /test, /hello will work. It works in sequence express check route one by one

### HTTP Methods
- 	Order also matters if / handler is at last then it will works as expected /test, /hello will work 
-	Whenever we are going to url then it does GET http call
-	.use will match with every call like post, get so it is giving same result as we do get call, post,etc
-	To differentiat call we can use .get method to handle only get methods


``` js
// this will match all http methods api calls to /test
app.use("/test", (request, response) => {
    response.send('Hello test user');
})

//this will match only get http method api calls to /test
app.get("/test", (request, response) => {
    response.send('Hello test user get');
})
```
### Advanced Routing technique (based on patterns)
``` js
// ? means 'e' is optional so /tst will also work
app.get("/te?st", (request, response) => {
    response.send('Hello test user get');
})

// + means any times e will work(atleast one e should be there) so /teeest will also work
app.get("/te+st", (request, response) => {
    response.send('Hello test user get');
    })

// * means anything in between e and s will work so /teabcxyzst will work
app.get("/te*st", (request, response) => {
    response.send('Hello test user get');
})

// we can group thing also, es is optional
app.get("/t(es)?t", (request, response) => {
    response.send('Hello test user get');
})

// we can write regex also
app.get("/.*fly$/", (request, response) => {
    response.send('Hello test user get');
})
//anything ending with fly will work
```

- Getting Query Params 
-- We will find it in request.query
http://localhost:3005/user?userID=123, ? means query and if we want to add more use &

- params - making routes dynamic
-- http://localhost:3005/user/:user, we get param using request.params so http://localhost:3005/user/123 will give user:123 in console eg http://localhost:3005/user/123?id=123&name=np will output 

____    



## Lecture 5 Middlewares

### General points about route handlers
 - If we don't send any response back in .use route handler then our api will keep sending request and looping ,after sometime browser will hit timeout.
 - One route can have multiple route handlers as in code. First route handler will work when we go to /user . As js runs line by line
 ``` js
 // we can use multiple handlers for the same route
app.use('/user', (req, res) => {
    res.send('Hello World');
}, (req, res) => {
    res.send('Hello World Again');
})
app.listen(7777, () => {
    console.log('Server is running on port  http://localhost:7777');
});
 ```
 - If first route handler is not responding then request will hang and timeout will occur when api is called.(case: not using next() )
 - if we use next() "provided by express" then if first handler doesn't response it will go to next and try responding if there is.
 ``` js
 //Code //first handler responed
    app.use('/user', (req, res, next) => {
    console.log("first handler");
    res.send('responed by first handler');
    next();
}, (req, res) => {
    console.log("second handler");
    res.send('responed by second handler');
})
 //Error will be like Cannot set headers after they are sent to the client
 ```
 - if we use next() after responding then first handler will response back but second handler will also run ---> this will give error in console but our API will work fine . Don't Ignore these error as code is still running after response is sent back
 
 
- As soon as our code reaches next(), then next handler goes into callstack and executes line by line. Then second handler starts running when it completes running after sending response back("Second response") then second handlers finishes.
 execution context moves out of callstack and now control return back to function which called next. then response 1 function starts running and gives error as we have already send response back. See Below Code
 ``` js 
 app.use('/user', (req, res, next) => {
    console.log("first handler");
    next(); // goes to next handler and push to callstack
    res.send('responed by first handler');//after second handler completes control return back here and it executes and give errors
}, (req, res) => {
    console.log("second handler");
    res.send('responed by second handler');
})
 ```

 - If after calling next() there is no route handler , then we will get error