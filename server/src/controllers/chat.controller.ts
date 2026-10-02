import type { Request, Response } from "express";
import {
  streamWorkspaceChat,
  getConversationMessagesForWorkspace,
} from "../services/chat.services.js";
import { ValidationError } from "../types/app-error.js";

export async function chat(req: Request, res: Response) {
  const workspaceId = req.params.workspaceId;

  if (typeof workspaceId !== "string") {
    throw new ValidationError("Invalid workspace id");
  }

  if (!workspaceId) {
    throw new ValidationError("Workspace id is required");
  }

  const { conversationId, messages, model, webSearch } = req.body;

  if (!Array.isArray(messages) || messages.length === 0) {
    throw new ValidationError("At least one message is required");
  }

  await streamWorkspaceChat(res, workspaceId, req.session.user.id, {
    conversationId,
    messages,
    model,
    webSearch,
  });
}

export async function getConversationMessages(req: Request, res: Response) {
  const workspaceId = req.params.workspaceId;
  const conversationId = req.params.conversationId;

  if (typeof workspaceId !== "string") {
    throw new ValidationError("Invalid workspace id");
  }

  if (typeof conversationId !== "string") {
    throw new ValidationError("Invalid conversation id");
  }

  const messages = await getConversationMessagesForWorkspace(
    workspaceId,
    conversationId,
    req.session.user.id,
  );

  res.json(messages);
}
