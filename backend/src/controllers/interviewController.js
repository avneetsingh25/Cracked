const interviewModel=require("../models/interviewSchema");

async function createInterview(req,res) {
    try{
        const{
            title,
            role,
            experienceLevel,
            interviewType,
            difficulty,
            duration
        } = req.body;
        const interview=await interviewModel.create({
            title,
            role,
            experienceLevel,
            interviewType,
            difficulty,
            duration,
            createdBy : req.user._id
        });
        return res.status(201).json({
            message : "Interview created successfully",
            interview
        });
    }catch(err){
        return res.status(500).json({
            message : err.message
        });
    }   
}

async function getMyInterviews(req,res) {
    try{
        const interviews=await interviewModel
            .find({createdBy : req.user._id})
            .sort({createdAt : -1});
        return res.status(200).json({
            totalInterviews : interviews.length,
            interviews
        });
    }catch(err){
        return res.status(500).json({
            message : err.message
        });
    }
}

module.exports={createInterview,getMyInterviews};