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
-----
----

---
## Lecture 10 JWT Token and Authentication
 - When user login, server creates JWT token and send back cookie (which contain jwt token) with response. Now this cookie is stored on user browser
 - Next time when user makes any api call, this cookie is sent with request , server validates this cookie and then responds back to api call
 #### JWT(JSON Web Token) 
 - It is unique token with some secret info embeded into it (encrypted hash). It is generated very differently from password hash.
 - It has three component - header, payload(contains main data), verify signature (to verify token authenticity)
 - to generate use this library npm i jsonwebtoken
- To read cookie, we need middleware (cookie-parser)
- Creating Jwt token and sending with cookie
``` js
var token = await jwt.sign({ id: isUser._id }, "Myserverkey"); //we can add timer to it using options
            console.log(isUser._id)
            res.cookie('token', token);
            res.send("Login Success");
```
#### Validating Token and extracting data
 ``` js
 app.get('/profile', async (req, res) => {
    try {
        const { token } = req.cookies;
        const { id } = await jwt.verify(token, "Myserverkey")
        const userData = await UserModel.findById(id);
        res.send(userData);
    }
    catch {
        res.send("Re-Login !!!")
    }
})
 ```

#### Login (Creating Token)
 ``` js
 app.post('/login', async (req, res) => {
    try {
        validateLogin(req);
        const { emailId, password } = req.body;
        const isUser = await UserModel.findOne({ emailId });
        if (!isUser) {
            throw new Error("Invalid Credentials")
        }
        const isPasswordValid = await bcrypt.compare(password, isUser.password);
        if (isPasswordValid) {
            var token = await jwt.sign({ id: isUser._id }, "Myserverkey",{ expiresIn: "7d" });
            // console.log(isUser._id)
            res.cookie('token', token);
            res.send("Login Success");
        }
        else
            throw new Error("Invalid Credentials")
    } catch (error) {
        res.status(404).send("Error " + error.message)
    }
})
 ```

- Using middleware to make our other api secure
- We will write token validation inside userAuth middleware ; if we want to make any api secure we add userAuth to that api.
#### userAuth
``` js
const jwt = require('jsonwebtoken');
const UserModel = require('../models/user')
const userAuth = async (req, res, next) => {
    try {
        const cookie = req.cookies;
        const { token } = cookie;
        if (!token) {
            throw new Error("Login Agin :)")
        }
        const { id } = jwt.verify(token, "Myserverkey"); //we get decoded data
        const userData = await UserModel.findById(id);
        if (!userData) {
            throw new Error("Invalid User :/")
        }
        req.user = userData;
        //to avoid redundant finding user again and agin for different api calll we can attach it to request.user so we can access it in another middleware
        next();//giving control to next middleware
    } catch (err) {
        res.status(400).send(err.message);
    }
}
module.exports = userAuth;
```


#### Adding middleware
``` js
app.get('/profile', userAuth, async (req, res) => { 
    //added userAuth middleware now that handles all token authentication
    try {
        const userData = req.user;
        res.send(userData);
    }
    catch (err) {
        res.status(400).send("Error " + err.message)
    }
})
```

### Schema Methods -  They are like helper function to do code easy and make code modular
- always use function keyword (don't write arrow function as 'this' performs differently in both of them)
- 'this' will refer to particular document of userModel
``` js
//Schema Methods
userSchema.methods.getJWT = async function () { //always use functin keyword don't use arrrow function here
    const user = this; //'this' will point to user document that we are using
    const token = await jwt.sign({ id: user._id }, "Myserverkey", { expiresIn: '7d' })
    return token;
}

userSchema.methods.validatePassword = async function (passwordInputedByUser) {
    const user = this;
    const isPasswordValid = bcrypt.compare(passwordInputedByUser, user.password) //always maintain order as bcrypt.compare(passwordInputedByUser,passwordInDatabase)
    return isPasswordValid
}
```

##### How to use schema methods ?
- we can use schema method when we are using some user data
``` js
        const User = await UserModel.findOne({ emailId }); //got user
        const isPasswordValid = User.validatePassword(passwordInputedByUser); 
```
---
---
---
## Lecture 11 Diving deep into API's and express route
#### Planing API
- Writing all apis in one file is bad idea
- we will group api's and build different router like
``` python
# authRouter
- POST /signup
- POST /login
- POST /logout

#profile Router
- GET /profile/view
- PATCH /profile/edit
- PATCH /profile/password

#connectionRequestRouter
- POST  /request/send/interested/:useId
- POST /request/send/ignored/:useId
- POST /request/review/accepted/:requestId
- POST /request/review/rejected/:requestId

#userRouter
- GET /user/connections
- GET /user/requests
- GET /user/feed
```
- Routing refers to how an application’s endpoints (URIs) respond to client requests. 
- A router object is an instance of middleware and routes. You can think of it as a “mini-application,” capable only of performing middleware and routing functions. Every Express application has a built-in app router.
- A router behaves like middleware itself, so you can use it as an argument to app.use() or as the argument to another router’s use() method.
- Router's main purpose is to send response back and keep our code clean . It will send first response that it get. Main job of express is to go one by one to route and find path and send response back
``` js
// Using Routes 
app.use('/', authRouter);
app.use('/', profileRouter)
app.use('/', userRouter)
```
- Routes help to categorise api's and make our code modular
``` js
// Profile Route
const express = require('express');
const userAuth = require('../middlewares/userAuth.js');
const profileRouter = express.Router();
profileRouter.get('/profile', userAuth, async (req, res) => {
    try {
        const userData = req.user;
        res.send(userData);
    }
    catch (err) {
        res.status(400).send("Error " + err.message)
    }
})
module.exports = profileRouter;
```
- Express goes one by one and check if router has called path or not and then send response back
#### Logic Building for Api's
##### Update User Profile
``` js
profileRouter.patch('/profile/edit', userAuth, async (req, res) => {
    try {
        const isEditValid = validateEditProfile(req);
        if (!isEditValid) {
            throw new Error(" Field Not Allowed to Edit");
        }
        const loggedUser = req.user;
        Object.keys(req.body).every(key => {
            loggedUser[key] = req.body[key];
        })
        // as loggedUser is instance of user of UserModel so we can do loggedUser.save and call other methods defined in user model also // don't forgot to use await
        await loggedUser.save();
        res.json({
            message: "Successfully Edited",
            user: loggedUser
        })

    } catch (err) {
        res.status(400).send("Error " + err.message);
    }
})
```
- As loggedUser is instance of user (coming from userAuth) of UserModel so we can do loggedUser.save and call other methods defined in user model.
- We can also res.json() :(Best Practice) to properly send response message and updated user so that we can update it on profile

##### Change Password API
``` js
profileRouter.patch('/profile/changepassword', userAuth, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        console.log(currentPassword + newPassword)
        const loggedUser = req.user;
        // always use await if function defined is async
        const isPasswordValid = await loggedUser.validatePassword(currentPassword);
        if (!isPasswordValid) {
            throw new Error("Invalid Credentials :/")
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        loggedUser.password = hashedPassword;
        // loggedUser['password'] = hashedPassword;
        await loggedUser.save();
        res.send("Password Updated");
    } catch (err) {
        res.status(400).send(err.message);
    }
})
```
##### Logout Api
``` js
authRouter.post('/logout', userAuth, async (req, res) => {
    //userAuth is not necessary
    // res.clearCookie('token');
    res.cookie('token', null, { //updated token and expiring it. or we can clear cookie also with above method
        expires: new Date(Date.now())
    }).send("Logout Success")

})
```

---
---
## Lecture 12 Logical DB query
- It is not good practice to add connection requestion between two user info in user schema
- User schema - shows identity of user
- we can make another schema that is maintaing relation/connection request between two user schema
- enum -  object// we can have some fixed values otherwise it thows error
#### connection Model
``` js
const mongoose = require('mongoose');
const connectionRequestSchema = new mongoose.Schema({
    toUserId: {
        type: mongoose.Schema.Types.ObjectId,
        require: true
    },
    fromUserId: {
        type: mongoose.Schema.Types.ObjectId,
        require: true
    },
    status: {
        type: String,
        enum: {
            values: ["accepted", "rejected", "interested", "ignored"],
            message: `Value not valid`
        },
        require: true
    },
}, { timestamps: true })
module.exports = new mongoose.model('ConnectionRequestModel', connectionRequestSchema);
```
#### connectionrouter
``` js
const express = require('express');
const userAuth = require('../middlewares/userAuth');
const ConnectionRequest = require('../models/connectionRequest');
const requestRouter = express.Router();
requestRouter.post('/request/:status/:toUserId', userAuth, async (req, res) => {
    try {
        const fromUserId = req.user._id;
        const toUserId = req.params.toUserId;
        const status = req.params.status;
        const request = await new ConnectionRequest({
            fromUserId,
            toUserId,
            status,
        });
        console.log("Received request:", req.params, req.user);
        await request.save();
        res.send({
            message: `Request ${status}`,
            requestData: request,
        })
    } catch (err) {
        res.status(400).send("Connection Error " + err.message);
    }

})
module.exports = requestRouter;

```
- never miss cornor cases in api calling
- api cases like in our app is - already exist -  to himself - invalid status / user id - already got request and sending one
- always return when using res.json 
```js
 const allowedStatus = ["ignored", "interested"]
        if (!allowedStatus.includes(status)) {
            //always use return otherwise server crashes if we try to sent multiple user request
            return res.status(404).json({ message: `${status} is not valid` })
        }
        // to himself - handled
        if (fromUserId == toUserId) {
            return res.status(404).json({ message: `Cannot send request to own` })
        }
        //user id cannot be random- handled
        const toUser = await UserModel.findById(toUserId);
        if (!toUser) {
            return res.status(404).json({ message: `User does not exists` })
        }

        //request exist and never forget await in db query 
        //new or syntax
        // const connectionreqAlreadyExist = await ConnectionRequest.findOne({
        //     $or: [{ fromUserId: fromUserId, toUserId: toUserId }, { fromUserId: toUserId, toUserId: fromUserId }]
        // })
        const connectionreqAlreadySent = await ConnectionRequest.findOne(
            { fromUserId: fromUserId, toUserId: toUserId }
        )
        if (connectionreqAlreadySent) {
            return res.status(404).json({ message: `Request Already Exist` })
        }
        const connectionreqAlreadyGot = await ConnectionRequest.findOne(
            { fromUserId: toUserId, toUserId: fromUserId })
        if (connectionreqAlreadyGot) {
            return res.status(404).json({ message: `You have already recieved request. Check Request Box` })
        }
```
- Always use arrow function in schema methods
#### pre - it is like middleware at schema level
- it works like event handler it will work before event in schema and always call next() 
- below function will call every time connection model saves
``` js
connectionRequestSchema.pre("save", function () {
    const connectionRequest = this;
    if (connectionRequest.fromUserId.equals(connectionRequest.toUserId)) {
        // we need to use equals as they both are objectid type so need to parse it 
        throw new Error("Can't send request to own id");
    }
    /// always use next as it is like middleware
    next();

})
```
#### DB Indexing in mongo uses B-Tree
- It is to handle large data so schema method don't become too expensive
- mongo automatically creates index for unique:true
- else we can also use index :true
- compound index for two parameters
- don't create lot of index in db
- Use indexes for frequently searched or sorted columns.
- Avoid too many indexes on frequently updated tables.
- Consider using covering indexes or composite indexes if multiple columns are often queried together.
- Indexing comes with cost - Slower Write Operations and storage requirement
``` js
//compound index example
connectionRequestSchema.index({ toUserId: 1, fromUserId: 1 }) 
//1 is ascending and -1 is descending
```

## Lecture 13 Ref Populate Thought
### Making Api for request accepted
- handle param cases like (status can't be anything ,etc),validation is important
- make logic that handles it (like loggedin user should be touserid and only interested one should be there)
``` js
requestRouter.post("/request/review/:status/:requestId", userAuth, async (req, res) => {
    try {
        const AllowedStatus = ["accepted", "rejected"];
        const { status, requestId } = req.params;
        if (!AllowedStatus.includes(status)) {
            return res.status(400).json({ "message": "Status Not Valid" });
        }
        const user = req.user;
        //only finding request that is intereseted and belong to user._id
        const request = await ConnectionRequest.findOne({
            _id: requestId,
            toUserId: user._id,
            status: "interested"
        })
        if (!request) {
            return res.status(404).json({ "message": "Request Not found" });
        }
        request.status = status;
        request.save();
        return res.json({ "message": `Request ${status}`, request });

    }
    catch (err) {
        return res.status(400).json({ "message": "Error in request review " + err.message });
    }
})
```
### Thought Process
#### Post
- how can attacker can exploit our db ? by adding unwanted data in db
- verify everything / validate
#### Get
- sending only allowed data and don't overfetch data (unwanted)
-----
### Referene to other collections
- we can use loop over user collection and get data of requests that user recieved, but that is poor way of getting data
- we can create reference to user collection from connection collection, just add ref field in schema
- populate - it is like join in sql
- populate(), which lets you reference documents in other collections.
- You can set the ref option on ObjectId, Number, String, and Buffer paths. populate() works with ObjectIds, numbers, strings, and buffers. However, we recommend using ObjectIds as _id properties (and thus ObjectIds for ref properties) unless you have a good reason not to. That is because MongoDB will set _id to an ObjectId if you create a new document without an _id property, so if you make your _id property a Number, you need to be extra careful not to insert a document without a numeric _id
``` js
const author = new Person({
  _id: new mongoose.Types.ObjectId(),
  name: 'Ian Fleming',
  age: 50
});

await author.save();

const story1 = new Story({
  title: 'Casino Royale',
  author: author._id // assign the _id from the person
});

await story1.save();
```
- Using .exec() explicitly converts it into a native JavaScript Promise, making it compatible with await and .then().
``` js
const story = await Story.
  findOne({ title: 'Casino Royale' }).
  populate('author').
  exec();
```
-  This enables population, meaning you can retrieve related documents without manually querying them.
- MongoDB (ref + .populate())
- Stores only _id of referenced document
- Requires .populate() to fetch referenced data
``` js
//schema changes
const connectionRequestSchema = new mongoose.Schema({
    toUserId: {
        type: mongoose.Schema.Types.ObjectId,
        //using ref
        ref: "User",
        require: true
    },
    fromUserId: {
        type: mongoose.Schema.Types.ObjectId,
        //using ref and write correct model name that is registered in db
        ref: "User",
        require: true
    },
    status: {
        type: String,
        enum: {
            values: ["accepted", "rejected", "interested", "ignored"],
            message: `Value not valid`
        },
        require: true
    },
}, { timestamps: true })


// in user router
userRouter.get("/user/connections", userAuth, async (req, res) => {
    try {
        const user = req.user;
        const acceptedRequest = await ConnectionRequest.find({
            toUserId: user._id,
            status: "accepted"
        // }).populate('fromUserId', ["firstName", "lastName", "photoUrl", "description", "gender", "age"]) //jisko populatea karna hai uski id aaegi matlab hume fromUserid ki detail chahiye
        }).populate('fromUserId', "firstName lastName photoUrl description gender age") //jisko populatea karna hai uski id aaegi matlab hume fromUserid ki detail chahiye
        .
        return res.json({ "message": "Accepted Requests", acceptedRequest })
    } catch (err) {
        return res.status(400).json({ "message": "Error in getting accepted request box " + err.message });
    }
})
```
Step- What Happens?
1. Query Main Collection - MongoDB fetches the main document (e.g., Story), returning only the _id reference for related documents.
2. Query Referenced Collection - 	Mongoose performs a second query on the referenced collection (e.g., Author) to fetch the full document.
3. Replace ObjectId -	Mongoose replaces the _id reference in the main document with the full referenced document.
Result :	A document with populated data, mimicking a JOIN operation.

#### Connection api
- connection can be np->kartik ; pp->np and both are accepted then both should be connections
``` js
userRouter.get("/user/connections", userAuth, async (req, res) => {
    try {
        const user = req.user;
        const acceptedRequest = await ConnectionRequest.find({
            $or: [{
                toUserId: user._id,
                status: "accepted"
            },
            {
                fromUserId: user._id,
                status: "accepted"
            }]
        }
        ).populate('fromUserId', SAFE_DATA_TO_GET)
            .populate('toUserId', SAFE_DATA_TO_GET)
        const filteredData = acceptedRequest.map(r => {
            // we know that either one of toUserid or fromUserId will be logged in user
            // if (r.toUserId._id == user._id) { // we can't directly equals mongo db ids so conveting ids to string
            if (r.toUserId._id.toString() == user._id.toString()) {
                return r.fromUserId
            }
            return r.toUserId;
        })
        return res.json({ "message": "Accepted Requests", filteredData })
    } catch (err) {
        return res.status(400).json({ "message": "Error in getting accepted request box " + err.message });
    }
})
```
## Lecture 14 Building Fedd
``` js
userRouter.get('/feed', userAuth, async (req, res) => {
    try {
        //pagination 
        //query -> start with ?
        //params ->start with :
        let limit = req.query.limit || 10;
        limit = limit > 10 ? 10 : limit;
        const page = req.query.page || 1;
        let skip = (page - 1) * limit;
        //it is bad to overfetch 
        const user = req.user;
        const sentRequest = await ConnectionRequest.find({
            $or: [{ fromUserId: user._id }, { toUserId: user._id }]
        }).select("fromUserId toUserId");
        // const hideUsers = sentRequest.map((f) => f.toUserId.toString() === user._id.toString() ? f.fromUserId.toString() : f.toUserId.toString())
        const hideUsers = new Set();
        sentRequest.forEach((f) => {
            hideUsers.add(f.fromUserId.toString());
            hideUsers.add(f.toUserId.toString())
        })
        hideUsers.add(user._id)
        // const filteredFeed = feed.filter((f) => {
        //     const fId = f._id.toString();
        //     return fId !== user._id.toString() && !toIds.includes(fId);
        // });
        const filteredFeed = await UserModel.find({
            _id: { $nin: Array.from(hideUsers) } //not in array of hideusers
        }).select(SAFE_DATA_TO_GET).skip(skip).limit(limit) //adding skip and limit for pagination
        res.send(filteredFeed);
    } catch (error) {
        res.status(404).send("Error getting feed: " + error.message)
    }
})
```
### Adding more features like pagination - (getting limited data like feed at a time we only want 10 user on screen)
- skip(x) - mongo skips x element from begining
- limit(x) - how many element we want (x)
/feed?page=1&limit=10 => skip(0)& limit(10)
/feed?page=2&limit=10 => skip(10)& limit(10)
skip = (page-1)*limit
- query -> start with ? -> http://localhost:7777/feed?page=2&limit=10
- params ->start with : 
``` js
 const filteredFeed = await UserModel.find({
            _id: { $nin: Array.from(hideUsers) } //not in array of hideusers
        }).select(SAFE_DATA_TO_GET).skip(skip).limit(limit) //adding skip and limit for pagination
```
- adding skip and limit for pagination

## Lecture Web Sockets
- Socket.IO is a library that enables low-latency, bidirectional (generally api are unidirectional that is client sends request and server responds) and event-based communication between a client and a server.
- Configuration of socket
- create http server of our already running express server
- and pass it to socket
### Inititalise Socket 
#### In backened
``` js
const http = require('http');
const server = http.createServer(app);
initialiseSocket(server);
// then change app (express one) to server.listen
dbconnect().then(() => {
    console.log("DB connected Success")
    server.listen(process.env.PORT, () => {
        console.log("Listening to PORT")
    })
}).catch(() => {
    console.log("DB not connect")
})

```

``` js
const socket = require('socket.io');
const initialiseSocket = (server) => {
    const io = socket(server, {
        cors: {
            origin: ["http://localhost:5173", "https://connect-progammersfrontenet.vercel.app", "http://13.61.7.169/"],
            credentials: true,
        }
    })
    io.on("connection", (socket) => {
        //handle events
         //handle events
        socket.on("joinChat", () => {

        })
        socket.on("sendMessage", () => {

        })
        socket.on("disconnect", () => {

        })
    })
}
module.exports = initialiseSocket;
```
#### In Frontened
- npm install websocket.io

``` js
//socket
//connection to backened
import { io } from "socket.io-client"
import { BASE_URL } from "./constants";

export const createSocketConnection = () => {
    return io(BASE_URL);
}
```
``` js
const Chat = () => {
    const { toUserId } = useParams();
    const user = useSelector()
    useEffect(()=>{
        const socket = createSocketConnection();
        //making join call 
        // emiting an event (basically connecting socket to event)
        socket.emit("joinChat",{toUserId,fromUserId});
    
        //cleanup
        // we also need to handle socket after this page unloads
        return ()=>{
            socket.disconnect();
        }
    },[]);
    ....more

    }
```
``` js
const sendMessage = ()=>{
        const socket = createSocketConnection();
        // emitting sendMessage to server
        if(user)
        socket.emit("sendMessage",{sender:user,toUserId,fromUserId,message:newMessage});
        setNewMessage("")
    }
    useEffect(()=>{
        if(!fromUserId)
            return;
        const socket = createSocketConnection();
        socket.emit("joinChat",{toUserId,fromUserId});
        //when message is recieved
        socket.on("messageRecieved",({sender,toUserId, fromUserId, message})=>{
            console.log(sender?.firstName+" : "+message)
            // appending message to array
            setMessages(messages=> [...messages,{sender,message}]);
        })
        // handling socket connection when this component unloads
        return ()=>{
            socket.disconnect();
        }
    },[toUserId,fromUserId]);
```
#### Security 
- we can increase security by making it difficult to guess roomId

### Saving chat in DB
- Chat Schema
``` js
const mongoose = require('mongoose');
const messageSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        require: true,
    },
    text: {
        type: String,
        require: true,
    }
}, { timestamps: true })

const chatSchema = new mongoose.Schema({
    //using participants array so that multiple people can chat or group chat feature 
    participants: [{ type: mongoose.Types.ObjectId, ref: "User", require: true }],
    messages: [messageSchema],
})


const Chat = mongoose.model("Chat", chatSchema);
module.exports = { Chat };
```
- Socket config
``` js
socket.on("sendMessage", async ({ senderId, toUserId, fromUserId, message }) => {
            try {
                const roomId = getRoomId(toUserId, fromUserId);
                //if chat exist or not
                let chat = await Chat.findOne({ participants: { $all: [toUserId, senderId] } });
                if (!chat) {
                    chat = await new Chat({
                        participants: [senderId, toUserId],
                        messages: []
                    })
                }
                chat.messages.push({ senderId: senderId, text: message });
                await chat.save();
                io.to(roomId).emit("messageRecieved", { senderId, toUserId, fromUserId, message });
            } catch (err) {

            }
        })
```

### Final Files
#### Backened
- Database Model
``` js
const mongoose = require('mongoose');
const messageSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        require: true,
    },
    text: {
        type: String,
        require: true,
    },
    status: {
        type: String,
        default: "Not Seen",
        validate(value) {
            if (!["Seen", "Not Seen"].includes(value)) {
                throw new Error("Message Status Not Valid")
            }
        }
    }
}, { timestamps: true })

const chatSchema = new mongoose.Schema({
    //using participants array so that multiple people can chat or group chat feature 
    participants: [{ type: mongoose.Types.ObjectId, ref: "User", require: true }],
    messages: [messageSchema],
})


const Chat = mongoose.model("Chat", chatSchema);
module.exports = { Chat };
```

- Chat Route
``` js
const express = require('express');
const userAuth = require('../middlewares/userAuth');
const { Chat } = require('../models/chat');
const connectionRequest = require('../models/connectionRequest');
const chatRouter = express.Router();
chatRouter.get("/chat/:toUserId", userAuth, async (req, res) => {
    const fromUserId = req.user._id;
    const { toUserId } = req.params;
    try {
        const areFriend = await connectionRequest.findOne({
            $or: [{
                fromUserId: toUserId,
                toUserId: fromUserId,
                status: "accepted"
            },
            {
                toUserId: toUserId,
                fromUserId: fromUserId,
                status: "accepted"
            }]
        })
        if (!areFriend) {
            throw new Error("Not Friends, Sent Connection Request First");
        }
        let chat = await Chat.findOne({ participants: { $all: [fromUserId, toUserId] } }).populate({
            path: "messages.senderId",
            select: "firstName photoUrl"
        });
        if (!chat) {
            chat = new Chat({
                participants: [fromUserId, toUserId],
                messages: [],
            })
            await chat.save();
        }
        res.json(chat);

    } catch (err) {
        res.status(401).send(err.message)
    }
})
module.exports = chatRouter
```
- Socket.io
``` js

const socket = require('socket.io');
const crypto = require('crypto');
const { Chat } = require('../models/chat');
const connectionRequest = require('../models/connectionRequest');
const initialiseSocket = (server) => {
    const io = socket(server, {
        cors: {
            origin: ["http://localhost:5173", "https://connect-progammersfrontenet.vercel.app", "http://13.61.7.169/"],
            credentials: true,
        }
    })
    const getRoomId = (toUserId, fromUserId) => {
        return crypto.createHash('sha256').update([toUserId, fromUserId].sort().join("$$")).digest('hex');
    }
    io.on("connection", (socket) => {
        socket.on("joinChat", async ({ toUserId, fromUserId }) => {
            const areFriend = await connectionRequest.findOne({
                $or: [{
                    fromUserId: toUserId,
                    toUserId: fromUserId,
                    status: "accepted"
                },
                {
                    toUserId: toUserId,
                    fromUserId: fromUserId,
                    status: "accepted"
                }]
            })
            if (areFriend) {
                const roomId = getRoomId(toUserId, fromUserId);
                socket.join(roomId)
            }
        })
        socket.on("sendMessage", async ({ sender, toUserId, fromUserId, message }) => {
            try {
                const areFriend = await connectionRequest.findOne({
                    $or: [{
                        fromUserId: toUserId,
                        toUserId: fromUserId,
                        status: "accepted"
                    },
                    {
                        toUserId: toUserId,
                        fromUserId: fromUserId,
                        status: "accepted"
                    }]
                })
                if (areFriend) {
                    const roomId = getRoomId(toUserId, fromUserId);
                    //if chat exist or not
                    let chat = await Chat.findOne({ participants: { $all: [toUserId, fromUserId] } });
                    if (!chat) {
                        chat = await new Chat({
                            participants: [fromUserId, toUserId],
                            messages: []
                        })
                    }
                    //pushing message to chat array
                    chat.messages.push({ senderId: fromUserId, text: message });
                    await chat.save();
                    io.to(roomId).emit("messageRecieved", { sender, toUserId, fromUserId, message });
                } else {
                    throw new Error("Not Friends, Sent Connection First")
                }
            } catch (err) {
            }
        })
        socket.on("disconnect", () => {

        })
    })
}
module.exports = initialiseSocket;
```
#### Frontened
- chat.jsx
``` jsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { createSocketConnection } from "../utils/socket";
import { useSelector } from "react-redux";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
const Chat = () => {
  const { toUserId } = useParams();
  const user = useSelector((store) => store.user);
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const fromUserId = user?._id;
  const sendMessage = () => {
    const socket = createSocketConnection();
    // emitting sendMessage to server
    if (user)
      socket.emit("sendMessage", {
        sender: user,
        toUserId,
        fromUserId,
        message: newMessage,
      });
    setNewMessage("");
  };
  const getChat = async () => {
    const messagesGot = await axios.get(
      BASE_URL + `/chat/${toUserId}`,
      {
        withCredentials: true,
      }
    );
    const m = messagesGot?.data?.messages?.map((msg) => {
      return {
        sender: {
          _id: msg.senderId._id,
          firstName: msg.senderId.firstName,
          photoUrl: msg.senderId.photoUrl,
        },
        message: msg.text,
      };
    });

    console.log(messagesGot?.data?.messages);
    setMessages(m);
  };
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom whenever messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    getChat();
  }, []);
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  useEffect(() => {
    if (!fromUserId) return;
    const socket = createSocketConnection();
    socket.emit("joinChat", { toUserId, fromUserId });
    //when message is recieved
    socket.on(
      "messageRecieved",
      ({ sender, toUserId, fromUserId, message }) => {
        console.log(sender?.firstName + " : " + message);
        setMessages((messages) => [...messages, { sender, message }]);
      }
    );
    // handling socket connection when this component unloads
    return () => {
      socket.disconnect();
    };
  }, [toUserId, fromUserId]);
  return (
    <div className="flex flex-col items-center justify-between h-[90vh] bg-base-100 dark:bg-neutral text-base-content p-5 overflow-hidden">
      <div className="flex flex-col w-2/3 bg-base-200 dark:bg-base-300 mt-5 rounded-xl shadow-md h-6/7">
        <div className="flex-grow max-h-full overflow-y-auto p-5 space-y-4">
          {messages.map((m, index) => {
            if (m.sender?._id === user?._id) {
              return (
                <div className="chat chat-end" key={index}>
                  <div className="chat-image avatar">
                    <div className="w-10 rounded-full">
                      <img
                        alt="Tailwind CSS chat bubble component"
                        src={m?.sender?.photoUrl}
                      />
                    </div>
                  </div>
                  <div className="chat-header">
                    {m.sender.firstName}
                  </div>
                  <div className="chat-bubble bg-primary text-primary-content">
                    {m.message}
                  </div>
                </div>
              );
            } else {
              return (
                <div className="chat chat-start" key={index}>
                  <div className="chat-image avatar">
                    <div className="w-10 rounded-full">
                      <img
                        alt="Tailwind CSS chat bubble component"
                        src={m?.sender?.photoUrl}
                      />
                    </div>
                  </div>
                  <div className="chat-header">
                    {m?.sender?.firstName}
                  </div>
                  <div className="chat-bubble bg-accent text-accent-content">
                    {m.message}
                  </div>
                </div>
              );
            }
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Section */}
        <div className="flex items-center gap-2 p-3 bg-base-300 dark:bg-base-200 rounded-b-xl">
          <input
            type="text"
            placeholder="Type a message"
            className="input input-bordered w-full"
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
            }}
          />
          <button className="btn btn-primary" onClick={sendMessage}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;

```
### On production
- Normally it will not work, we have to do this in frontened in socket config
``` js
import { io } from "socket.io-client"
import { BASE_URL } from "./constants";

export const createSocketConnection = () => {
    if (location.hostname === "localhost")
    //our socket connection happens on /socket see in network tab 
        return io(BASE_URL);
    else {
        //by doing this our network connection will happen on /api/socket on production we allowed this
        return io("/", { path: "/api/socket.io" })
    }
}
```

## .env
- as code runs from top to bottom, so when we are requiring something in module then require should be on top of that module to work
``` js
// Not works
const express = require('express');
const { dbconnect } = require('./config/database')
const app = express();
const cookieParser = require('cookie-parser')
const authRouter = require('./routes/auth.js');
const userRouter = require('./routes/user.js');
const connectionHandle = require('./routes/connectionHandle.js')
const profileRouter = require('./routes/profile.js');
const http = require('http');
const cors = require('cors');
const initialiseSocket = require('./utils/socket.js');
const chatRouter = require('./routes/chatroute.js');
require('dotenv').config();///////////<-Not Here->

// Works
require('dotenv').config();//////////<-Here->
const express = require('express');
const { dbconnect } = require('./config/database')
const app = express();
const cookieParser = require('cookie-parser')
const authRouter = require('./routes/auth.js');
const userRouter = require('./routes/user.js');
const connectionHandle = require('./routes/connectionHandle.js')
const profileRouter = require('./routes/profile.js');
const http = require('http');
const cors = require('cors');
const initialiseSocket = require('./utils/socket.js');
const chatRouter = require('./routes/chatroute.js');
```




# Season 3
## Lecture 1
### EC2 Instance
- An EC2 (Elastic Compute Cloud) instance is a virtual server in Amazon Web Services (AWS) that provides scalable computing capacity in the cloud. It allows you to run applications and workloads on AWS without needing to manage physical hardware.
- build
``` js
// setup key file - run as administrator
whoami
icacls "devsecret.pem" /inheritance:r /grant "nitesh:R" /remove Administrators SYSTEM "Authenticated Users" "Users"
icacls "devsecret.pem"

// open terminal
ssh -i "devsecret.pem" ubuntu@ec2-13-61-7-169.eu-north-1.compute.amazonaws.com

// setup frontened
// ngnix
sudo systemctl start nginx
```
- copy build files to /var/www/html/
-scp -copy
 sudo scp -r dist/* /var/www/html/
 - enable port 80 so that nginx starts working 

``` js
// setup backened
```
- we have to enable aws ip from mongo also
- and also port no. in ec2 instance
- when we close teminal backened stops so need package that enables backened to run in background - pm2 (process manager)
- npm install pm2 -g
- pm2 logs - command to check
- pm2 flush <NameofApplication> - to stop process 
- pm2 list
- pm2 stop <Name>
- pm2 delete <name>
- pm2 start npm --name "devConnectBackened" -- start
- now backened running in background

### ngnix mapping port to /api
- ngnix proxy pass
- whenever we make any call it to ip , it first goes to ngnix.
- ngnix can also act as load balancer
``` js
// - config nginx file
 sudo nano /etc/nginx/sites-available/default

//  configurations
location /api/ {
    proxy_pass http://localhost:7777/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}

```
- restart nginx
sudo systemctl restart nginx

#### nginx config for refresh loading
``` js
location / {
    try_files $uri /index.html;
}

location /api/ {
    proxy_pass http://localhost:7777/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}

```
#### Explaination:-  **why that change fixed it**:

---

### 🎯 The Problem

When you typed `/login` in the browser, Nginx looked for a file called `/login` on your server (because of this line in your old config):

```nginx
try_files $uri $uri/ =404;
```

This means:
1. Try to find a file matching the URL path (`$uri`).
2. If it doesn't exist, try treating it as a directory (`$uri/`).
3. If still not found, return a 404.

Since there was **no real file or folder named `/login`**, it showed:

> `404 Not Found nginx/1.24.0`

---


You updated the config to:

```nginx
try_files $uri /index.html;
```

This means:
1. Try to find a file matching the URL path.
2. If it doesn’t exist (like `/login`), **load `/index.html` instead**.

`index.html` is the entry point of your React app — it boots up and handles routing with React Router (or whatever router you're using).

---

### 🚀 Summary

| Without fix | With fix |
|-------------|----------|
| Nginx looks for actual files | Nginx serves `index.html` for all unknown paths |
| `/login` gives 404 | `/login` boots React app and renders the route |
| Client-side routes break | Client-side routing works |

Let me know if you want this added to a `README` or need help setting this up for production builds too.




------
## AWS SES
- We need to create new user IAM and give it permission to run service

## Cron Jobs
- All scheduling things are done using CRON Jobs
- For eg, sending mail to every one who got connection request at 8 am morning 
- Handling Date with date-fns package
- cron.guru webpage to simulate cron string
- bull, beequeue package to maintain queue, when no. of users are increased then sending email can be expensive to we can send mails in batches so that it is non blocking.


## Payment
- First order is created /createorder
- then payment verification /verifypayment
- backened connects to razor pay.
- always relay on backened for amount (value) in order because someone can alter it in frontened and then can buy it in less amount