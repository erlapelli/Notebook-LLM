import Card from "../components/Card";

function Sources() {
    return (
        <div className="mx-auto w-full max-w-7xl">

            {/* Header */}
            <div className="mb-6 sm:mb-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
                    Sources
                </h1>

                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 sm:text-base">
                    Manage the learning materials in your workspace.
                </p>
            </div>

            {/* Empty State */}
            <Card>
                <div className="px-2 py-8 text-center sm:px-6 sm:py-10">

                    <div className="mb-4 text-4xl">
                        📚
                    </div>

                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white sm:text-xl">
                        No sources yet
                    </h2>

                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500 dark:text-gray-400 sm:text-base">
                        Upload a document or add a website to start learning.
                    </p>

                </div>
            </Card>

        </div>
    );
}

export default Sources;