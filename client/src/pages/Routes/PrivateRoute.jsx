import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Outlet, Navigate } from "react-router-dom";
import Spinner from "../components/Spinner";
import { API_BASE } from "../../utils/apiBase";

export default function PrivateRoute() {
  const { currentUser } = useSelector((state) => state.user);
  const [ok, setOk] = useState(null); // null = loading, true = authenticated, false = not authenticated

  const authCheck = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/user/user-auth`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      const data = await res.json();
      if (data?.check === true) {
        setOk(true);
      } else {
        setOk(false);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setOk(false);
    }
  };

  useEffect(() => {
    if (currentUser) {
      authCheck();
    } else {
      setOk(false);
    }
  }, [currentUser]);

  // Loading state
  if (ok === null) return <Spinner />;
  
  // Not authenticated - redirect to login
  if (ok === false) return <Navigate to="/login" />;
  
  // Authenticated - show protected content
  return <Outlet />;
}
