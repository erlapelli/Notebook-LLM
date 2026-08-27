import express from "express";
import "dotenv/config";

const app = express();
const PORT = process.env.PORT;

app.get("/", (req, res) => {
    res.send("Hello World");
})

app.get("/health", (req, res) => {
    res.json({ status: "ok" });
})



app.listen(PORT, () => {
    console.log("Server is runnong on port 8081")
});