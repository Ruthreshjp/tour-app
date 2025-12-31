import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Outlet, Navigate } from "react-router-dom";
import Spinner from "../components/Spinner";
import { API_BASE } from "../../utils/apiBase";

export default function AdminRoute() {
  const { currentUser } = useSelector((state) => state.user);
  const [ok, setOk] = useState(null); // null = loading, true = admin, false = not admin

  const authCheck = async () => {
    try {
      console.log('👮 AdminRoute: Starting admin auth check...');
      console.log('👮 AdminRoute: currentUser from Redux:', currentUser);
      console.log('👮 AdminRoute: API_BASE:', API_BASE);
      
      const res = await fetch(`${API_BASE}/api/user/admin-auth`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      
      console.log('👮 AdminRoute: Response status:', res.status);
      const data = await res.json();
      console.log('👮 AdminRoute auth response:', data);
      
      if (data?.check === true) {
        console.log('✅ AdminRoute: Auth check PASSED');
        setOk(true);
      } else {
        console.log('❌ AdminRoute: Auth check FAILED - check false or missing');
        setOk(false);
      }
    } catch (error) {
      console.error('❌ AdminRoute: Auth check error:', error);
      console.error('👮 AdminRoute: Error details:', error.message, error.stack);
      setOk(false);
    }
  };

  useEffect(() => {
    console.log('👮 AdminRoute: useEffect triggered, currentUser changed to:', currentUser);
    // Check auth whenever component mounts or currentUser changes
    authCheck();
  }, [currentUser]);

  // Loading state
  if (ok === null) {
    console.log('👮 AdminRoute: Rendering Spinner (loading)');
    return <Spinner />;
  }
  
  // Not admin - redirect to home
  if (ok === false) {
    console.log('👮 AdminRoute: Admin auth failed - redirecting to home');
    return <Navigate to="/" />;
  }
  
  // Admin authenticated - show protected content
  console.log('👮 AdminRoute: Admin auth passed - rendering Outlet');
  return <Outlet />;
}
