import type { Express } from "express";

import { workspaceRoutes } from "./workspace.routes.js";
import { memoryRoutes } from "./memory.routes.js";
import { sourceRoutes } from "./source.routes.js";
import { artifactRoutes } from "./artifact.routes.js";
import chatRoutes from "./chat.routes.js";

export function registerRoutes(app: Express): void {
  workspaceRoutes.use("/:workspaceId/sources", sourceRoutes);

  workspaceRoutes.use("/:workspaceId/artifacts", artifactRoutes);

  app.use("/api/workspaces", workspaceRoutes);

  app.use("/api/memory", memoryRoutes);

  app.use("/api", chatRoutes);
}
