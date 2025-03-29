import { Routes, Route } from "react-router-dom";
import { Topbar, ControlBox, ContentArea, Sidebar } from "./layouts";
import { HomeContent, ProfileContent, SettingsContent } from "./contents";

function App() {
  return (
    <>
      <div className="flex flex-col h-screen">
        <Topbar />
        <Sidebar />
        <ContentArea>
          <Routes>
            <Route path="/" element={<HomeContent />} />
            <Route path="/profile" element={<ProfileContent />} />
            <Route path="/settings" element={<SettingsContent />} />
          </Routes>
        </ContentArea>
        <ControlBox />
      </div>
    </>
  );
}

export default App;
