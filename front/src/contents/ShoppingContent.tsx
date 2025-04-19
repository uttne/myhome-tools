import { useEffect } from "react";
import useControlBoxState from "../stores/ControlStore";
import { useNavigate } from "react-router-dom";


export function ShoppingContent(){
  const { setButtons } = useControlBoxState();
  const navigate = useNavigate();

  useEffect(() => {
    setButtons([
      {
        display: "商品リスト管理",
        icon: <span>🍎🥩</span>,
        onClick: () => {navigate("/shopping/manage");},
      }
    ]);
  }, [setButtons,navigate]);

  return (
    <div className="shopping-content">
      <h1>Shopping Content</h1>
      <p>This is the shopping content area.</p>
    </div>
  );
}