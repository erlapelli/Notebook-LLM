import { useState } from "react";

import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

function MainLayout({ children }) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const openMobileMenu = () => {
        setIsMobileMenuOpen(true);
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 transition-colors duration-200 dark:bg-gray-950 dark:text-gray-100">
            <Navbar onMenuClick={openMobileMenu} />

            <div className="flex">
                <Sidebar
                    isMobileMenuOpen={isMobileMenuOpen}
                    onClose={closeMobileMenu}
                />

                <main className="min-w-0 flex-1 p-4 sm:p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}

export default MainLayout;