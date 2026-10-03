import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";

import Dashboard from "./pages/Dashboard";
import Sources from "./pages/Sources";
import Artifacts from "./pages/Artifacts";
import ArtifactDetails from "./pages/ArtifactDetails";
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
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          {/* Main application */}
          <Route
            path="/*"
            element={
              <MainLayout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/sources" element={<Sources />} />
                  <Route path="/chat" element={<Chat />} />
                  <Route path="/settings" element={<Settings />} />
                </Routes>
              </MainLayout>
            }
          />

          {/* Workspace routes */}
          <Route path="/workspaces/:workspaceId" element={<Workspace />} />

          <Route
            path="/workspaces/:workspaceId/sources"
            element={<WorkspaceSources />}
          />

          {/* Artifacts list */}
          <Route
            path="/workspaces/:workspaceId/artifacts"
            element={<Artifacts />}
          />

          {/* Single artifact details */}
          <Route
            path="/workspaces/:workspaceId/artifacts/:artifactId"
            element={<ArtifactDetails />}
          />

          {/* Chat */}
          <Route path="/workspaces/:workspaceId/chat" element={<Chat />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
