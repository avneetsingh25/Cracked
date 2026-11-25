const express=require("express");
const authController=require("../controllers/authController");
const authenticateUser=require("../middleware/authMiddleware");
const authRouter=express.Router();

/* POST /api/auth/register */
authRouter.post("/register", authController.register);

/* POST /api/auth/login */
authRouter.post("/login",authController.login);

/* POST /api/auth/refresh-token */
authRouter.post("/refresh-token",authController.refreshToken);

/* POST /api/auth/logout */
authRouter.post("/logout",authController.logout);

/* GET /api/auth/get-me (giving user detail in respose ) */
authRouter.get("/get-me",authenticateUser,authController.getMe);

module.exports=authRouter;