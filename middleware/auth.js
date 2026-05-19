const jwt = require("jsonwebtoken");

function auth(req, res, next){

    try{

        const authHeader = req.headers.authorization;

        if(!authHeader){
            return res.status(401).json({
                success: false,
                message: "No token ❌"
            });
        }

        // ✅ GET TOKEN DIRECTLY
        const token = authHeader;

        // ✅ VERIFY
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

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