import { Menu, Home, User, Settings } from "lucide-react";


function SidebarItem({isOpen, icon, text, onClick}: {isOpen: boolean,icon: React.ReactNode, text?: string, onClick?: () => void}) {
  return (<div className="flex items-center gap-2 whitespace-nowrap" onClick={onClick}>
    {icon}
    {text ? <span
      className={`overflow-hidden transition-all duration-300 ${
        isOpen
          ? "opacity-100 delay-200 max-w-xs w-auto"
          : "opacity-0 max-w-0 w-0"
      }`}
    >
      {text}
    </span> : <></>}
  </div>)
}

export function Sidebar({
  isOpen,
  toggleSidebar,
}: {
  isOpen: boolean;
  toggleSidebar: () => void;
}) {
  return (
    <div
      className={`${
        isOpen ? "w-64" : "w-16"
      } bg-gray-800 text-white p-4 flex flex-col fixed top-0 left-0 h-full transition-width duration-300 overflow-hidden`}
    >
      <nav>
        <div className="space-y-4">
          <SidebarItem isOpen={isOpen} icon={<Menu />} onClick={toggleSidebar} />
          <SidebarItem isOpen={isOpen} icon={<Home />} text="Home" />
          <SidebarItem isOpen={isOpen} icon={<User />} text="Profile" />
          <SidebarItem isOpen={isOpen} icon={<Settings />} text="Settings" />
        </div>
      </nav>
    </div>
  );
}
