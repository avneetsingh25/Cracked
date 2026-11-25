const mongoose=require("mongoose");
const interviewSchema=new mongoose.Schema({
    title : {
        type : String,
        required : true,
        trim : true
    },
    role : {
        type : String,
        required : true,
        trim : true
    },
    experienceLevel : {
        type : String,
        enum : ["Fresher","1-2 Years","3-5 Years","5+ Years"]
    },
    interviewType : {
        type : String,
        required : true,
        enum : ["Technical","HR","Mixed"]
    },
    difficulty : {
        type : String,
        required : true,
        enum : ["Easy","Medium","Hard"]
    },
    duration : {
        type : Number,
        default : 30,
        min : 1
    },
    status : {
        type : String,
        enum : ["pending","ongoing","completed"],
        default : "pending"
    },
    createdBy : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "user",
        required : true
    },
},
{timestamps : true})

module.exports = mongoose.model("interview",interviewSchema);