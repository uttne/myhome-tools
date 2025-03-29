import { useEffect } from "react";
import useControlBoxState from "../stores/ControlStore";

export function ProfileContent() {
  const { setButtons } = useControlBoxState();

  useEffect(() => {
    setButtons([]);
  }, [setButtons]);
  return <p>プロフィール</p>;
}
