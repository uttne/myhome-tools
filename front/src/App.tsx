import { Routes, Route } from "react-router-dom";
import { HomeContent, ProfileContent, SettingsContent } from "./contents";
import { DefaultLayout } from "./layouts/DefaultLayout";
import LoginLayout from "./layouts/LoginLayout";
import { RequireAuthArea } from "./layouts/RequireAuthArea";
import { LoginContent } from "./contents/LoginContent";
import { NewPasswordContent } from "./contents/NewPasswordContent";

function App() {
  return (
    <Routes>
      <Route element={<RequireAuthArea />}>
        <Route element={<DefaultLayout />}>
          <Route path="/" element={<HomeContent />} />
          <Route path="/profile" element={<ProfileContent />} />
          <Route path="/settings" element={<SettingsContent />} />
        </Route>
      </Route>
      <Route element={<LoginLayout />}>
        <Route path="/login" element={<LoginContent />} />
        <Route path="/newpassword" element={<NewPasswordContent />} />
      </Route>
    </Routes>
  );
}

export default App;
