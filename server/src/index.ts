import express from "express";
import "dotenv/config";
import { toNodeHandler } from "better-auth/node";
import { registerRoutes } from "./routes/index.js";
import { errorHandler } from "./middleware/handler.middleware.js";
import { inngest } from "./inngest/client.js";
import { functions } from "./inngest/index.js"
import { serve } from "inngest/express";
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

app.use("/api/inngest", serve({ client: inngest, functions }));

app.get("/", (req, res) => {
    res.send("Hello World Note");
})

app.get("/health", (req, res) => {
    res.json({ status: "ok" });
})

registerRoutes(app);
app.use(errorHandler)



app.listen(PORT, () => {
    console.log("Server is runnong on port 8081")
});