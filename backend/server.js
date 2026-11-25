require("dotenv").config();
const express=require("express");
const app=express();
const mongoose=require("mongoose");
const cors = require("cors");
const uri=process.env.MONGO_URI;
const authRouter=require("./src/routes/authRouter");
const interviewRouter = require("./src/routes/interviewRouter");
const questionRouter = require("./src/routes/questionRouter");
const answerRouter = require("./src/routes/answerRouter");
const resultRouter = require("./src/routes/resultRouter");
const cookieParser=require("cookie-parser");
const PORT=process.env.PORT || 3000;
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use("/api/auth",authRouter); 
app.use("/api/interview",interviewRouter);
app.use("/api/question", questionRouter);
app.use("/api/answer", answerRouter);
app.use("/api/result", resultRouter);
app.get("/",(req,res) => {
    res.send("Cracked is working successfully");
})
mongoose.connect(uri).then(()=>{
    app.listen(PORT, ()=>{
    console.log("Database connected successfully");
    console.log(`Cracked is opening on port ${PORT}`);
});
})
.catch((err)=>{
    console.error("MongoDb connection error : ",err);
})
/*mongoose.connect(uri)
  .then(() => {
    console.log("Database connected successfully");

    const server = app.listen(PORT, "127.0.0.1", () => {
      console.log(`Listening on ${PORT}`);
      console.log(server.address());
    });

    server.on("error", (err) => {
      console.error("Server Error:", err);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });*/
