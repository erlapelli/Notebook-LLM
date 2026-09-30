function Chat() {
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
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-colors duration-200 dark:border-gray-800 dark:bg-gray-900">

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                    <div className="flex h-full items-center justify-center">
                        <div className="max-w-md px-2 text-center">

                            <div className="mb-4 text-4xl sm:text-5xl">
                                💬
                            </div>

                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white sm:text-xl">
                                Start a conversation
                            </h2>

                            <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400 sm:text-base">
                                Ask NotebookLLM a question about your sources
                                and start learning.
                            </p>

                        </div>
                    </div>
                </div>

                {/* Input area */}
                <div className="border-t border-gray-200 p-3 dark:border-gray-800 sm:p-4">

                    <div className="flex gap-2 sm:gap-3">

                        <input
                            type="text"
                            placeholder="Ask NotebookLLM anything..."
                            className="min-w-0 flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500 dark:focus:border-purple-500 dark:focus:ring-purple-950 sm:px-4 sm:py-3"
                        />

                        <button
                            type="button"
                            className="shrink-0 rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-purple-700 sm:px-5 sm:py-3 sm:text-base"
                        >
                            Send
                        </button>

                    </div>

                </div>

            </div>
        </div>
    );
}

export default Chat;