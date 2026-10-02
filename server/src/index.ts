import express from "express";
import "dotenv/config";
import { toNodeHandler } from "better-auth/node";
import { registerRoutes } from "./routes/index.js";
import { errorHandler } from "./middleware/handler.middleware.js";
import { inngest } from "./inngest/client.js";
import { functions } from "./inngest/index.js";
import { serve } from "inngest/express";
import { auth } from "./lib/auth.js";
import cors from "cors";

const app = express();

const PORT = process.env.PORT ?? 8081;

const clientUrl = process.env.CLIENT_URL ?? "http://localhost:5173";

/*
 * CORS configuration
 */
const corsOptions = {
  origin: clientUrl,
  credentials: true,

  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

  allowedHeaders: ["Content-Type", "Authorization"],

  exposedHeaders: ["X-Conversation-Id"],
};

/*
 * Apply CORS to all requests.
 */
app.use(cors(corsOptions));

/*
 * Explicitly handle browser preflight requests.
 *
 * The browser sends an OPTIONS request before
 * PATCH/DELETE/etc. when CORS requires a preflight.
 */
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Origin", clientUrl);

    res.header("Access-Control-Allow-Credentials", "true");

    res.header(
      "Access-Control-Allow-Methods",
      "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    );

    res.header("Access-Control-Allow-Headers", "Content-Type,Authorization");

    res.header("Access-Control-Expose-Headers", "X-Conversation-Id");

    return res.sendStatus(204);
  }

  next();
});

/*
 * Better Auth handler
 *
 * This must stay before express.json().
 */
app.all("/api/auth/{*any}", toNodeHandler(auth));

/*
 * Body parsing middleware
 */
app.use(express.json());

/*
 * Inngest
 */
app.use(
  "/api/inngest",
  serve({
    client: inngest,
    functions,
  }),
);

/*
 * Test route
 */
app.get("/", (req, res) => {
  res.send("Hello World Note");
});

/*
 * Health check
 */
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
  });
});

/*
 * Application routes
 */
registerRoutes(app);

/*
 * Global error handler
 */
app.use(errorHandler);

/*
 * Start server
 */
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
