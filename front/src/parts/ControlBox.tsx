import useButtonStore, { ControlButtonData } from "../stores/ButtonStore";


function ControlBoxButton({data}:{data: ControlButtonData}) {

  const color = data.color === "primary" ? "blue" : data.color === "secondary" ? "green" : data.color;
  return (
    <button  className={`bg-${color}-500 text-white px-4 py-2 rounded rounded-full hover:bg-${color}-600 active:scale-95 transition-transform duration-50`}>
      <div className="flex items-center gap-2">
        {data.icon ? data.icon : <></>}
        <span>{data.display}</span>
      </div>
    </button>
  )
}

export function ControlBox() {
  const {buttons} = useButtonStore();
  
  return (
    buttons.length > 0 && (
    <div className="fixed bottom-4 left-0 w-full flex justify-center">
      <div className="relative bg-white p-4 flex justify-center gap-4 rounded-full shadow-xl border border-transparent w-fit">
        <div className="absolute inset-0 rounded-full bg-gradient-to-b from-gray-200 to-gray-400 blur -z-10 w-full h-full"></div>
        {buttons.map((button, index) => (
          <ControlBoxButton key={index} data={button} />
        ))}
      </div>
    </div>
  ));
}
