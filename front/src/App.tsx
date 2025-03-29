import { ControlBox } from "./parts/ControlBox";
import { ContentArea } from "./parts/ContentArea";
import { Sidebar } from "./parts/Sidebar";
import { Routes, Route } from "react-router-dom";
import { HomeContent } from "./contents/HomeContent";
import { ProfileContent } from "./contents/ProfileContent";
import { SettingsContent } from "./contents/SettingsContent";
import { Topbar } from "./parts/Topbar";

function App() {

  return (
    <>
      <div className="flex flex-col h-screen">
        <Topbar />
        <Sidebar />
        <ContentArea >
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
