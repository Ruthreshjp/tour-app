import { useEffect, useState } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../../redux/business/businessSlice";
import api from "../../utils/api";

export default function BusinessPrivateRoute() {
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const dispatch = useDispatch();
  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('businessToken');
        const businessData = localStorage.getItem('businessData');
        
        if (!token) {
          if (mounted) {
            setAuthorized(false);
            setLoading(false);
          }
          return;
        }

        // Load business data from localStorage into Redux
        if (businessData) {
          try {
            const parsedBusinessData = JSON.parse(businessData);
            dispatch(loginSuccess(parsedBusinessData));
          } catch (e) {
            console.error('Error parsing business data:', e);
          }
        }

        const response = await api.get('/business/check-auth');
        
        if (mounted) {
          setAuthorized(response.data.success);
          // If auth check returns business data, update Redux
          if (response.data.success && response.data.business) {
            dispatch(loginSuccess(response.data.business));
          }
        }
      } catch (error) {
        console.error('Auth check error:', error?.response?.data || error.message);
        if (mounted) {
          setAuthorized(false);
          // If unauthorized, clear token
          if (error?.response?.status === 401) {
            localStorage.removeItem('businessToken');
          }
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    checkAuth();

    return () => {
      mounted = false;
    };
  }, [dispatch]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return authorized ? <Outlet /> : <Navigate to="/business/login" />;
}