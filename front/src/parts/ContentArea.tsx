export function ContentArea({isOpen, children}: {isOpen: boolean, children: React.ReactNode}) {
  return (
    <div
      className={`flex-grow p-4 overflow-auto pb-32 transition-all duration-300 ${
        isOpen ? "ml-64" : "ml-16"
      }`}
    >
      {children}
    </div>
  );
}