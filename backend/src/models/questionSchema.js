const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema({
    interviewId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "interview",
        required: true
    },
    role: {
    type: String,
    required: true,
    trim: true
    },
    questionNumber: {
        type: Number,
        required: true
    },
    topic: {
        type: String,
        required: true,
        trim: true
    },
    questionText: {
        type: String,
        required: true,
        trim: true
    },
    hint: {
        type: String,
        default: ""
    },
    isAnswered: {
        type: Boolean,
        default: false
    },
    generatedByAI: {
        type: Boolean,
        default: true
    }
},
{
    timestamps: true
});

const questionModel = mongoose.model("question", questionSchema);

module.exports = questionModel;