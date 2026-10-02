import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";
import Dashboard from "./pages/Dashboard";
import Sources from "./pages/Sources";
import Artifacts from "./pages/Artifacts";
import Chat from "./pages/Chat";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Workspace from "./pages/Workspace";
import WorkspaceSources from "./pages/WorkspaceSources";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Authentication */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Main application */}
        <Route
          path="/*"
          element={
            <MainLayout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/sources" element={<Sources />} />
                <Route path="/artifacts" element={<Artifacts />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </MainLayout>
          }
        />

        <Route path="/workspaces/:workspaceId" element={<Workspace />} />
        <Route
          path="/workspaces/:workspaceId/sources"
          element={<WorkspaceSources />}
        />

        <Route path="/workspaces/:workspaceId/chat" element={<Chat />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
