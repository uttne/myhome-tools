import { Trash2 } from "lucide-react";


interface DeleteButtonBoxProps {
  display?: string | React.ReactNode;
  disableDeleteButton?: boolean;
  deleteButtonClick: () => void;
  exitDeleteMode: () => void;
}

export function DeleteButtonBox(props: DeleteButtonBoxProps){
  const { display, disableDeleteButton, deleteButtonClick, exitDeleteMode } = props;
  return <div className="fixed bottom-10 left-0 right-0 flex justify-center z-40 pointer-events-none">
  {" "}
  {/* ControlBoxより上に表示するためz-index調整, イベント透過 */}
  <div className="bg-red-600 text-white py-3 px-6 rounded-full shadow-lg flex items-center space-x-4 pointer-events-auto">
    {" "}
    {/* ボタン自体はイベントを受け取る */}
    {display && (typeof display === "string" ? <span>{display}</span> : display)}
    <button
      onClick={deleteButtonClick}
      className="flex items-center space-x-2 bg-red-700 hover:bg-red-800 px-4 py-1 rounded-full transition-colors"
      disabled={disableDeleteButton}
    >
      <Trash2 size={18} />
      <span>削除</span>
    </button>
    <button
      onClick={exitDeleteMode}
      className="flex items-center space-x-2 bg-red-700 hover:bg-red-800 px-4 py-1 rounded-full transition-colors"
    >
      <span>キャンセル</span>
    </button>
  </div>
</div>
}