import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function Chat() {
  const { workspaceId } = useParams();

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);

  const [conversationId, setConversationId] = useState(() =>
    localStorage.getItem(`conversation-${workspaceId}`),
  );

  const [citations, setCitations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [webSearch, setWebSearch] = useState(false);

  // Model selector
  const [model, setModel] = useState("gpt-4o-mini");

  useEffect(() => {
    const loadConversation = async () => {
      if (!workspaceId || !conversationId) {
        return;
      }

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/workspaces/${workspaceId}/conversations/${conversationId}/messages`,
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
          content: message.content,
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
  }, [workspaceId, conversationId]);

  const handleSend = async () => {
    const text = input.trim();

    if (!text || loading) {
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
        `${import.meta.env.VITE_API_URL}/api/workspaces/${workspaceId}/chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",

          body: JSON.stringify({
            conversationId,

            // Send selected model to backend
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
      }

      const newConversationId = response.headers.get("X-Conversation-Id");

      console.log("Conversation ID:", newConversationId);

      if (newConversationId) {
        setConversationId(newConversationId);

        localStorage.setItem(`conversation-${workspaceId}`, newConversationId);
      }

      if (!response.body) {
        throw new Error("No response stream received.");
      }

      /*
       * Add an empty assistant message first.
       * We will keep updating this message as
       * the AI sends text chunks.
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

              /*
               * AI SDK sends text in
               * text-delta events.
               */
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
      }

      /*
       * The stream has finished.
       *
       * The backend has now saved the assistant
       * message together with its citations.
       */
      if (newConversationId) {
        const messagesResponse = await fetch(
          `${import.meta.env.VITE_API_URL}/api/workspaces/${workspaceId}/conversations/${newConversationId}/messages`,
          {
            credentials: "include",
          },
        );

        if (messagesResponse.ok) {
          const savedMessages = await messagesResponse.json();

          /*
           * Find the latest assistant message.
           */
          const latestAssistantMessage = [...savedMessages]
            .reverse()
            .find((message) => message.role === "ASSISTANT");

          /*
           * Store its citations in React state.
           */
          if (latestAssistantMessage?.citations) {
            setCitations(latestAssistantMessage.citations);
          } else {
            setCitations([]);
          }
        }
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

  return (
    <div className="mx-auto flex h-[calc(100vh-5rem)] w-full max-w-7xl flex-col sm:h-[calc(100vh-7rem)]">
      {/* Header */}
      <div className="mb-4 sm:mb-5">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
          Chat with NotebookLLM
        </h1>

        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300 sm:text-base">
          Ask questions about your learning materials.
        </p>
      </div>

      {/* Chat area */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <div className="max-w-md px-2 text-center">
                <div className="mb-4 text-4xl sm:text-5xl">💬</div>

                <h2 className="text-lg font-semibold text-gray-900 dark:text-white sm:text-xl">
                  Start a conversation
                </h2>

                <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400 sm:text-base">
                  Ask NotebookLLM a question about your sources and start
                  learning.
                </p>
              </div>
            </div>
          ) : (
            <div className="mx-auto flex max-w-3xl flex-col gap-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div className="max-w-[85%] sm:max-w-[75%]">
                    {/* Message */}
                    <div
                      className={`rounded-xl px-4 py-3 text-sm leading-6 ${
                        message.role === "user"
                          ? "bg-purple-600 text-white"
                          : "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100"
                      }`}
                    >
                      {message.role === "assistant" ? (
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={{
                            h1: ({ children }) => (
                              <h1 className="mb-3 text-xl font-bold">
                                {children}
                              </h1>
                            ),

                            h2: ({ children }) => (
                              <h2 className="mb-3 text-lg font-bold">
                                {children}
                              </h2>
                            ),

                            h3: ({ children }) => (
                              <h3 className="mb-2 text-base font-bold">
                                {children}
                              </h3>
                            ),

                            p: ({ children }) => (
                              <p className="mb-3 last:mb-0">{children}</p>
                            ),

                            ul: ({ children }) => (
                              <ul className="mb-3 list-disc space-y-1 pl-5">
                                {children}
                              </ul>
                            ),

                            ol: ({ children }) => (
                              <ol className="mb-3 list-decimal space-y-1 pl-5">
                                {children}
                              </ol>
                            ),

                            li: ({ children }) => <li>{children}</li>,

                            strong: ({ children }) => (
                              <strong className="font-semibold">
                                {children}
                              </strong>
                            ),

                            code: ({ inline, children }) => {
                              if (inline) {
                                return (
                                  <code className="rounded bg-gray-200 px-1.5 py-0.5 font-mono text-xs dark:bg-gray-700">
                                    {children}
                                  </code>
                                );
                              }

                              return (
                                <pre className="my-3 overflow-x-auto rounded-lg bg-gray-900 p-4 text-sm text-gray-100">
                                  <code>{children}</code>
                                </pre>
                              );
                            },

                            blockquote: ({ children }) => (
                              <blockquote className="my-3 border-l-4 border-purple-400 pl-4 italic text-gray-600 dark:text-gray-300">
                                {children}
                              </blockquote>
                            ),

                            table: ({ children }) => (
                              <div className="my-3 overflow-x-auto">
                                <table className="w-full border-collapse text-sm">
                                  {children}
                                </table>
                              </div>
                            ),

                            th: ({ children }) => (
                              <th className="border border-gray-300 bg-gray-200 px-3 py-2 text-left font-semibold dark:border-gray-600 dark:bg-gray-700">
                                {children}
                              </th>
                            ),

                            td: ({ children }) => (
                              <td className="border border-gray-300 px-3 py-2 dark:border-gray-600">
                                {children}
                              </td>
                            ),
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      ) : (
                        message.content
                      )}
                    </div>

                    {/* Citations */}
                    {message.role === "assistant" &&
                      index === messages.length - 1 &&
                      citations.length > 0 &&
                      !loading && (
                        <div className="mt-3 space-y-2">
                          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                            Sources
                          </p>

                          {citations.map((citation, citationIndex) => (
                            <div
                              key={citation.chunkId || citationIndex}
                              className="rounded-lg border border-gray-200 bg-white p-3 text-xs shadow-sm dark:border-gray-700 dark:bg-gray-900"
                            >
                              <div className="flex items-center justify-between gap-3">
                                <p className="font-medium text-gray-900 dark:text-white">
                                  [{citationIndex + 1}] {citation.sourceTitle}
                                </p>

                                {typeof citation.score === "number" && (
                                  <span className="shrink-0 text-gray-500 dark:text-gray-400">
                                    {(citation.score * 100).toFixed(1)}%
                                  </span>
                                )}
                              </div>

                              <p className="mt-1 text-gray-500 dark:text-gray-400">
                                {citation.sourceType}
                                {citation.chunkIndex !== undefined &&
                                  ` • Chunk ${citation.chunkIndex}`}
                              </p>

                              {citation.excerpt && (
                                <p className="mt-2 line-clamp-3 text-gray-600 dark:text-gray-300">
                                  {citation.excerpt}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="rounded-xl bg-gray-100 px-4 py-3 text-sm text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                    NotebookLLM is thinking...
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="border-t border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
            {error}
          </div>
        )}

        {/* Input */}
        <div className="border-t border-gray-200 p-3 dark:border-gray-800 sm:p-4">
          {/* Controls */}
          <div className="mx-auto mb-3 flex max-w-3xl flex-wrap items-center gap-2">
            {/* Model Selector */}
            <div className="flex items-center gap-2">
              <label
                htmlFor="model-selector"
                className="text-sm font-medium text-gray-600 dark:text-gray-300"
              >
                Model
              </label>

              <select
                id="model-selector"
                value={model}
                onChange={(event) => setModel(event.target.value)}
                disabled={loading}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 outline-none transition-colors focus:border-purple-500 focus:ring-2 focus:ring-purple-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:focus:border-purple-500 dark:focus:ring-purple-950"
              >
                <option value="gpt-4o-mini">GPT-4o Mini</option>

                <option value="gpt-4o">GPT-4o</option>
              </select>
            </div>

            {/* Web Search */}
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
              <span>🌐</span>

              <span>Web Search {webSearch ? "On" : "Off"}</span>
            </button>
          </div>

          {/* Input */}
          <div className="mx-auto flex max-w-3xl gap-2 sm:gap-3">
            <input
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              placeholder="Ask NotebookLLM anything..."
              className="min-w-0 flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-purple-500 dark:focus:ring-purple-950 sm:px-4 sm:py-3"
            />

            <button
              type="button"
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="shrink-0 rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50 sm:px-5 sm:py-3 sm:text-base"
            >
              {loading ? "Sending..." : "Send"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chat;
