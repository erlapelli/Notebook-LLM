import express from "express";
import "dotenv/config";
import { toNodeHandler } from "better-auth/node";
import { registerRoutes } from "./routes/index.js";
import { errorHandler } from "./middleware/handler.middleware.js";
import { auth } from "./lib/auth.js";
import cors from "cors";

const app = express();
const PORT = process.env.PORT;
const clientUrl = process.env.CLIENT_URL ?? "http://localhost:3001";

app.use(
    cors({
        origin: clientUrl,
        credentials: true,
    }),
);


app.all("/api/auth/{*any}", toNodeHandler(auth));
// Mount body-parsing middleware after the Better Auth handler.
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Hello World");
})

app.get("/health", (req, res) => {
    res.json({ status: "ok" });
})

registerRoutes(app);
app.use(errorHandler)



app.listen(PORT, () => {
    console.log("Server is runnong on port 8081")
});