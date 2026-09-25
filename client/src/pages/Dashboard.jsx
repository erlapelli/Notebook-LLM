import Card from "../components/Card";
import Button from "../components/Button";

function Dashboard() {
    return (
        <div>
            {/* Welcome */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                    Welcome back 👋
                </h1>

                <p className="mt-2 text-gray-600">
                    Continue your learning journey with Chaibook.
                </p>
            </div>

            {/* Quick Actions */}
            <div className="mb-8 grid gap-5 md:grid-cols-3">
                <Card>
                    <div className="mb-4 text-3xl">📚</div>

                    <h2 className="text-lg font-semibold text-gray-900">
                        Add Sources
                    </h2>

                    <p className="mt-2 text-sm text-gray-600">
                        Upload documents or add learning materials to your workspace.
                    </p>

                    <div className="mt-4">
                        <Button>Add Source</Button>
                    </div>
                </Card>

                <Card>
                    <div className="mb-4 text-3xl">💬</div>

                    <h2 className="text-lg font-semibold text-gray-900">
                        Ask Chaibook
                    </h2>

                    <p className="mt-2 text-sm text-gray-600">
                        Ask questions and learn from your saved sources.
                    </p>

                    <div className="mt-4">
                        <Button>Start Chat</Button>
                    </div>
                </Card>

                <Card>
                    <div className="mb-4 text-3xl">✨</div>

                    <h2 className="text-lg font-semibold text-gray-900">
                        Create Artifact
                    </h2>

                    <p className="mt-2 text-sm text-gray-600">
                        Generate summaries, flashcards, quizzes, and more.
                    </p>

                    <div className="mt-4">
                        <Button>Create</Button>
                    </div>
                </Card>
            </div>

            {/* Recent Activity */}
            <Card>
                <h2 className="text-xl font-semibold text-gray-900">
                    Recent Activity
                </h2>

                <p className="mt-2 text-gray-500">
                    Your recent learning activity will appear here.
                </p>
            </Card>
        </div>
    );
}

export default Dashboard;