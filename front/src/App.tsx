import { Routes, Route } from "react-router-dom";
import { HomeContent, ProfileContent, SettingsContent } from "./contents";
import { DefaultLayout } from "./layouts/DefaultLayout";
import LoginLayout from "./layouts/LoginLayout";

function App() {
  return (
    <Routes>
      <Route element={<DefaultLayout />}>
        <Route path="/" element={<HomeContent />} />
        <Route path="/profile" element={<ProfileContent />} />
        <Route path="/settings" element={<SettingsContent />} />
      </Route>
      <Route path="/login" element={<LoginLayout />} />
    </Routes>
  );
}

export default App;
