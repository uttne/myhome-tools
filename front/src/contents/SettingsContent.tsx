import { useEffect } from "react";
import useControlBoxState from "../stores/ControlStore";

export function SettingsContent() {
  const { setButtons } = useControlBoxState();

  useEffect(() => {
    setButtons([]);
  }, [setButtons]);
  return <p>設定</p>;
}
