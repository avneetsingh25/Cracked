const userModel = require("../models/userSchema");
const jwt=require("jsonwebtoken");        
/*const JWT_SECRET=process.env.JWT_SECRET; */
const bcrypt=require("bcryptjs");
const {generateAccessToken,generateRefreshToken}=require("../utils/token")

async function register(req,res) {
    try{
        const {username,email,password}=req.body;
        const isAlreadyRegistered=await userModel.findOne({
            $or : [{username},{email}]
        });
        if(isAlreadyRegistered){
            return res.status(409).json({
                message : "Username or Email is already registered"
            })
        }
        const hashPassword=await bcrypt.hash(password,10);
        const user=await userModel.create({
            username,
            email,
            password : hashPassword
        });
        const accessToken=generateAccessToken(user._id);
        const refreshToken=generateRefreshToken(user._id);
        user.refreshToken=refreshToken;
        await user.save();
        res.cookie("refreshToken",refreshToken,{
            httpOnly : true,
            secure : false,
            sameSite : "strict",
            maxAge : 7*24*60*60*1000
        });
        return res.status(201).json({
            message : "User Registered Successfully",
            user:{
                id : user._id,
                username : user.username,
                email : user.email
            },
            accessToken
        });
    }catch(err){
        console.error(err);
        return res.status(500).json({
            message : err.message
        });
    }
}

async function getMe(req,res) {
    try{
        return res.status(200).json({
            user : {
                id : req.user._id,
                username : req.user.username,
                email : req.user.email
            }
        });
    }catch(err){
        return res.status(500).json({
            message : err.message
        });
    }
}

async function login(req,res) {
    try{
        const {email,password}=req.body;
        const user=await userModel.findOne({email}); /* check if user exist */
        if(!user){
            return res.status(401).json({
                message : "Invalid credentials"
            });
        }
        const isMatch=await bcrypt.compare(password,user.password); /* Compare password */
        if(!isMatch){
            return res.status(401).json({
                message : "Inavlid credentials"
            });
        }
        const accessToken=generateAccessToken(user._id);
        const refreshToken=generateRefreshToken(user._id);
        user.refreshToken=refreshToken;
        await user.save();
        res.cookie("refreshToken",refreshToken,{
            httpOnly : true,
            secure : false,
            sameSite : "strict",
            maxAge : 7*24*60*60*1000
        });
        return res.status(200).json({
            message : "Login successful",
            user : {
                id : user._id,
                username : user.username,
                email : user.email
            },
            accessToken
        });
    }catch(err){
        return res.status(500).json({
            message : err.message
        });
    }  
}

async function refreshToken(req,res){
    try{
        const refreshToken=req.cookies.refreshToken;
        if(!refreshToken){
            return res.status(400).json({
                message : "Token not found"
            });
        }
        const decoded=jwt.verify(refreshToken,process.env.REFRESH_TOKEN_SECRET);
        const user=await userModel.findById(decoded.id);
        if(!user || user.refreshToken!==refreshToken){
            return res.status(401).json({
                message : "Invalid refresh token"
            });
        }
        const accessToken=generateAccessToken(user._id);
        return res.status(200).json({
            accessToken
        });
    }catch(err){
        return res.status(500).json({
            message : err.message
        });
    }
}
async function logout(req,res) {
    try{
        const refreshToken=req.cookies.refreshToken;
        if(!refreshToken){
            return res.status(400).json({
                message : "User is already logged out"
            });
        }
        const user=await userModel.findOne({refreshToken});
        if(!user){
            return res.status(401).json({
                message : "Invalid refresh token"
            });
        }
        user.refreshToken=null;
        await user.save();
        res.clearCookie("refreshToken",{
            httpOnly : true,
            secure : false,
            sameSite : "strict"
        });
        return res.status(200).json({
            message : "Logout successful"
        });
    }catch(err){
        return res.status(500).json({
            message : err.message
        });
    }
}
module.exports={register,getMe,login,refreshToken,logout};