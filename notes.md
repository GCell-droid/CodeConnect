## Code
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
