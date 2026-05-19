const jwt = require("jsonwebtoken");

const SECRET = process.env.JWT_SECRET;

function auth(req, res, next){

    try{

        // ✅ GET HEADER
        const authHeader = req.headers.authorization;

        // ❌ NO HEADER
        if(!authHeader){
            return res.status(401).json({
                success: false,
                message: "No token ❌"
            });
        }

        // ✅ REMOVE "Bearer "
        const token = authHeader.split(" ")[1];

        // ❌ TOKEN NOT FOUND
        if(!token){
            return res.status(401).json({
                success: false,
                message: "Invalid token format ❌"
            });
        }

        // ✅ VERIFY TOKEN
        const decoded = jwt.verify(token, SECRET);

        // ✅ SAVE USER
        req.user = decoded;

        next();

    }catch(err){

        console.log("AUTH ERROR:", err);

        return res.status(401).json({
            success: false,
            message: "Invalid token ❌"
        });
    }
}

module.exports = auth;




