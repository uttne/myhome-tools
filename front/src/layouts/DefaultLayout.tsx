import { Outlet } from "react-router-dom";
import { Topbar, Sidebar, ControlBox, ContentArea } from ".";
import useNavigationState from "../stores/NavigationStore";
import { useEffect } from "react";
import { Home, Settings, ShoppingBasket, User } from "lucide-react";

export function DefaultLayout() {
  const { setNavigations } = useNavigationState();

  useEffect(() => {
    setNavigations([
      { icon: <Home />, display: "Home", path: "/" },
      { icon: <ShoppingBasket />, display: "Shopping List", path: "/shopping" },
      { icon: <User />, display: "Profile", path: "/profile" },
      { icon: <Settings />, display: "Settings", path: "/settings" },
    ]);
  }, [setNavigations]);

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
}
