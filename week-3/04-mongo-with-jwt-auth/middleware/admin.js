// Middleware for handling auth
const jsonwebtoken = require("jsonwebtoken");
const {Admin} = require("../db/index")


async function adminMiddleware(req, res, next) {
    // Implement admin auth logic
    // You need to check the headers and validate the admin from the admin DB. Check readme for the exact headers to be expected
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
    console.log(process.env.TOKEN_KEY_SECRET);
    
    try {
        const decoded = jsonwebtoken.verify(token, process.env.TOKEN_KEY_SECRET);
        const adminUser = await Admin.findOne({
            username: decoded.username
        })
        if(adminUser){
            next()
        }else{
            throw new Error("yes");
        }
    } catch (err) {
        res.status(401).json({
            msg: "Wrong id"
        })
    }
}

module.exports = adminMiddleware;