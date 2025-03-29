import { useSidebarState } from "../stores/SidebarState";

export function ContentArea({children}: {children: React.ReactNode}) {
  const { isOpen } = useSidebarState();
  return (
    <div
      className={`flex-grow p-4 overflow-auto pb-32 transition-all duration-300 mt-14 sm:mt-0 ml-0 ${
        isOpen ? " sm:ml-64" : " sm:ml-16"
      }`}
    >
      {children}
    </div>
  );
}