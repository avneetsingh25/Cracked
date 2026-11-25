const answer=require("../models/answerSchema");
const {generateFinalFeedback}=require("../services/aiServices");

async function getFinalFeedback(req,res){
    try{
        const {interviewId}=req.params;
        const answers = await answer.find({ interview: interviewId })
            .populate("question", "questionNumber topic questionText");
        //console.log("Interview ID:", interviewId);                  temporary log for debugging
        //console.log("Answers found:", answers.length);            temporary log for debugging   
        if(answers.length===0){
            return res.status(404).json({
                success : false,
                message : "No answers found"
            })
        }
        let totalScore=0;
        let strengths=[];
        let improvements=[];
        for(const ans of answers){
            totalScore+=ans.score;
            strengths.push(...ans.strengths);
            improvements.push(...ans.improvements);
        }
        const averageScore=Number((totalScore/answers.length).toFixed(1));

        const finalFeedback=await generateFinalFeedback({
            averageScore,
            strengths,
            improvements
        });
        return res.status(200).json({
            success: true,
            totalQuestions: answers.length,
            averageScore,
            overallFeedback: finalFeedback.overallFeedback,
            recommendation: finalFeedback.recommendation,
            nextSteps: finalFeedback.nextSteps,
            questionResults: answers.map((ans) => ({
                questionNumber: ans.question?.questionNumber,
                topic: ans.question?.topic,
                questionText: ans.question?.questionText,
                answer: ans.answer,
                score: ans.score,
                feedback: ans.feedback,
                strengths: ans.strengths,
                improvements: ans.improvements,
                idealAnswer: ans.idealAnswer
            }))
        });
    }catch(err){
        console.log("Error getting final feedback:", err);
        return res.status(500).json({
            success: false,
            message: "Failed to generate final feedback."
        });
    }
}

module.exports={getFinalFeedback};