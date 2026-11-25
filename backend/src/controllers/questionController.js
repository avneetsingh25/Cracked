const interviewModel = require("../models/interviewSchema");
const questionModel = require("../models/questionSchema");
const {generateQuestions} = require("../services/aiServices");

const questionLimits = {
    15: 10,
    30: 20,
    45: 30,
    60: 40
};
const questionGenerationPromises = new Map();

function getQuestionLimit(duration) {
    return questionLimits[duration] || 10;
}

async function getInterviewQuestionSet(interviewId, duration) {
    const storedQuestions = await questionModel.find({
        interviewId
    }).sort({ questionNumber: 1, createdAt: 1, _id: 1 });
    const seenQuestionNumbers = new Set();
    const uniqueQuestions = storedQuestions.filter((question) => {
        if (seenQuestionNumbers.has(question.questionNumber)) {
            return false;
        }

        seenQuestionNumbers.add(question.questionNumber);
        return true;
    });

    return uniqueQuestions.slice(0, getQuestionLimit(duration));
}

async function generateInterviewQuestions(req,res){
    try {
        const { interviewId } = req.params;
        // Find Interview
        const interview = await interviewModel.findById(interviewId);
        if (!interview) {
            return res.status(404).json({
                message: "Interview not found"
            });
        }
        // Check Ownership
        if (interview.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: "Unauthorized access"
            });
        }
        if (interview.status === "completed") {
            return res.status(400).json({
                message: "This interview has already been completed."
            });
        }

        const existingQuestions = await getInterviewQuestionSet(
            interviewId,
            interview.duration
        );

        if (existingQuestions.length > 0) {
            interview.status = "ongoing";
            await interview.save();

            return res.status(200).json({
                message: "Existing questions returned",
                totalQuestions: existingQuestions.length,
                questions: existingQuestions
            });
        }
        let generationPromise = questionGenerationPromises.get(interviewId);
        const isGenerationOwner = !generationPromise;

        if (isGenerationOwner) {
            generationPromise = (async () => {
                const totalQuestions = getQuestionLimit(interview.duration);
                const aiResponse = await generateQuestions(interview, totalQuestions);
                const cleanResponse = aiResponse
                    .replace(/```json/g, "")
                    .replace(/```/g, "")
                    .trim();
                const generatedQuestions = JSON.parse(cleanResponse);
                const questionDocuments = generatedQuestions.map((question) => ({
                    interviewId: interview._id,
                    role: interview.role,
                    topic: question.topic,
                    questionNumber: question.questionNumber,
                    questionText: question.questionText,
                    hint: question.hint,
                    isAnswered: false,
                    generatedByAI: true
                }));

                await questionModel.insertMany(questionDocuments);
                interview.status = "ongoing";
                await interview.save();

                return getInterviewQuestionSet(interviewId, interview.duration);
            })();
            questionGenerationPromises.set(interviewId, generationPromise);
        }

        try {
            const questions = await generationPromise;
            return res.status(isGenerationOwner ? 201 : 200).json({
                message: isGenerationOwner
                    ? "Questions generated successfully"
                    : "Existing questions returned",
                totalQuestions: questions.length,
                questions
            });
        } finally {
            if (isGenerationOwner) {
                questionGenerationPromises.delete(interviewId);
            }
        }

    }
    catch (err) {
        return res.status(500).json({
            message: err.message
        });

    }
}

async function getInterviewQuestions(req, res) {
    try {
        const { interviewId } = req.params;
        const interview = await interviewModel.findById(interviewId);

        if (!interview) {
            return res.status(404).json({
                message: "Interview not found"
            });
        }
        if (interview.createdBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: "Unauthorized access"
            });
        }
        const questions = await getInterviewQuestionSet(
            interviewId,
            interview.duration
        );
        return res.status(200).json({
            status: interview.status,
            duration: interview.duration,
            totalQuestions: questions.length,
            questions: questions
        });
    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
}

module.exports = {generateInterviewQuestions,getInterviewQuestions};