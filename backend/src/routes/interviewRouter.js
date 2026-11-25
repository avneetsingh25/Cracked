const express=require("express");
const interviewRouter=express.Router();
const interviewController = require("../controllers/interviewController");
const authMiddleware = require("../middleware/authMiddleware");

interviewRouter.post("/create",authMiddleware,interviewController.createInterview);

interviewRouter.get("/getAll",authMiddleware,interviewController.getMyInterviews);

module.exports=interviewRouter;