const jwt=require("jsonwebtoken");
const userModel=require("../models/userSchema");
require("dotenv").config();
const ACCESS_TOKEN_SECRET=process.env.ACCESS_TOKEN_SECRET;

async function authenticateUser(req,res,next) {
    const authHeader=req.headers.authorization;
    if(!authHeader || !authHeader.startsWith("Bearer ")){
        return res.status(401).json({
            message : "Access token is missing or invalid"
        })
    }
    const token=authHeader.split(" ")[1];

    try{
        const decoded=jwt.verify(token,ACCESS_TOKEN_SECRET);
        const user=await userModel.findById(decoded.id);
        if(!user){
            return res.status(401).json({
                message : "User not found"
            });
        }
        req.user=user;
        next();
    }catch(err){
        return res.status(401).json({
            message : "Invalid or expired access token"
        });
    }
}
module.exports = authenticateUser;