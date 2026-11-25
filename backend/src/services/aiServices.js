const {GoogleGenAI, FunctionResponse} = require("@google/genai");
require("dotenv").config();

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

async function generateQuestions(interview, totalQuestions) {
    try {
        const prompt = `
You are a professional AI interviewer.

Interview Details:
Role: ${interview.role}
Experience Level: ${interview.experienceLevel}
Interview Type: ${interview.interviewType}
Difficulty: ${interview.difficulty}
Duration: ${interview.duration} Minutes

Generate exactly ${totalQuestions} interview questions.

Instructions:
1. Generate exactly ${totalQuestions} questions, no more and no less.
2. Do not repeat any question.
3. Match the selected role, experience level and difficulty.
4. Technical interviews must contain only technical questions.
5. HR interviews must contain only HR questions.
6. Mixed interviews must contain both technical and HR questions.
7. Every question must contain a short hint.
8. Number questions sequentially from 1 to ${totalQuestions}.
9. Return ONLY a valid JSON array without markdown or explanations.

JSON Format:
[
    {
        "questionNumber": 1,
        "topic": "OOP",
        "questionText": "Explain inheritance",
        "hint": "Think about parent and child classes"
    }
]
`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt
        });

        return response.text;
    } catch (err) {
        throw err;
    }
}


async function evaluateAnswers(answers) {
    try {
        const prompt = `
You are an expert technical interviewer.

Evaluate every candidate answer independently.

For each answer return:
- score: a number from 0 to 10
- feedback: a short string explaining the score
- strengths: an array of strings
- improvements: an array of strings
- idealAnswer: a concise, natural sample answer that a candidate could say aloud in an interview

Return exactly one JSON array containing exactly ${answers.length} evaluation objects.
Keep the same order as the input questions.
Do not include markdown, explanations, or any text outside the JSON array.

For idealAnswer:
- Answer directly in a confident, conversational first-person voice where appropriate.
- Keep it concise, usually 2 to 4 sentences.
- Briefly explain the reasoning and add one practical example when useful.
- Avoid textbook-style definitions, essay-like introductions, and unnecessary headings or bullet lists.
- Use a list only when the question explicitly asks for multiple steps or items.

Input:
${JSON.stringify(answers)}
`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json"
            }
        });

        const cleanedText = response.text.trim();
        const evaluation = JSON.parse(cleanedText);

        if (!Array.isArray(evaluation) || evaluation.length !== answers.length) {
            throw new Error("AI returned an incorrect number of evaluations.");
        }

        for (const item of evaluation) {
            if (
                typeof item.score !== "number" ||
                typeof item.feedback !== "string" ||
                typeof item.idealAnswer !== "string" ||
                !Array.isArray(item.strengths) ||
                !Array.isArray(item.improvements)
            ) {
                throw new Error("AI returned an invalid evaluation format.");
            }
        }

        return evaluation;
    } catch (error) {
        console.log("Error evaluating answers:", error);
        throw new Error("Failed to evaluate answers.");
    }
}


async function generateFinalFeedback(result){
    try{
        const prompt = `
You are an expert technical interviewer.
A candidate has completed an interview.

Average Score: ${result.averageScore}/10
Strengths: ${result.strengths.join(", ")}
Areas to Improve: ${result.improvements.join(", ")}

Return ONLY a valid JSON object in this format:
{
  "overallFeedback":"...",
  "recommendation":"...",
  "nextSteps":["...","...","..."]
}

Rules:
1. Talk directly to the candidate using "you" and "your".
2. Keep the tone friendly and professional.
3. Mention what they did well.
4. Mention what they should improve.
5. Give practical next steps.
`;
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt
        });
        const text = response.text;
        const cleanedText = text
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();
        const finalFeedback = JSON.parse(cleanedText);
        return finalFeedback;
    }catch(error){
        console.log("Error generating final feedback:", error);
        throw new Error("Failed to generate final feedback.");
    }
}

module.exports = {generateQuestions,evaluateAnswers,generateFinalFeedback};
    