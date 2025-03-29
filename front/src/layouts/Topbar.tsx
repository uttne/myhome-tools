import { Home, Menu, Settings, User, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function TopbarDialogItem({
  icon,
  text,
  path,
  onClick,
}: {
  icon: React.ReactNode;
  text?: string;
  path: string;
  onClick?: () => void;
}) {
  const navigate = useNavigate();

  return (
    <div
      className="flex items-center gap-2 whitespace-nowrap p-2 cursor-pointer"
      onClick={() => {
        navigate(path);
        if (onClick) onClick();
      }}
    >
      {icon}

      <span className="overflow-hidden transition-all duration-300 opacity-100 delay-200 max-w-xs w-auto">
        {text}
      </span>
    </div>
  );
}

export function Topbar() {
  const [isMenuOpen, setMenuOpen] = useState(false);
  return (
    <div className="sm:hidden fixed top-0 left-0 w-full bg-gray-800 text-white h-14 px-4 flex justify-between items-center z-20">
      <h1 className="text-lg font-semibold">App Title</h1>
      <button onClick={() => setMenuOpen(true)}>
        <Menu />
      </button>
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/10 backdrop-blur-[2px] flex justify-center items-center z-30"
          onClick={() => setMenuOpen(false)}
        >
          <div
            className="bg-white p-6 rounded-lg shadow-lg w-64"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <button
              className="mb-4 ml-auto flex bg-black cursor-pointer"
              onClick={() => setMenuOpen(false)}
            >
              <X />
            </button>
            <nav>
              <div className="space-y-4 text-black">
                <TopbarDialogItem
                  icon={<Home />}
                  text="Home"
                  path="/"
                  onClick={() => setMenuOpen(false)}
                />
                <TopbarDialogItem
                  icon={<User />}
                  text="Profile"
                  path="/profile"
                  onClick={() => setMenuOpen(false)}
                />
                <TopbarDialogItem
                  icon={<Settings />}
                  text="Settings"
                  path="/settings"
                  onClick={() => setMenuOpen(false)}
                />
              </div>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
