const answer = require("../models/answerSchema");
const interview = require("../models/interviewSchema");
const question = require("../models/questionSchema");

const { evaluateAnswers } = require("../services/aiServices");

async function saveAnswer(req, res) {
    try {
        const { interviewId, questionId, answer: userAnswer } = req.body;

        if (!interviewId || !questionId || !userAnswer?.trim()) {
            return res.status(400).json({
                success: false,
                message: "Interview, question and answer are required"
            });
        }

        const existingInterview = await interview.findById(interviewId);

        if (!existingInterview || existingInterview.createdBy.toString() !== req.user._id.toString()) {
            return res.status(404).json({
                success: false,
                message: "Interview not found"
            });
        }

        if (existingInterview.status !== "ongoing") {
            return res.status(400).json({
                success: false,
                message: "Interview is not ongoing"
            });
        }

        const existingQuestion = await question.findOne({
            _id: questionId,
            interviewId
        });

        if (!existingQuestion) {
            return res.status(404).json({
                success: false,
                message: "Question not found"
            });
        }

        const savedAnswer = await answer.findOneAndUpdate(
            {
                interview: interviewId,
                question: questionId,
                user: req.user._id
            },
            {
                $set: { answer: userAnswer.trim() },
                $setOnInsert: {
                    score: 0,
                    feedback: [],
                    strengths: [],
                    improvements: [],
                    idealAnswer: ""
                }
            },
            { new: true, upsert: true, runValidators: true }
        );

        return res.status(200).json({
            success: true,
            message: "Answer saved successfully",
            savedAnswer
        });
    } catch (error) {
        console.log("Error saving answer:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to save answer"
        });
    }
}

async function submitAnswers(req,res){
    try{
        const {interviewId,answers,timedOut}=req.body;
        if(!interviewId || !Array.isArray(answers) || (answers.length === 0 && !timedOut)){
            return res.status(400).json({
                success : false,
                message : "Interview Id or answers are required"
            });
        }
        const existingInterview=await interview.findById(interviewId);
        if(!existingInterview){
            return res.status(404).json({
                message : "Interview not found"
            });
        }
        if (existingInterview.status !== "ongoing") {
            return res.status(400).json({
                message: "Interview has already been submitted or not started."
            });
        }
        const questions=await question.find({
            interviewId : interviewId
        });
        if (questions.length === 0) {
            return res.status(404).json({
                message: "No questions found for this interview."
            });
        }
        const answersForAI=[];
        for (const userAnswer of answers) {
            const currentQuestion = questions.find(
                (q) => q._id.toString() === userAnswer.questionId
            );
            if(!currentQuestion){
                continue;
            }
            answersForAI.push({
                questionId : userAnswer.questionId,
                question : currentQuestion.questionText,
                answer : userAnswer.answer
            });
        }
        //console.log("Submitting interview:", interviewId);                       //temporary log for debugging
        //console.log("Answers received from frontend:", answers.length);         //temporary log for debugging
        //console.log("Answers matched with questions:", answersForAI.length);   //temporary log for debugging
        const evaluation=answersForAI.length > 0
            ? await evaluateAnswers(answersForAI)
            : [];
        /*if(!evaluation){                                    //not necessary as evaluateAnswers
            return res.status(500).json({                       function will do it. 
                message : "Failed to evaluate answers."
            });
        }*/
        for(let i=0; i<answersForAI.length; i++){
            const currentAnswer=answersForAI[i];
            const currentEvaluation=evaluation[i];
            await answer.findOneAndUpdate(
                {
                    interview: interviewId,
                    question: currentAnswer.questionId,
                    user: req.user._id
                },
                {
                    $set: {
                        answer: currentAnswer.answer,
                        score: currentEvaluation.score,
                        feedback: currentEvaluation.feedback,
                        strengths: currentEvaluation.strengths,
                        improvements: currentEvaluation.improvements,
                        idealAnswer: currentEvaluation.idealAnswer
                    }
                },
                { upsert: true, runValidators: true }
            );
        }

        if (timedOut) {
            const submittedQuestionIds = new Set(
                answersForAI.map((item) => item.questionId)
            );

            for (const currentQuestion of questions) {
                if (submittedQuestionIds.has(currentQuestion._id.toString())) {
                    continue;
                }

                await answer.findOneAndUpdate(
                    {
                        interview: interviewId,
                        question: currentQuestion._id,
                        user: req.user._id
                    },
                    {
                        $set: {
                            answer: "No answer submitted before the time limit.",
                            score: 0,
                            feedback: ["No answer submitted before the time limit."],
                            strengths: [],
                            improvements: ["Complete more questions within the time limit."],
                            idealAnswer: ""
                        }
                    },
                    { upsert: true, runValidators: true }
                );
            }
        }
        
        existingInterview.status="completed";
        await existingInterview.save();

        return res.status(200).json({
            success : true,
            message : "Answers submitted successfully",
            evaluation
        });


    }catch(error){
        console.log("Error in submitting answers : ",error);
        res.status(500).json({
            success : false,
            message : "Failed to submit answers"
        });
    }
}

async function getAllAnswers(req,res){
    try{
        const {interviewId} = req.params;
        const allAnswers=await answer.find({
            interview : interviewId
        }).populate("question","questionNumber topic questionText");

        if(allAnswers.length===0){
            return res.status(404).json({
                success : false,
                message : "No answers found"
            });
        }
        return res.status(200).json({
            success : true,
            totalAnswers : allAnswers.length,
            answers : allAnswers
        });
    }catch(error){
        console.log("Error in getting answers : ",error);
        return res.status(500).json({
            message : "Failed to get answers"
        });
    }
}

async function deleteAnswers(req,res){
    try{
        const {interviewId}=req.params;
        const allAnswers=await answer.find({
            interview : interviewId
        });

        if(allAnswers.length===0){
            return res.status(404).json({
                success : false,
                message : "No answers found for this interview"
            });
        }
        await answer.deleteMany({
            interview : interviewId
        });
        return res.status(200).json({
            success : true,
            message : "All answers deleted successfully"
        });
    }catch(err){
        console.log("Error in deleting answers:", err);
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
}
module.exports={saveAnswer,submitAnswers,getAllAnswers,deleteAnswers};