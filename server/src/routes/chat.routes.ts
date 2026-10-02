import { Router } from "express";
import { asyncHandler } from "../utils/async-handler.js";
import {
  chat,
  getConversationMessages,
} from "../controllers/chat.controller.js";

const chatRoutes = Router();

chatRoutes.post("/workspaces/:workspaceId/chat", asyncHandler(chat));

chatRoutes.get(
  "/workspaces/:workspaceId/conversations/:conversationId/messages",
  asyncHandler(getConversationMessages),
);

export default chatRoutes;
