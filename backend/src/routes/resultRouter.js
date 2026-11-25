const express = require("express");
const resultRouter = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const resultController = require("../controllers/resultController");

resultRouter.get("/feedback/:interviewId",authMiddleware,resultController.getFinalFeedback);

module.exports = resultRouter;