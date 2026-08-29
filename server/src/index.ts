import express from "express";
import "dotenv/config";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";

const app = express();
const PORT = process.env.PORT;


app.all("/api/auth/{*any}", toNodeHandler(auth));
// Mount body-parsing middleware after the Better Auth handler.
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Hello World");
})

app.get("/health", (req, res) => {
    res.json({ status: "ok" });
})



app.listen(PORT, () => {
    console.log("Server is runnong on port 8081")
});