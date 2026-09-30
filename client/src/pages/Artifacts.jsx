import Card from "../components/Card";

function Artifacts() {
    return (
        <div className="mx-auto w-full max-w-7xl">

            {/* Header */}
            <div className="mb-6 sm:mb-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
                    Learning Artifacts
                </h1>

                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 sm:text-base">
                    Generate and review AI-powered learning materials.
                </p>
            </div>

            {/* Artifact Cards */}
            <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">

                {/* Summary */}
                <Card>
                    <div className="mb-4 text-3xl">
                        📝
                    </div>

                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Summary
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
                        Create a concise summary from your learning sources.
                    </p>
                </Card>

                {/* Takeaways */}
                <Card>
                    <div className="mb-4 text-3xl">
                        💡
                    </div>

                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Takeaways
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
                        Extract the most important points from your sources.
                    </p>
                </Card>

                {/* Flashcards */}
                <Card>
                    <div className="mb-4 text-3xl">
                        🧠
                    </div>

                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Flashcards
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
                        Generate flashcards to reinforce what you learned.
                    </p>
                </Card>

                {/* Quiz */}
                <Card>
                    <div className="mb-4 text-3xl">
                        ❓
                    </div>

                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Quiz
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
                        Test your understanding with an AI-generated quiz.
                    </p>
                </Card>

                {/* Mindmap */}
                <Card>
                    <div className="mb-4 text-3xl">
                        🗺️
                    </div>

                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Mindmap
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
                        Visualize relationships between important concepts.
                    </p>
                </Card>

                {/* Report */}
                <Card>
                    <div className="mb-4 text-3xl">
                        📊
                    </div>

                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Report
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
                        Generate a detailed report from your learning material.
                    </p>
                </Card>

            </div>
        </div>
    );
}

export default Artifacts;