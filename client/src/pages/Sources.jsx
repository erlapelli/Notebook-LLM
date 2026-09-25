import Card from "../components/Card";

function Sources() {
    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                    Sources
                </h1>

                <p className="mt-2 text-gray-600">
                    Manage the learning materials in your workspace.
                </p>
            </div>

            <Card>
                <div className="text-center py-10">
                    <div className="mb-4 text-4xl">📚</div>

                    <h2 className="text-xl font-semibold text-gray-900">
                        No sources yet
                    </h2>

                    <p className="mt-2 text-gray-500">
                        Upload a document or add a website to start learning.
                    </p>
                </div>
            </Card>
        </div>
    );
}

export default Sources;