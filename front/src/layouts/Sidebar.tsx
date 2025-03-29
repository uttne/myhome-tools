import { Menu, Home, User, Settings } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSidebarState } from "../stores/SidebarState";

function SidebarItem({
  icon,
  text,
  path,
}: {
  icon: React.ReactNode;
  text?: string;
  path: string;
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isOpen } = useSidebarState();

  const getActiveClass = () => {
    return location.pathname === path ? "bg-gray-700" : "";
  };
  return (
    <div
      className={`flex items-center gap-2 whitespace-nowrap pr-2 pl-4 py-2 ${getActiveClass()} cursor-pointer duration-100`}
      onClick={() => navigate(path)}
    >
      {icon}
      {text ? (
        <span
          className={`overflow-hidden transition-all duration-300 ${
            isOpen
              ? "opacity-100 delay-200 max-w-xs w-auto"
              : "opacity-0 max-w-0 w-0"
          }`}
        >
          {text}
        </span>
      ) : (
        <></>
      )}
    </div>
  );
}

export function Sidebar() {
  const { isOpen, toggleOpen } = useSidebarState();
  return (
    <div
      className={`${
        isOpen ? "w-64" : "w-16"
      } bg-gray-800 text-white flex flex-col fixed top-0 left-0 h-full transition-width duration-300 overflow-hidden hidden sm:flex`}
    >
      <div
        className="mb-4 ml-auto flex mr-6 mt-4 cursor-pointer"
        onClick={toggleOpen}
      >
        {<Menu />}
      </div>
      <nav>
        <div className="space-y-2">
          <SidebarItem icon={<Home />} text="Home" path={"/"} />
          <SidebarItem
            icon={<User />}
            text="Profile"
            path={"/profile"}
          />
          <SidebarItem
            icon={<Settings />}
            text="Settings"
            path={"/settings"}
          />
        </div>
      </nav>
    </div>
  );
}
