function Navbar() {
    return (
        <nav className="border-b border-gray-200 bg-white">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">

                {/* Logo */}
                <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-600 text-lg font-bold text-white">
                        C
                    </div>

                    <span className="text-xl font-bold text-gray-900">
                        Chaibook
                    </span>
                </div>

                {/* Navigation */}
                <div className="hidden items-center gap-6 md:flex">
                    <a
                        href="#"
                        className="text-sm font-medium text-gray-600 hover:text-purple-600"
                    >
                        Dashboard
                    </a>

                    <a
                        href="#"
                        className="text-sm font-medium text-gray-600 hover:text-purple-600"
                    >
                        Sources
                    </a>

                    <a
                        href="#"
                        className="text-sm font-medium text-gray-600 hover:text-purple-600"
                    >
                        Artifacts
                    </a>
                </div>

                {/* User */}
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-100 font-semibold text-purple-700">
                    P
                </div>

            </div>
        </nav>
    );
}

export default Navbar;