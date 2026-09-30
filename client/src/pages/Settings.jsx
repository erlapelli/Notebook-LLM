import Card from "../components/Card";

function Settings() {
    return (
        <div className="mx-auto w-full max-w-7xl">

            {/* Header */}
            <div className="mb-6 sm:mb-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
                    Settings
                </h1>

                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 sm:text-base">
                    Manage your NotebookLLM preferences and account settings.
                </p>
            </div>

            {/* Settings Sections */}
            <div className="space-y-4 sm:space-y-5">

                {/* Account */}
                <Card>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Account
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300 sm:text-base">
                        Your account information will appear here.
                    </p>
                </Card>

                {/* Preferences */}
                <Card>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Preferences
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300 sm:text-base">
                        Application preferences will be available here.
                    </p>
                </Card>

            </div>
        </div>
    );
}

export default Settings;