import { useEffect, useRef, useState } from "react";

import { useParams } from "react-router-dom";

import ReactMarkdown from "react-markdown";

import remarkGfm from "remark-gfm";

function getMessageContent(content) {
  if (typeof content === "string") {
    return content;
  }

  if (content == null) {
    return "";
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => getMessageContent(part))
      .filter(Boolean)
      .join("");
  }

  if (typeof content === "object") {
    if (typeof content.text === "string") {
      return content.text;
    }

    if (typeof content.content === "string") {
      return content.content;
    }

    if (Array.isArray(content.content)) {
      return getMessageContent(content.content);
    }

    if (Array.isArray(content.parts)) {
      return getMessageContent(content.parts);
    }

    return "";
  }

  return String(content);
}

function Chat() {
  const { workspaceId } = useParams();

  const [input, setInput] = useState("");

  const [messages, setMessages] = useState([]);

  const [conversationId, setConversationId] = useState(null);

  const [conversations, setConversations] = useState([]);

  const [citations, setCitations] = useState([]);

  const [loading, setLoading] = useState(false);

  const [historyLoading, setHistoryLoading] = useState(true);

  const [creatingChat, setCreatingChat] = useState(false);

  const [deletingChatId, setDeletingChatId] = useState(null);

  const [error, setError] = useState("");

  const [webSearch, setWebSearch] = useState(false);

  const [model, setModel] = useState("gpt-4o-mini");

  const [openMenuId, setOpenMenuId] = useState(null);

  const [editingChatId, setEditingChatId] = useState(null);

  const [editingTitle, setEditingTitle] = useState("");

  const [savingTitle, setSavingTitle] = useState(false);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const menuRef = useRef(null);

  const API_URL = import.meta.env.VITE_API_URL;
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  /*



 * Load the conversation list.



 *



 * We keep the previous conversation id in localStorage only as a



 * convenience so the user can return to the last opened chat.



 */

  const loadConversations = async (selectSavedConversation = true) => {
    if (!workspaceId) return [];

    try {
      setHistoryLoading(true);

      const response = await fetch(
        `${API_URL}/api/workspaces/${workspaceId}/conversations`,

        {
          credentials: "include",
        },
      );

      if (!response.ok) {
        throw new Error("Failed to load conversations.");
      }

      const data = await response.json();

      setConversations(data);

      if (selectSavedConversation) {
        const savedConversationId = localStorage.getItem(
          `conversation-${workspaceId}`,
        );

        const savedConversationExists = data.some(
          (conversation) => conversation.id === savedConversationId,
        );

        if (savedConversationExists) {
          setConversationId(savedConversationId);
        } else if (data.length > 0) {
          setConversationId(data[0].id);

          localStorage.setItem(`conversation-${workspaceId}`, data[0].id);
        } else {
          setConversationId(null);

          localStorage.removeItem(`conversation-${workspaceId}`);
        }
      }

      return data;
    } catch (error) {
      console.error("Failed to load conversations:", error);

      setError("Could not load chat history.");

      return [];
    } finally {
      setHistoryLoading(false);
    }
  }; /*







   * Initial conversation history.







   */

  useEffect(() => {
    loadConversations(true);
  }, [workspaceId]); /*







   * Load messages whenever the selected conversation changes.







   */

  useEffect(() => {
    const loadConversation = async () => {
      if (!workspaceId || !conversationId) {
        setMessages([]);

        setCitations([]);

        return;
      }

      try {
        setError("");

        const response = await fetch(
          `${API_URL}/api/workspaces/${workspaceId}/conversations/${conversationId}/messages`,

          {
            credentials: "include",
          },
        );

        if (!response.ok) {
          throw new Error("Failed to load conversation.");
        }

        const savedMessages = await response.json();

        const formattedMessages = savedMessages.map((message) => ({
          role: message.role === "USER" ? "user" : "assistant",
          content: getMessageContent(message.content),
        }));

        setMessages(formattedMessages);

        const latestAssistantMessage = [...savedMessages]

          .reverse()

          .find((message) => message.role === "ASSISTANT");

        if (latestAssistantMessage?.citations) {
          setCitations(latestAssistantMessage.citations);
        } else {
          setCitations([]);
        }
      } catch (error) {
        console.error("Failed to load conversation:", error);

        setError("Could not load previous conversation.");
      }
    };

    loadConversation();
  }, [workspaceId, conversationId]); /*







   * Create a new empty conversation.







   *







   * This is the ChatGPT-style "+ New Chat" action.







   */

  const handleNewChat = async () => {
    if (!workspaceId || loading || creatingChat) return;

    try {
      setCreatingChat(true);

      setError("");

      const response = await fetch(
        `${API_URL}/api/workspaces/${workspaceId}/conversations`,

        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          credentials: "include",

          body: JSON.stringify({}),
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(
          errorData?.message ||
            errorData?.error ||
            `Failed to create chat: ${response.status}`,
        );
      }

      const newConversation = await response.json();

      setConversationId(newConversation.id);

      setMessages([]);

      setCitations([]);

      localStorage.setItem(`conversation-${workspaceId}`, newConversation.id);

      setConversations((current) => [
        newConversation,

        ...current.filter(
          (conversation) => conversation.id !== newConversation.id,
        ),
      ]);
    } catch (error) {
      console.error("New chat error:", error);

      setError(error.message || "Failed to create a new chat.");
    } finally {
      setCreatingChat(false);
    }
  }; /*







   * Open an existing conversation from the sidebar.







   */

  const handleSelectConversation = (id) => {
    if (loading || id === conversationId) return;

    setError("");

    setConversationId(id);

    setMessages([]);

    setCitations([]);

    localStorage.setItem(`conversation-${workspaceId}`, id);
  }; /*







   * Delete a conversation.







   */

  const handleStartEdit = (event, conversation) => {
    event.stopPropagation();
    setOpenMenuId(null);
    setEditingChatId(conversation.id);
    setEditingTitle(conversation.title || "");
  };

  const handleCancelEdit = (event) => {
    event?.stopPropagation();
    setEditingChatId(null);
    setEditingTitle("");
    setSavingTitle(false);
  };

  const handleSaveTitle = async (event, id) => {
    event?.stopPropagation();

    const title = editingTitle.trim();

    if (!title || savingTitle) {
      return;
    }

    try {
      setSavingTitle(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/workspaces/${workspaceId}/conversations/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ title }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(
          errorData?.message ||
            errorData?.error ||
            `Failed to rename chat: ${response.status}`,
        );
      }

      const updatedConversation = await response.json();

      setConversations((current) =>
        current.map((conversation) =>
          conversation.id === id ? updatedConversation : conversation,
        ),
      );

      setEditingChatId(null);
      setEditingTitle("");
    } catch (error) {
      console.error("Rename chat error:", error);
      setError(error.message || "Failed to rename chat.");
    } finally {
      setSavingTitle(false);
    }
  };

  const handleDeleteConversation = async (event, id) => {
    event.stopPropagation();

    if (loading || deletingChatId) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this chat?",
    );

    if (!confirmed) return;

    try {
      setDeletingChatId(id);

      setError("");

      const response = await fetch(
        `${API_URL}/api/workspaces/${workspaceId}/conversations/${id}`,

        {
          method: "DELETE",

          credentials: "include",
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(
          errorData?.message ||
            errorData?.error ||
            `Failed to delete chat: ${response.status}`,
        );
      }

      const remainingConversations = conversations.filter(
        (conversation) => conversation.id !== id,
      );

      setConversations(remainingConversations);

      if (id === conversationId) {
        const nextConversation = remainingConversations[0];

        if (nextConversation) {
          setConversationId(nextConversation.id);

          localStorage.setItem(
            `conversation-${workspaceId}`,

            nextConversation.id,
          );
        } else {
          setConversationId(null);

          setMessages([]);

          setCitations([]);

          localStorage.removeItem(`conversation-${workspaceId}`);
        }
      }
    } catch (error) {
      console.error("Delete chat error:", error);

      setError(error.message || "Failed to delete chat.");
    } finally {
      setDeletingChatId(null);
    }
  }; /*







   * Send a message to the existing backend chat endpoint.







   *







   * If conversationId is null, the backend automatically creates a







   * conversation from the first user message.







   */

  const handleSend = async () => {
    const text = input.trim();

    if (!text || loading || !workspaceId) {
      return;
    }

    setError("");

    const userMessage = {
      role: "user",

      content: text,
    };

    setMessages((currentMessages) => [...currentMessages, userMessage]);

    setInput("");

    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/api/workspaces/${workspaceId}/chat`,

        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          credentials: "include",

          body: JSON.stringify({
            conversationId,

            model,

            webSearch,

            messages: [
              {
                role: "user",

                parts: [
                  {
                    type: "text",

                    text,
                  },
                ],
              },
            ],
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new Error(
          errorData?.message ||
            errorData?.error ||
            `Chat request failed: ${response.status}`,
        );
      } /*







       * The backend creates a conversation automatically when







       * conversationId is not provided.







       */

      const newConversationId = response.headers.get("X-Conversation-Id");

      if (newConversationId) {
        setConversationId(newConversationId);

        localStorage.setItem(`conversation-${workspaceId}`, newConversationId);
      }

      if (!response.body) {
        throw new Error("No response stream received.");
      } /*







       * Add an empty assistant message first.







       * We update it as text-delta events arrive.







       */

      setMessages((currentMessages) => [
        ...currentMessages,

        {
          role: "assistant",

          content: "",
        },
      ]);

      const reader = response.body.getReader();

      const decoder = new TextDecoder();

      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();

        if (done) {
          break;
        }

        buffer += decoder.decode(value, {
          stream: true,
        });

        const events = buffer.split("\n\n");

        buffer = events.pop() || "";

        for (const event of events) {
          const lines = event.split("\n");

          for (const line of lines) {
            if (!line.startsWith("data:")) {
              continue;
            }

            const data = line.slice(5).trim();

            if (!data || data === "[DONE]") {
              continue;
            }

            try {
              const parsed = JSON.parse(data);

              if (parsed.type === "text-delta") {
                const delta = parsed.delta || "";

                if (!delta) {
                  continue;
                }

                setMessages((currentMessages) => {
                  const updatedMessages = [...currentMessages];

                  const lastMessage =
                    updatedMessages[updatedMessages.length - 1];

                  if (lastMessage && lastMessage.role === "assistant") {
                    updatedMessages[updatedMessages.length - 1] = {
                      ...lastMessage,

                      content: lastMessage.content + delta,
                    };
                  }

                  return updatedMessages;
                });
              }
            } catch (parseError) {
              console.warn("Could not parse stream event:", data);
            }
          }
        }
      } /*







       * The backend has now saved the assistant message and citations.







       * Reload the saved conversation so the UI stays in sync with







       * PostgreSQL.







       */

      if (newConversationId) {
        const messagesResponse = await fetch(
          `${API_URL}/api/workspaces/${workspaceId}/conversations/${newConversationId}/messages`,

          {
            credentials: "include",
          },
        );

        if (messagesResponse.ok) {
          const savedMessages = await messagesResponse.json();

          const latestAssistantMessage = [...savedMessages]

            .reverse()

            .find((message) => message.role === "ASSISTANT");

          if (latestAssistantMessage?.citations) {
            setCitations(latestAssistantMessage.citations);
          } else {
            setCitations([]);
          }
        } /*







         * Refresh sidebar because the conversation title and







         * updatedAt may have changed after the message.







         */

        const updatedConversations = await loadConversations(false);

        setConversations(updatedConversations);
      }
    } catch (error) {
      console.error("Chat error:", error);

      setError(error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();

      handleSend();
    }
  };

  const formatConversationTitle = (conversation) => {
    if (conversation.title?.trim()) {
      return conversation.title;
    }

    return "New Chat";
  };

  return (
    <div className="mx-auto flex h-[calc(100vh-5rem)] w-full max-w-7xl flex-col sm:h-[calc(100vh-7rem)]">
      {/* Header */}{" "}
      <div className="mb-4 sm:mb-5">
        {" "}
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
          Chat with NotebookLLM{" "}
        </h1>{" "}
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300 sm:text-base">
          Ask questions about your learning materials.{" "}
        </p>{" "}
      </div>
      {/* Main Chat Layout */}{" "}
      <div className="flex min-h-0 flex-1 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        {/* Conversation Sidebar */}{" "}
        {sidebarOpen && (
          <aside className="flex w-72 shrink-0 flex-col border-r border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950">
            {" "}
            <div className="flex items-center gap-2 border-b border-gray-200 p-3 dark:border-gray-800">
              {" "}
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                title="Close sidebar"
                className="rounded-lg px-2.5 py-2 text-lg text-gray-600 hover:bg-gray-200 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
              >
                ☰{" "}
              </button>{" "}
              <button
                type="button"
                onClick={handleNewChat}
                disabled={loading || creatingChat}
                className="flex-1 rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {creatingChat ? "Creating..." : "+ New Chat"}{" "}
              </button>{" "}
            </div>{" "}
            <div className="flex-1 overflow-y-auto p-2">
              {" "}
              {historyLoading ? (
                <p className="px-3 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  Loading chats...{" "}
                </p>
              ) : conversations.length === 0 ? (
                <p className="px-3 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  No chats yet.{" "}
                </p>
              ) : (
                <div className="space-y-1">
                  {" "}
                  {conversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className={`group relative flex items-center gap-1 rounded-lg ${
                        conversation.id === conversationId
                          ? "bg-purple-100 dark:bg-purple-950/50"
                          : "hover:bg-gray-100 dark:hover:bg-gray-900"
                      }`}
                    >
                      {" "}
                      {editingChatId === conversation.id ? (
                        <div className="flex min-w-0 flex-1 flex-col gap-2 p-2">
                          {" "}
                          <input
                            autoFocus
                            type="text"
                            value={editingTitle}
                            onChange={(event) =>
                              setEditingTitle(event.target.value)
                            }
                            onKeyDown={(event) => {
                              if (event.key === "Enter") {
                                handleSaveTitle(event, conversation.id);
                              }

                              if (event.key === "Escape") {
                                handleCancelEdit(event);
                              }
                            }}
                            className="w-full rounded-md border border-purple-300 bg-white px-2.5 py-2 text-sm text-gray-900 outline-none focus:border-purple-500 dark:border-purple-700 dark:bg-gray-800 dark:text-white"
                          />{" "}
                          <div className="flex gap-2">
                            {" "}
                            <button
                              type="button"
                              onClick={(event) =>
                                handleSaveTitle(event, conversation.id)
                              }
                              disabled={savingTitle}
                              className="rounded-md bg-purple-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-purple-700 disabled:opacity-50"
                            >
                              {" "}
                              {savingTitle ? "Saving..." : "Save"}{" "}
                            </button>{" "}
                            <button
                              type="button"
                              onClick={handleCancelEdit}
                              disabled={savingTitle}
                              className="rounded-md border border-gray-300 px-2.5 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                            >
                              Cancel{" "}
                            </button>{" "}
                          </div>{" "}
                        </div>
                      ) : (
                        <>
                          {" "}
                          <button
                            type="button"
                            onClick={() =>
                              handleSelectConversation(conversation.id)
                            }
                            disabled={loading}
                            className="min-w-0 flex-1 px-3 py-2.5 text-left text-sm"
                          >
                            {" "}
                            <span className="block truncate font-medium text-gray-800 dark:text-gray-200">
                              {" "}
                              {formatConversationTitle(conversation)}{" "}
                            </span>{" "}
                            <span className="mt-1 block text-xs text-gray-400 dark:text-gray-500">
                              {" "}
                              {new Date(
                                conversation.updatedAt,
                              ).toLocaleDateString()}{" "}
                            </span>{" "}
                          </button>{" "}
                          <div
                            ref={
                              openMenuId === conversation.id ? menuRef : null
                            }
                            className="relative mr-1"
                          >
                            {" "}
                            <button
                              type="button"
                              title="Chat options"
                              onClick={(event) => {
                                event.stopPropagation();

                                setOpenMenuId((current) =>
                                  current === conversation.id
                                    ? null
                                    : conversation.id,
                                );
                              }}
                              className="rounded-md px-2 py-1.5 text-lg leading-none text-gray-400 opacity-0 hover:bg-gray-200 hover:text-gray-700 group-hover:opacity-100 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                            >
                              ⋮{" "}
                            </button>{" "}
                            {openMenuId === conversation.id && (
                              <div className="absolute right-0 top-full z-30 mt-1 w-36 overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-800">
                                {" "}
                                <button
                                  type="button"
                                  onClick={(event) =>
                                    handleStartEdit(event, conversation)
                                  }
                                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                                >
                                  {" "}
                                  <span>✏️</span>
                                  <span>Edit</span>{" "}
                                </button>{" "}
                                <button
                                  type="button"
                                  onClick={(event) =>
                                    handleDeleteConversation(
                                      event,

                                      conversation.id,
                                    )
                                  }
                                  disabled={deletingChatId === conversation.id}
                                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
                                >
                                  {" "}
                                  <span>🗑️</span>
                                  <span>Delete</span>{" "}
                                </button>{" "}
                              </div>
                            )}{" "}
                          </div>{" "}
                        </>
                      )}{" "}
                    </div>
                  ))}{" "}
                </div>
              )}{" "}
            </div>{" "}
          </aside>
        )}
        {/* Chat Content */}{" "}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Mobile New Chat */}{" "}
          <div className="border-b border-gray-200 p-3 dark:border-gray-800 md:hidden">
            {" "}
            <button
              type="button"
              onClick={handleNewChat}
              disabled={loading || creatingChat}
              className="w-full rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {creatingChat ? "Creating..." : "+ New Chat"}{" "}
            </button>{" "}
          </div>
          {/* Messages */}{" "}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {" "}
            {messages.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                {" "}
                <div className="max-w-md px-2 text-center">
                  {" "}
                  <div className="mb-4 text-4xl sm:text-5xl">💬</div>{" "}
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white sm:text-xl">
                    Start a conversation{" "}
                  </h2>{" "}
                  <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400 sm:text-base">
                    Ask NotebookLLM a question about your sources and start
                    learning.{" "}
                  </p>{" "}
                </div>{" "}
              </div>
            ) : (
              <div className="mx-auto flex max-w-3xl flex-col gap-4">
                {" "}
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    {" "}
                    <div className="max-w-[85%] sm:max-w-[75%]">
                      {" "}
                      <div
                        className={`rounded-xl px-4 py-3 text-sm leading-6 ${
                          message.role === "user"
                            ? "bg-purple-600 text-white"
                            : "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100"
                        }`}
                      >
                        {" "}
                        {message.role === "assistant" ? (
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              h1: ({ children }) => (
                                <h1 className="mb-3 text-xl font-bold">
                                  {children}{" "}
                                </h1>
                              ),

                              h2: ({ children }) => (
                                <h2 className="mb-3 text-lg font-bold">
                                  {children}{" "}
                                </h2>
                              ),

                              h3: ({ children }) => (
                                <h3 className="mb-2 text-base font-bold">
                                  {children}{" "}
                                </h3>
                              ),

                              p: ({ children }) => (
                                <p className="mb-3 last:mb-0">{children}</p>
                              ),

                              ul: ({ children }) => (
                                <ul className="mb-3 list-disc space-y-1 pl-5">
                                  {children}{" "}
                                </ul>
                              ),

                              ol: ({ children }) => (
                                <ol className="mb-3 list-decimal space-y-1 pl-5">
                                  {children}{" "}
                                </ol>
                              ),

                              li: ({ children }) => <li>{children}</li>,

                              strong: ({ children }) => (
                                <strong className="font-semibold">
                                  {children}{" "}
                                </strong>
                              ),

                              code: ({ inline, children }) => {
                                if (inline) {
                                  return (
                                    <code className="rounded bg-gray-200 px-1.5 py-0.5 font-mono text-xs dark:bg-gray-700">
                                      {" "}
                                      {children}{" "}
                                    </code>
                                  );
                                }

                                return (
                                  <pre className="my-3 overflow-x-auto rounded-lg bg-gray-900 p-4 text-sm text-gray-100">
                                    {" "}
                                    <code>{children}</code>{" "}
                                  </pre>
                                );
                              },

                              blockquote: ({ children }) => (
                                <blockquote className="my-3 border-l-4 border-purple-400 pl-4 italic text-gray-600 dark:text-gray-300">
                                  {children}{" "}
                                </blockquote>
                              ),

                              table: ({ children }) => (
                                <div className="my-3 overflow-x-auto">
                                  {" "}
                                  <table className="w-full border-collapse text-sm">
                                    {" "}
                                    {children}{" "}
                                  </table>{" "}
                                </div>
                              ),

                              th: ({ children }) => (
                                <th className="border border-gray-300 bg-gray-200 px-3 py-2 text-left font-semibold dark:border-gray-600 dark:bg-gray-700">
                                  {children}{" "}
                                </th>
                              ),

                              td: ({ children }) => (
                                <td className="border border-gray-300 px-3 py-2 dark:border-gray-600">
                                  {children}{" "}
                                </td>
                              ),
                            }}
                            children={getMessageContent(message.content)}
                          />
                        ) : (
                          getMessageContent(message.content)
                        )}{" "}
                      </div>
                      {/* Citations */}{" "}
                      {message.role === "assistant" &&
                        index === messages.length - 1 &&
                        citations.length > 0 &&
                        !loading && (
                          <div className="mt-3 space-y-2">
                            {" "}
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                              Sources{" "}
                            </p>{" "}
                            {citations.map((citation, citationIndex) => (
                              <div
                                key={
                                  citation.chunkId ||
                                  citation.url ||
                                  citationIndex
                                }
                                className="rounded-lg border border-gray-200 bg-white p-3 text-xs shadow-sm dark:border-gray-700 dark:bg-gray-900"
                              >
                                {" "}
                                <div className="flex items-center justify-between gap-3">
                                  {" "}
                                  <p className="font-medium text-gray-900 dark:text-white">
                                    [{citationIndex + 1}]{" "}
                                    {citation.sourceTitle}{" "}
                                  </p>{" "}
                                  {typeof citation.score === "number" && (
                                    <span className="shrink-0 text-gray-500 dark:text-gray-400">
                                      {" "}
                                      {(citation.score * 100).toFixed(1)}%{" "}
                                    </span>
                                  )}{" "}
                                </div>{" "}
                                <p className="mt-1 text-gray-500 dark:text-gray-400">
                                  {" "}
                                  {citation.sourceType}{" "}
                                  {citation.chunkIndex !== undefined &&
                                    ` • Chunk ${citation.chunkIndex}`}{" "}
                                </p>{" "}
                                {citation.url && (
                                  <a
                                    href={citation.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="mt-1 block truncate text-purple-600 hover:underline dark:text-purple-400"
                                  >
                                    {" "}
                                    {citation.url}{" "}
                                  </a>
                                )}{" "}
                                {citation.excerpt && (
                                  <p className="mt-2 line-clamp-3 text-gray-600 dark:text-gray-300">
                                    {" "}
                                    {citation.excerpt}{" "}
                                  </p>
                                )}{" "}
                              </div>
                            ))}{" "}
                          </div>
                        )}{" "}
                    </div>{" "}
                  </div>
                ))}{" "}
                {loading && (
                  <div className="flex justify-start">
                    {" "}
                    <div className="rounded-xl bg-gray-100 px-4 py-3 text-sm text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                      NotebookLLM is thinking...{" "}
                    </div>{" "}
                  </div>
                )}{" "}
              </div>
            )}{" "}
          </div>
          {/* Error */}{" "}
          {error && (
            <div className="border-t border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
              {error}{" "}
            </div>
          )}
          {/* Input */}{" "}
          <div className="border-t border-gray-200 p-3 dark:border-gray-800 sm:p-4">
            {/* Controls */}{" "}
            <div className="mx-auto mb-3 flex max-w-3xl flex-wrap items-center gap-2">
              {/* Model Selector */}{" "}
              <div className="flex items-center gap-2">
                {" "}
                <label
                  htmlFor="model-selector"
                  className="text-sm font-medium text-gray-600 dark:text-gray-300"
                >
                  Model{" "}
                </label>{" "}
                <select
                  id="model-selector"
                  value={model}
                  onChange={(event) => setModel(event.target.value)}
                  disabled={loading}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 outline-none transition-colors focus:border-purple-500 focus:ring-2 focus:ring-purple-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:focus:border-purple-500 dark:focus:ring-purple-950"
                >
                  {" "}
                  <option value="gpt-4o-mini">GPT-4o Mini</option>
                  <option value="gpt-4o">GPT-4o</option>{" "}
                </select>{" "}
              </div>
              {/* Web Search */}{" "}
              <button
                type="button"
                onClick={() => setWebSearch((current) => !current)}
                disabled={loading}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                  webSearch
                    ? "border-purple-300 bg-purple-50 text-purple-700 dark:border-purple-700 dark:bg-purple-950 dark:text-purple-300"
                    : "border-gray-300 bg-white text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                }`}
              >
                <span>🌐</span>{" "}
                <span>Web Search {webSearch ? "On" : "Off"}</span>{" "}
              </button>{" "}
            </div>
            {/* Input */}{" "}
            <div className="mx-auto flex max-w-3xl gap-2 sm:gap-3">
              {" "}
              <input
                type="text"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading}
                placeholder="Ask NotebookLLM anything..."
                className="min-w-0 flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-purple-500 dark:focus:ring-purple-950 sm:px-4 sm:py-3"
              />{" "}
              <button
                type="button"
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="shrink-0 rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50 sm:px-5 sm:py-3 sm:text-base"
              >
                {loading ? "Sending..." : "Send"}{" "}
              </button>{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
}

export default Chat;
