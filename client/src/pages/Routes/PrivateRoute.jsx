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
      console.log('🔐 PrivateRoute: Checking user auth...');
      const res = await fetch(`${API_BASE}/api/user/user-auth`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      const data = await res.json();
      console.log('🔐 PrivateRoute auth response:', data);
      if (data?.check === true) {
        console.log('✅ PrivateRoute: Auth check PASSED');
        setOk(true);
      } else {
        console.log('❌ PrivateRoute: Auth check FAILED');
        setOk(false);
      }
    } catch (error) {
      console.error('❌ PrivateRoute: Auth check error:', error);
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
