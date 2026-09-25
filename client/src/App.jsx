import { BrowserRouter, Routes, Route } from "react-router-dom";


import MainLayout from "./layouts/MainLayout";
import Dashboard from "./pages/Dashboard";
import Sources from "./pages/Sources";
import Artifacts from "./pages/Artifacts";

function App() {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/sources" element={<Sources />} />
          <Route path="/artifacts" element={<Artifacts />} />
        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}

export default App;