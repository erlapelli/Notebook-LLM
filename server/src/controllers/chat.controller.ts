import type { Request, Response } from "express";

import {
  streamWorkspaceChat,
  getConversationMessagesForWorkspace,
  listConversationsForWorkspace,
  createConversationForWorkspace,
  deleteConversationForWorkspace,
  updateConversationForWorkspace,
} from "../services/chat.services.js";

import { ValidationError } from "../types/app-error.js";

/**
 * Main chat endpoint
 */
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

/**
 * Get all conversations for a workspace
 *
 * Used by the ChatGPT-style sidebar/history.
 */
export async function getConversations(req: Request, res: Response) {
  const workspaceId = req.params.workspaceId;

  if (typeof workspaceId !== "string") {
    throw new ValidationError("Invalid workspace id");
  }

  if (!workspaceId) {
    throw new ValidationError("Workspace id is required");
  }

  const conversations = await listConversationsForWorkspace(
    workspaceId,
    req.session.user.id,
  );

  res.json(conversations);
}

/**
 * Create an empty conversation
 *
 * Used when the user clicks "+ New Chat".
 */
export async function createConversation(req: Request, res: Response) {
  const workspaceId = req.params.workspaceId;

  if (typeof workspaceId !== "string") {
    throw new ValidationError("Invalid workspace id");
  }

  if (!workspaceId) {
    throw new ValidationError("Workspace id is required");
  }

  const { title } = req.body ?? {};

  if (title !== undefined && title !== null && typeof title !== "string") {
    throw new ValidationError("Invalid conversation title");
  }

  const conversation = await createConversationForWorkspace(
    workspaceId,
    req.session.user.id,
    title?.trim() || undefined,
  );

  res.status(201).json(conversation);
}

/**
 * Get messages for one conversation
 */
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

export async function updateConversation(
  req: Request,
  res: Response,
): Promise<void> {
  const { workspaceId, conversationId } = req.params;

  if (typeof workspaceId !== "string" || typeof conversationId !== "string") {
    res.status(400).json({
      message: "Invalid workspace or conversation ID",
    });
    return;
  }

  const { title } = req.body;

  if (typeof title !== "string" || !title.trim()) {
    res.status(400).json({
      message: "Conversation title is required",
    });
    return;
  }

  const updatedConversation = await updateConversationForWorkspace(
    workspaceId,
    conversationId,
    req.session.user.id,
    title.trim(),
  );

  res.json(updatedConversation);
}

/**
 * Delete a conversation
 */
export async function deleteConversation(req: Request, res: Response) {
  const workspaceId = req.params.workspaceId;
  const conversationId = req.params.conversationId;

  if (typeof workspaceId !== "string") {
    throw new ValidationError("Invalid workspace id");
  }

  if (typeof conversationId !== "string") {
    throw new ValidationError("Invalid conversation id");
  }

  await deleteConversationForWorkspace(
    workspaceId,
    conversationId,
    req.session.user.id,
  );

  res.status(204).send();
}
