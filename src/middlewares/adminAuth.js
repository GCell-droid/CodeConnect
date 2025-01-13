const adminAuth = (req, res, next) => {
    const token = "xyz1";
    if (token != "xyz") {
        res.status(401).send("Unauthorized !! You are not an admin");
    }
    else {
        next();
    }
};
module.exports = {
    adminAuth
}
// Http status codes 
/*
- 404 request not found
- 200 everything ok
- 401 unauthorised */