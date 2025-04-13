import { Outlet } from "react-router-dom";
import { Topbar, Sidebar, ControlBox, ContentArea } from ".";

export function DefaultLayout() {
  return (
    <div className="flex flex-col h-screen">
      <Topbar />
      <Sidebar />
      <ContentArea>
        {/* ネストされたルートのコンポーネントがここにレンダリングされる */}
        <Outlet />
      </ContentArea>
      <ControlBox />
    </div>
  );
};
