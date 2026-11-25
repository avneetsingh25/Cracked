
const express=require("express");
const answerRouter=express.Router();
const authMiddleware=require("../middleware/authMiddleware");
const answerController=require("../controllers/answerController");

answerRouter.post("/save", authMiddleware, answerController.saveAnswer);

answerRouter.post("/submit",authMiddleware,answerController.submitAnswers);

answerRouter.get("/get/:interviewId",authMiddleware,answerController.getAllAnswers);

answerRouter.delete("/delete/:interviewId",authMiddleware,answerController.deleteAnswers);

module.exports=answerRouter;