const userAuth = (req, res, next) => {
    const token = "xyz";
    if (token != "xyz") {
        res.status(401).send("Unauthorized !! You are not an user");
    }
    else {
        next();
    }
};
module.exports = {
    userAuth
}
// Http status codes 
/*
- 404 request not found
- 200 everything ok
- 401 unauthorised */