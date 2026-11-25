const express = require("express");
const questionRouter = express.Router();
const questionController = require("../controllers/questionController");
const authMiddleware = require("../middleware/authMiddleware");

// Generate AI Questions for an Interview
questionRouter.post("/generate/:interviewId",authMiddleware,
    questionController.generateInterviewQuestions);

questionRouter.get("/get/:interviewId",authMiddleware,
    questionController.getInterviewQuestions);
module.exports = questionRouter;