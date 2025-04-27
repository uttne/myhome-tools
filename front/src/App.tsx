import React, { Suspense } from "react";
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

/* ── ★ デバッグページを dev だけ lazy import ───────── */
const DebugContentLazy = import.meta.env.VITE_SHOW_DEBUG === "true"
  ? React.lazy(() =>
      import("./contents/DebugContent").then((m) => ({
        default: m.DebugContent,
      }))
    )
  : undefined;
/* ──────────────────────────────────────────────── */

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
          <Route
            path="/shopping/manage"
            element={<ShoppingItemManageContent />}
          />
          <Route path="/profile" element={<ProfileContent />} />
          <Route path="/settings" element={<SettingsContent />} />
        </Route>
      </Route>

      {/* --- デバッグ (dev ビルド限定) ---------------------------- */}
      {import.meta.env.DEV && DebugContentLazy && (
        <Route element={<DefaultLayout />}>
          <Route
            path="/debug"
            element={
              <Suspense fallback={null}>
                <DebugContentLazy />
              </Suspense>
            }
          />
        </Route>
      )}

      <Route element={<RequireAuthArea />}>
        <Route element={<DefaultLayout />}>
          <Route path="*" element={<NotFoundContent />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
