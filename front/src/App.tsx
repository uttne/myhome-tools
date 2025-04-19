import { Routes, Route } from "react-router-dom";
import { HomeContent, ProfileContent, SettingsContent } from "./contents";
import { DefaultLayout } from "./layouts/DefaultLayout";
import LoginLayout from "./layouts/LoginLayout";
import { RequireAuthArea } from "./layouts/RequireAuthArea";
import { LoginContent } from "./contents/LoginContent";
import { NewPasswordContent } from "./contents/NewPasswordContent";
import { NotFoundContent } from "./contents/NotFoundContent";
import { ShoppingContent } from "./contents/ShoppingContent";
import { ShoppingItemManageContent } from "./contents/ShoppingItemManageContent";

function App() {
  return (
    <Routes>
      <Route element={<LoginLayout />}>
        <Route path="/login" element={<LoginContent />} />
        <Route path="/newpassword" element={<NewPasswordContent />} />
      </Route>
      <Route element={<RequireAuthArea />}>
        <Route element={<DefaultLayout />}>
          <Route path="/" element={<HomeContent />} />
          <Route path="/shopping" element={<ShoppingContent />} />
          <Route path="/shopping/manage" element={<ShoppingItemManageContent />} />
          <Route path="/profile" element={<ProfileContent />} />
          <Route path="/settings" element={<SettingsContent />} />
          <Route path="*" element={<NotFoundContent />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
