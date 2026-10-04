import { Router } from "express";
import { asyncHandler } from "../utils/async-handler.js";
import {
  chat,
  getConversationMessages,
  getConversations,
  createConversation,
  deleteConversation,
} from "../controllers/chat.controller.js";

const chatRoutes = Router();

/**
 * Chat
 */
chatRoutes.post("/workspaces/:workspaceId/chat", asyncHandler(chat));

/**
 * Conversation history
 */
chatRoutes.get(
  "/workspaces/:workspaceId/conversations",
  asyncHandler(getConversations),
);

/**
 * Create new chat
 */
chatRoutes.post(
  "/workspaces/:workspaceId/conversations",
  asyncHandler(createConversation),
);

/**
 * Get messages from one conversation
 */
chatRoutes.get(
  "/workspaces/:workspaceId/conversations/:conversationId/messages",
  asyncHandler(getConversationMessages),
);

/**
 * Delete chat
 */
chatRoutes.delete(
  "/workspaces/:workspaceId/conversations/:conversationId",
  asyncHandler(deleteConversation),
);

export default chatRoutes;
