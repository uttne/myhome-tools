import { Outlet } from "react-router-dom";

const LoginLayout = () => {
  return (
    <div className="flex flex-col h-screen">
        <Outlet />
    </div>
  );
};

export default LoginLayout;