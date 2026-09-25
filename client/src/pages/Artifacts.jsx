import Card from "../components/Card";

function Artifacts() {
    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                    Learning Artifacts
                </h1>

                <p className="mt-2 text-gray-600">
                    Generate and review AI-powered learning materials.
                </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <div className="mb-4 text-3xl">📝</div>

                    <h2 className="text-lg font-semibold text-gray-900">
                        Summary
                    </h2>

                    <p className="mt-2 text-sm text-gray-600">
                        Create a concise summary from your learning sources.
                    </p>
                </Card>

                <Card>
                    <div className="mb-4 text-3xl">💡</div>

                    <h2 className="text-lg font-semibold text-gray-900">
                        Takeaways
                    </h2>

                    <p className="mt-2 text-sm text-gray-600">
                        Extract the most important points from your sources.
                    </p>
                </Card>

                <Card>
                    <div className="mb-4 text-3xl">🧠</div>

                    <h2 className="text-lg font-semibold text-gray-900">
                        Flashcards
                    </h2>

                    <p className="mt-2 text-sm text-gray-600">
                        Generate flashcards to reinforce what you learned.
                    </p>
                </Card>

                <Card>
                    <div className="mb-4 text-3xl">❓</div>

                    <h2 className="text-lg font-semibold text-gray-900">
                        Quiz
                    </h2>

                    <p className="mt-2 text-sm text-gray-600">
                        Test your understanding with an AI-generated quiz.
                    </p>
                </Card>

                <Card>
                    <div className="mb-4 text-3xl">🗺️</div>

                    <h2 className="text-lg font-semibold text-gray-900">
                        Mindmap
                    </h2>

                    <p className="mt-2 text-sm text-gray-600">
                        Visualize relationships between important concepts.
                    </p>
                </Card>

                <Card>
                    <div className="mb-4 text-3xl">📊</div>

                    <h2 className="text-lg font-semibold text-gray-900">
                        Report
                    </h2>

                    <p className="mt-2 text-sm text-gray-600">
                        Generate a detailed report from your learning material.
                    </p>
                </Card>
            </div>
        </div>
    );
}

export default Artifacts;