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

 ### Why we need multiple route handlers ? 
 - For security purposes and making our code clean by not repeating code again and again.
 ---
 #### Middlewares: 
 - Middleware functions are functions that have access to the request object (req), the response object (res), and the next middleware function in the application’s request-response cycle. The next middleware function is commonly denoted by a variable named next.

 #### Middleware functions can perform the following tasks:

- Execute any code.
- Make changes to the request and the response objects.
- End the request-response cycle.
- Call the next middleware function in the stack.
- If the current middleware function does not end the request-response cycle, it must call next() to pass control to the next middleware function. Otherwise, the request will be left hanging.
----
- When we sent request to express server then express will go through all handlers and try to response back if there is no response to sent then it hangs.

 - Each function that express goes through before sending response back are called middlewares. 
 // GET /users => middlewarechain => request handler -> if not found then it hangs
##### See Auth code
``` js
const userAuth = (req, res, next) => {
    const token = "xyz";
    if (token != "xyz") {
        res.status(401).send("Unauthorized !! You are not an user");
    }
    else {
        next();
    }
};
app.use('/admin', adminAuth);
// If we don't use middleware then we have to write the same code for auth for both admin code /update and /delete again
app.get('/admin/updateData', (req, res) => {
    console.log("At /admin/updateData path");
    res.send('Admin data updated');
})
app.get('/admin/deleteData', (req, res) => {
    console.log("At /admin/updateData path");
    res.send('User Data Deleted');
})
```
 ##### Http status codes 

- 404 request not found
- 200 everything ok
- 401 unauthorised
- 500 internal server error
#### .use v/s .all not required

### Error handling in Node
- Always use try and catch to handle erorr gracefully
- We can also use wildcard error handling using .use('/) but always at last of code.
- If we want to handle error gracefully using .use then we have to give one parameter to route handler . Sequence goes like this <b> err, req, res, next</b>  for 4 parameter
#### Code
``` js
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
//output gracefull error of above code
//if we don't use .use at last then it will not handle all errors and can give ugly error.
//if there is try and catch then it will handle error always
```


## Lecture 6 Database

- We use mongoose npm library https://mongoosejs.com/docs/
- Right way to connect to database is to first of all establish connection with database then start listening on server, this method will not cause abnormality(if db connection is not establish then server will not listen)
##### Code
``` js
//database.js
const mongoose = require('mongoose');
const dbconnect = async () => { //mongoose.connect returns promise
    await mongoose.connect("mongodb+srv://niteshpariharprojects:KERv7Qr6GCMaXkoK@connectdevelopers.ij0qf.mongodb.net/")
};
module.exports = {
    dbconnect
}
/////////
const { dbconnect } = require('./config/database')
const app = express();
dbconnect().then(() => {
    console.log("DB connected Success") //if db connection success then only server should listens
    app.listen(7777, () => {
        console.log("Listening to http://localhost:7777")
    })
}).catch(() => {
    console.log("DB not connect")
})
```
- Schema 
- Model: It is basically class which will make its instance when we want to add data in collection
``` js
// for user schema
const mongoose = require('mongoose');
const userSchema = mongoose.Schema({
    firstName: {
        type: String
    },
    lastName: {
        type: String
    },
    gender: {
        type: String
    },
    emailId: {
        type: String
    }
})
const UserModel = mongoose.model("User", userSchema)
// model name always starts with capital letter
module.exports = UserModel
//model is basically class which will make its instance when we want to add user collection
```

- Using .save on instance of user model and adding document (data) to user collection
``` js
const express = require('express');
//correct way to connect to db
const { dbconnect } = require('./config/database')
const UserModel = require('./models/user.js');
const app = express();
app.post('/signup', async (req, res) => { //add user
    //creating new instance of the usermodel
    const user = new UserModel({
        firstName: "Virat",
        lastName: "Kohli",
        gender: "Male",
        emailId: "viratkohli@gmail.com"
    })
    
    try{
    // to save document in user collection in DevConnect Db.. use '.save' on instance of UserModel 
    await user.save() //.save returns promise so use async function
    res.send("Data Added Success")
    }catch{
        res.status(400).send("Error signing up")
    }
})
dbconnect().then(() => {
    console.log("DB connected Success") //if db connection success then only server should listens
    app.listen(7777, () => {
        console.log("Listening to http://localhost:7777")
    })
}).catch(() => {
    console.log("DB not connect")
})
```
- __v in mongo document maintains version of document ; _id is given by mongo and we can also change it but never do it
- Whenever we use some Db operations always wrap them into try and catch block to handle error

----------
-----
____
## Lecture 7 API's

##### Difference between JSON and js object
JSON (JavaScript Object Notation) is a text-based data format designed for data exchange. It is language-independent and follows a strict syntax for storing and transmitting data.
- JSON keys and string values must be enclosed in double quotes.(Json need key as string also)
- It supports only limited data types such as strings, numbers, booleans, arrays, objects, and null.
- Used for transferring data between servers and applications.

JS Object
- A JavaScript Object is a data structure within JavaScript, used to store key-value pairs. It supports a wider range of data types and operations compared to JSON.
-Keys are unquoted (but quotes can be used if needed), and strings can use single or double quotes.
- IMP--JavaScript Objects can include methods (functions as values).
- These are manipulated directly in JavaScript programs.
----
### Sending Data Using API'S
- When we console req.body after sending data then we get undefined as we are sending data in json format but js understand js object so we need middleware that converts (using express json).
- Using middleware,app.use(express.json()) this will work for every request that server recieves
- app.use(()=>{}) then function will work for every request as we did't give any route
``` js
app.use(express.json());// using middleware to use json format //this will work for every request to server as we are not specifying path
app.post('/signup', async (req, res) => { 
    //add user
    // console.log(req); //give big object comes with request
    // console.log(req.body);//our user data will come in body as we are adding in post request //before express.json//undefined as we are not using middleware to convert json into js readable format
    // console.log(req.body) // after using middleware
    creating new instance of the usermodel
    const user = new UserModel(req.body);
   })
   await user.save();
   res.send("Data Added Successfully")

```
### Getting data from database
``` js
app.get('/user', async (req, res) => {
    try {
        const userEmail = req.body.emailId;
        const user = await UserModel.find({ emailId: userEmail }); //return arrays which match emailId
        if (user.length === 0) {
            res.status(404).send("User Not Found");
        } else {
            res.send(user);
        }
    }
    catch {
        res.status(404).send("Unexpected Error")
    }
})
        // const feed = await UserModel.find({}); //if empty then return all elements

```
### Updating user
``` js
        //return user document before
        const user = await UserModel.findOneAndUpdate({ emailId: emailId }, req.body);
        //function findOneAndUpdate(filter, update, options) {}
```
- There are something called option which can be passed and controlling what document will return after/befor update
- findOneAndUpdate is atomic operation

----------
-----
____
## Lecture 8 Data Sanitization

### In schema (at database level checks) || Schema Types
- adding constrain to schema
- required - it is mandatory to enter, specifying in user schema
- unique - to check if email is taken or not (it should be unquiely identified)
- default value
- minlength of string
- min value
- trim remove whitespaces 
- custom validation function - validate(value) function, by default this only works for adding new object. So it will not work for patch. We can 'on' it on update by giving option (runValidator:true) to findbyidandupdate()
- timestamp add with schema , It will automatically add createdAt, UpdatedAt in document
- Validate function:
``` js
//validate function in schema in user model
gender: {
        type: String,
        validate(value) {
            if (!["male", "female"].includes(value)) {
                throw new Error("Gender Not Valid")
            }
        }
    },
//activating for patch also in app.js
const user = await UserModel.findOneAndUpdate({ emailId: emailId }, req.body, { runValidators: true, returnDocument: "after" });//return user document after update
        //function findOneAndUpdate(filter, update, options) {}
```

#### All Schema Types
- required: boolean or function, if true adds a required validator for this property
- default: Any or function, sets a default value for the path. If the value is a function, the return value of the function is used as the default.
- select: boolean, specifies default projections for queries
- validate: function, adds a validator function for this property
- get: function, defines a custom getter for this property using Object.defineProperty().
- set: function, defines a custom setter for this property using Object.defineProperty().
- alias: string, mongoose >= 4.10.0 only. Defines a virtual with the given name that gets/sets this path.
- immutable: boolean, defines path as immutable. Mongoose prevents you from changing immutable paths unless the parent document has isNew: true.
- transform: function, Mongoose calls this function when you call Document#toJSON() function, including when you JSON.stringify() a document.

### API Level Data Sanitization
- use of basic logics
- Data Sanitization - Add API validation for each field
``` js
app.patch('/user/:emailId', async (req, res) => {
    try {
        const emailId = req.params.emailId;//using dynamic route to get email id as it can't be part of allowed update, we don't want emailid to be able to updated
        const ALLOWED_UPDATE = [
            "firstName",
            "lastName",
            "gender",
            "photUrl",
            "age",
            "password",
            "skills",
            "descrption"
        ]
        const isUpdate = Object.keys(req.body).every(k => ALLOWED_UPDATE.includes(k))
        //Object.keys return array of key names
        //.every returns true if every element in array satisfy that condition
        if (!isUpdate) {
            throw new Error("Field Not allowed to update")
        }
        const user = await UserModel.findOneAndUpdate({ emailId: emailId }, req.body, { runValidators: true, returnDocument: "before" });//return user document before update
        //function findOneAndUpdate(filter, update, options) {}
        console.log(user)
        res.send("User Profile Updated")

    } catch (error) {
        res.status(404).send("Unexpected Error " + error.message)
    }
})
dbconnect().then(() => {
    console.log("DB connected Success")
    app.listen(7777, () => {
        console.log("Listening to http://localhost:7777")
    })
}).catch(() => {
    console.log("DB not connect")
})
```
- It becomes difficult to write logic for all validation so we can use npm library called validator to validate
- Never Trust Request.body as it can have anything so validate every field
``` js
// In schema
validate(value) {
            if (!validator.isEmail(value))
                throw new Error("Email Not valid")
        }
```

----------
-----
____
## Lecture 9 Encrypting Password
- Validation Function to validate 
- bcrypt npm package to hash password and validate also
- use helper function validate
- Best way to create user using usermodel is
``` js
        const { firstName, lastName, password, emailId, age, gender, photUrl, skills, description } = req.body; //it extract only meaningful field
 const user = new UserModel({ firstName, lastName, password: hashedPassword, emailId, age, gender, photUrl, skills, description });
 // As it takes only given field. Someone can't enter unwanted field
```
- Using bcrypt
#### Sign Up API with password hashing
```js
app.post('/signup', async (req, res) => {
    try {
        validateSignup(req);
        const { firstName, lastName, password, emailId, age, gender, photUrl, skills, description } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);//.hash returns promise
        console.log(hashedPassword);
        const user = new UserModel({ firstName, lastName, password: hashedPassword, emailId, age, gender, photUrl, skills, description });
        await user.save()
        res.send("Data Added Success")
    }
    catch (error) {
        res.status(404).send("Error " + error.message)
    }
})
```
#### Sign In API
``` js 
// Login API
app.post('/login', async (req, res) => {
    try {
        validateLogin(req);
        const { emailId, password } = req.body;
        const isUser = await UserModel.findOne({ emailId });
        if (!isUser) {
            throw new Error("Invalid Credentials")
        }
        const isPasswordValid = await bcrypt.compare(password, isUser.password);
        if (isPasswordValid)
            res.send("Login Success");
        else
            throw new Error("Invalid Credentials")
    } catch (error) {
        res.status(404).send("Error " + error.message)
    }
})
```