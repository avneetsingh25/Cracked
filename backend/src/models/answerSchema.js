const mongoose=require("mongoose");

const answerSchema=new mongoose.Schema({
    interview : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "interview",
        required : true
    },
    question : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "question",
        required : true
    },
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "user",
        required : true
    },
    answer : {
        type : String,
        required : true,
        trim : true
    },
    score : {
        type : Number,
        min : 0,
        max : 10
    },
    feedback: [
        {
            type: String,
            trim: true
        }
    ],
    strengths: [
        {
            type: String,
            trim: true
        }
    ],
    improvements : [
        {
            type : String,
            trim : true
        }
    ],
    idealAnswer: {
        type: String,
        default: ""
    },
},{timestamps : true}
);

module.exports = mongoose.model("answer", answerSchema);