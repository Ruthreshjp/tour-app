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
      console.log('🔐 PrivateRoute: Starting auth check...');
      console.log('🔐 PrivateRoute: currentUser from Redux:', currentUser);
      console.log('🔐 PrivateRoute: API_BASE:', API_BASE);
      
      const res = await fetch(`${API_BASE}/api/user/user-auth`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      
      console.log('🔐 PrivateRoute: Response status:', res.status);
      const data = await res.json();
      console.log('🔐 PrivateRoute auth response:', data);
      
      if (data?.check === true) {
        console.log('✅ PrivateRoute: Auth check PASSED');
        setOk(true);
      } else {
        console.log('❌ PrivateRoute: Auth check FAILED - check false or missing');
        setOk(false);
      }
    } catch (error) {
      console.error('❌ PrivateRoute: Auth check error:', error);
      console.error('🔐 PrivateRoute: Error details:', error.message, error.stack);
      setOk(false);
    }
  };

  useEffect(() => {
    console.log('🔐 PrivateRoute: useEffect triggered, currentUser changed to:', currentUser);
    // Check auth whenever component mounts or currentUser changes
    authCheck();
  }, [currentUser]);

  // Loading state
  if (ok === null) {
    console.log('🔐 PrivateRoute: Rendering Spinner (loading)');
    return <Spinner />;
  }
  
  // Not authenticated - redirect to login
  if (ok === false) {
    console.log('🔐 PrivateRoute: Auth failed - redirecting to login');
    return <Navigate to="/login" />;
  }
  
  // Authenticated - show protected content
  console.log('🔐 PrivateRoute: Auth passed - rendering Outlet');
  return <Outlet />;
}
