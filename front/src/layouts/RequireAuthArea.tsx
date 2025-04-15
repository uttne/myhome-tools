import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getOrRefreshAccessToken } from "../utils/auth";


export function RequireAuthArea(){

  const [loading, setLoading] = useState(true);
  const [auth, setAuth] = useState(false);
  const location = useLocation();

  useEffect(()=>{
    const checkAuth = async()=>{
      const token = await getOrRefreshAccessToken();
      setAuth(!!token);
      setLoading(false);
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
