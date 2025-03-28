export function ControlBox() {
  return (
    <div className="fixed bottom-4 left-0 w-full flex justify-center">
      <div className="relative bg-white p-4 flex justify-center gap-4 rounded-full shadow-xl border border-transparent w-fit">
        <div className="absolute inset-0 rounded-full bg-gradient-to-b from-gray-200 to-gray-400 blur -z-10 w-full h-full"></div>
        <button className="bg-blue-500 text-white px-4 py-2 rounded rounded-full hover:bg-blue-600">
          ボタン1
        </button>
        <button className="bg-green-500 text-white px-4 py-2 rounded rounded-full hover:bg-green-600">
          ボタン2
        </button>
        <button className="bg-red-500 text-white px-4 py-2 rounded rounded-full hover:bg-red-600">
          ボタン3
        </button>
        <button className="bg-red-500 text-white px-4 py-2 rounded rounded-full hover:bg-red-600">
          ボタン3
        </button>
        <button className="bg-red-500 text-white px-4 py-2 rounded rounded-full hover:bg-red-600">
          ボタン3
        </button>
        <button className="bg-red-500 text-white px-4 py-2 rounded rounded-full hover:bg-red-600">
          ボタン3
        </button>
      </div>
    </div>
  );
}
