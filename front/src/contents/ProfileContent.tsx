import { useEffect } from "react";
import useButtonStore from "../stores/ButtonStore";

export function ProfileContent() {
  const { setButtons } = useButtonStore();

  useEffect(() => {
    setButtons([]);
  }, [setButtons]);
  return <p>プロフィール</p>;
}
