const jwt=require("jsonwebtoken");
require("dotenv").config();
const ACCESS_TOKEN_SECRET=process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET=process.env.REFRESH_TOKEN_SECRET;

function generateAccessToken(userid){
    return jwt.sign(
        {id : userid},
        ACCESS_TOKEN_SECRET,
        {expiresIn : "30m"}
    );
}
function generateRefreshToken(userid){
    return jwt.sign(
        {id : userid},
        REFRESH_TOKEN_SECRET,
        {expiresIn : "7d"}
    );
}
module.exports={generateAccessToken,generateRefreshToken};