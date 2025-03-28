import { useState } from "react";
import { ControlBox } from "./parts/ControlBox";
import { ContentArea } from "./parts/ContentArea";
import { Sidebar } from "./parts/Sidebar";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { HomeContent } from "./contents/HomeContent";
import { ProfileContent } from "./contents/ProfileContent";
import { SettingsContent } from "./contents/SettingsContent";

function App() {
  const [isOpen, setIsOpen] = useState(true);
  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      <div className="flex flex-col h-screen">
        <Router>
          <Sidebar isOpen={isOpen} toggleSidebar={toggleSidebar} />
          <ContentArea isOpen={isOpen}>
            <Routes>
              <Route path="/" element={<HomeContent />} />
              <Route path="/profile" element={<ProfileContent />} />
              <Route path="/settings" element={<SettingsContent />} />
            </Routes>
          </ContentArea>
          <ControlBox />
        </Router>
      </div>
    </>
  );
}

export default App;
