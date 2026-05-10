require("dotenv").config();
const app = require("./src/app");
const connectToDB = require("./src/config/database")
const {resume, jobDescription, selfDescription} = require("./src/services/temp")
const {generateInterviewReport} = require("./src/services/ai.service")

connectToDB()
generateInterviewReport({resume, jobDescription, selfDescription})


app.listen(3000, () => {
    console.log("server is running on port http://localhost:3000");
});
