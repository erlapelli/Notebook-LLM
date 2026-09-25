import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

function MainLayout({ children }) {
    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="flex">
                <Sidebar />

                <main className="min-w-0 flex-1 p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}

export default MainLayout;