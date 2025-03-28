import { useEffect } from "react";
import useButtonStore from "../stores/ButtonStore";

export function SettingsContent() {
  const { setButtons } = useButtonStore();

  useEffect(() => {
    setButtons([]);
  }, [setButtons]);
  return <p>設定</p>;
}
