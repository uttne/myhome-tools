import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { DEFAULT_API_CLIENT } from "../client/ApiClient";


export function RequireAuthArea(){

  const [loading, setLoading] = useState(true);
  const [auth, setAuth] = useState(false);
  const location = useLocation();

  useEffect(()=>{
    const checkAuth = async()=>{
      console.log("check auth");

      try{
        // TODO : いったん初期化確認はこれで行うが、途中でローディングが入ってしまうので初期化チェックはアプリの一番はじめだけにしたい
        await DEFAULT_API_CLIENT.init();
      }
      catch(err){
        console.error("API Client init failed:", err);
        
        // 失敗した場合は繰り返す
        setTimeout(async () =>{
          await checkAuth();
        },1000);

        return false;
      }
      
      console.log(auth ? "認証済み" : "認証されていません");
      setAuth(true);
      setLoading(false);
      return true;
    };

    checkAuth();
  },[]);

  if (loading){
    return <div>認証の確認中...</div>
  }

  if(!auth){
    return <Navigate to="/login" state={{from: location}} replace />
  }

  return <Outlet />
}
