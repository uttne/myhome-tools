export function ContentArea({isOpen, children}: {isOpen: boolean, children: React.ReactNode}) {
  return (
    <div
      className={`flex-grow p-4 overflow-auto pb-32 transition-all duration-300 ml-0 ${
        isOpen ? " sm:ml-64" : " sm:ml-16"
      }`}
    >
      {children}
    </div>
  );
}