import useControlBoxState, { ControlBoxButtonData } from "../stores/ControlStore";


function ControlBoxButton({data}:{data: ControlBoxButtonData}) {

  return (
    <button  className={`text-black px-4 py-2 rounded-full active:scale-95 transition-transform duration-50`} onClick={data.onClick}>
      <div className="flex items-center gap-2">
        {data.icon ? data.icon : <></>}
        <span>{data.display}</span>
      </div>
    </button>
  )
}

export function ControlBox() {
  const {buttons} = useControlBoxState();
  
  return (
    buttons.length > 0 && (
    <div className="fixed bottom-4 left-0 w-full flex justify-center">
      <div className="relative bg-gray-100 p-4 flex justify-center gap-4 rounded-full shadow-xl border border-transparent w-fit">
        <div className="absolute inset-0 rounded-full bg-gradient-to-b from-gray-200 to-gray-400 blur -z-10 w-full h-full"></div>
        {buttons.map((button, index) => (
          <ControlBoxButton key={index} data={button} />
        ))}
      </div>
    </div>
  ));
}
