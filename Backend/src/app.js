const express = require("express");
const cookieParser = require("cookie-parser")
const cors = require("cors")

const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:3000",
    process.env.FRONTEND_URL
]

const app = express();

app.use(express.json());
app.use(cookieParser())
app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error("Not allowed by CORS"));
            }
        },
        credentials: true,
    }),
);

/* require all the routes here */
const authRouter = require("./routes/auth.routes")
const interviewRouter = require("./routes/inteview.routes")


/* using all the routes here */

app.get("/", (req, res) => {
    res.send("Backend service is up and running")
})


app.use("/api/auth", authRouter)
app.use("/api/interview", interviewRouter)

module.exports = app;
