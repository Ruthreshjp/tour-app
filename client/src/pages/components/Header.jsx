import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logOutSuccess } from "../../redux/user/userSlice";
import { logout as businessLogout } from "../../redux/business/businessSlice";
// Using public directory path instead of asset import

const Header = () => {
  const { currentUser } = useSelector((state) => state.user);
  const { currentBusiness, isAuthenticated: isBusinessAuthenticated } = useSelector((state) => state.business || {});
  const [menuOpen, setMenuOpen] = useState(false);
  const [businessUser, setBusinessUser] = useState(null);
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    // Check for business user in localStorage
    const checkBusinessUser = () => {
      const businessData = localStorage.getItem('businessData');
      const businessToken = localStorage.getItem('businessToken');
      
      console.log('🔍 Checking business user:', {
        hasBusinessData: !!businessData,
        hasBusinessToken: !!businessToken,
        hasCurrentUser: !!currentUser
      });
      
      // Only set business user if:
      // 1. Business token exists (active session)
      // 2. Business data exists
      // 3. No regular user is logged in
      if (businessData && businessToken && !currentUser) {
        try {
          const parsedData = JSON.parse(businessData);
          setBusinessUser(parsedData);
          console.log('✅ Business user set:', parsedData.businessName);
        } catch (e) {
          console.error('❌ Failed to parse business data:', e);
          setBusinessUser(null);
        }
      } else {
        setBusinessUser(null);
        console.log('❌ Business user cleared');
      }
    };

    // Initial check
    checkBusinessUser();

    // Listen for storage changes (logout from other tabs/components)
    const handleStorageChange = (e) => {
      if (e.key === 'businessData' || e.key === 'businessToken') {
        checkBusinessUser();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events for same-tab updates
    const handleBusinessLogout = () => {
      setBusinessUser(null);
    };

    window.addEventListener('businessLogout', handleBusinessLogout);

    window.addEventListener("resize", () => {
      if (window.innerWidth > 768) {
        setMenuOpen(false);
      }
    });

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('businessLogout', handleBusinessLogout);
    };
  }, [currentUser]); // Re-run when currentUser changes

  // Clear business user when regular user logs in
  useEffect(() => {
    if (currentUser) {
      setBusinessUser(null);
    }
  }, [currentUser]);

  // Monitor Redux business state changes
  useEffect(() => {
    console.log('🔍 Header - Redux State Update:', {
      currentUser: currentUser?.username || null,
      currentBusiness: currentBusiness?.businessName || null,
      isBusinessAuthenticated,
      businessUser: businessUser?.businessName || null
    });
  }, [currentUser, currentBusiness, isBusinessAuthenticated, businessUser]);

  // Determine if business user is logged in
  const businessToken = localStorage.getItem('businessToken');
  
  // Show business if has business token AND business data (no need to check currentUser since we clear it on business login)
  const hasBusinessData = isBusinessAuthenticated || businessUser;
  const isBusinessLoggedIn = businessToken && hasBusinessData;
  const businessUserData = currentBusiness || businessUser;
  
  console.log('🎯 Header Display Decision:', {
    currentPath: location.pathname,
    hasBusinessToken: !!businessToken,
    hasBusinessData,
    isBusinessAuthenticated,
    hasBusinessUser: !!businessUser,
    hasCurrentUser: !!currentUser,
    isBusinessLoggedIn,
    willShow: isBusinessLoggedIn ? 'Business' : currentUser ? 'User' : 'Login',
    businessName: businessUserData?.businessName,
    userName: currentUser?.username,
    displayName: isBusinessLoggedIn ? businessUserData?.businessName : currentUser?.username || 'Login'
  });
  
  // Additional debug for business data
  if (isBusinessLoggedIn) {
    console.log('✅ Business User Data:', {
      businessName: businessUserData?.businessName,
      email: businessUserData?.email,
      businessType: businessUserData?.businessType,
      fullData: businessUserData
    });
  }

  // Logout handlers
  const handleUserLogout = () => {
    dispatch(logOutSuccess());
    // Clear any user-related data
    localStorage.removeItem('persist:root');
    setMenuOpen(false);
    navigate('/');
  };

  const handleBusinessLogout = () => {
    // Clear Redux state
    dispatch(businessLogout());
    
    // Clear localStorage
    localStorage.removeItem('businessData');
    localStorage.removeItem('businessToken');
    
    // Clear local component state
    setBusinessUser(null);
    
    // Dispatch custom event for other components
    window.dispatchEvent(new Event('businessLogout'));
    
    // Force re-render by clearing all business-related data
    setTimeout(() => {
      navigate('/');
      setMenuOpen(false);
      // Force a page reload to ensure clean state
      window.location.reload();
    }, 100);
  };

  const activeLink = location.pathname;
  const linkClass = (path) =>
    `hover:underline hover:scale-105 transition-all duration-150 whitespace-nowrap ${
      activeLink === path ? "underline text-orange-500" : ""
    }`;

  const handleLinkClick = () => {
    setMenuOpen(false);
  };

  return (
    <>
      <div className="fixed top-0 left-0 w-full bg-white z-50">
        <div className="bg-white max-w-7xl w-full mx-auto p-4 text-gray-800">
          {/* Navbar Container */}
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex-1">
              <Link 
                to={isBusinessLoggedIn ? "/business/dashboard" : "/"} 
                onClick={handleLinkClick}
              >
                <h1 className="text-4xl font-bold text-[#EB662B]">Travel-Zone</h1>
              </Link>
            </div>

            {/* Desktop Menu */}
            {!isBusinessLoggedIn && (
              <div className="hidden md:flex justify-center flex-1">
                <ul className="flex items-center gap-4 text-base flex-nowrap">
                  <li className={linkClass("/")}>
                    <Link to="/" onClick={handleLinkClick}>
                      Home
                    </Link>
                  </li>
                  <li className={linkClass("/search")}>
                    <Link to="/search" onClick={handleLinkClick}>
                      Bookings
                    </Link>
                  </li>
                  <li className={linkClass("/about")}>
                    <Link to="/about" onClick={handleLinkClick}>
                      About
                    </Link>
                  </li>
                  <li className={linkClass("/contact")}>
                    <Link to="/contact" onClick={handleLinkClick}>
                      Contact
                    </Link>
                  </li>
                  <li className={linkClass("/blog")}>
                    <Link to="/blog" onClick={handleLinkClick}>
                      Blog
                    </Link>
                  </li>
                  <li className={linkClass("/travel-own")}>
                    <Link to="/travel-own" onClick={handleLinkClick}>
                      Travel Own
                    </Link>
                  </li>
                </ul>
              </div>
            )}

            {/* Profile/Login */}
            <div className="flex-1 flex justify-end items-center gap-4">
              {isBusinessLoggedIn ? (
                <Link
                  to="/business/dashboard"
                  onClick={handleLinkClick}
                  className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-full border border-gray-100 hover:bg-orange-600 transition-colors"
                >
                  <span className="text-xl">🏢</span>
                  <span className="hidden sm:inline font-medium">{businessUserData?.businessName || 'Business'}</span>
                </Link>
              ) : currentUser ? (
                <Link
                  to={`/profile/${currentUser.user_role === 1 ? "admin" : "user"}`}
                  onClick={handleLinkClick}
                  className="flex items-center gap-2 hover:bg-gray-100 px-3 py-2 rounded-full transition-colors"
                >
                  <span className="text-2xl">👤</span>
                  <span className="hidden sm:inline text-gray-700 font-medium">
                    {currentUser.user_role === 1 ? 'Admin' : currentUser.username || 'User'}
                  </span>
                </Link>
              ) : (
                <Link
                  className="bg-orange-500 text-white px-6 py-2 rounded-full border border-gray-100 hover:bg-orange-600 transition-colors"
                  to="/login"
                >
                  Login
                </Link>
              )}

              {/* Hamburger for mobile */}
              <button
                className="text-3xl ml-4 md:hidden"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                ☰
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {menuOpen && (
            <ul className="flex flex-col gap-4 mt-4 text-lg md:hidden">
              {!isBusinessLoggedIn && (
                <>
                  <li className={linkClass("/")}>
                    <Link to="/" onClick={handleLinkClick}>
                      Home
                    </Link>
                  </li>
                  <li className={linkClass("/search")}>
                    <Link to="/search" onClick={handleLinkClick}>
                      Bookings
                    </Link>
                  </li>
                  <li className={linkClass("/about")}>
                    <Link to="/about" onClick={handleLinkClick}>
                      About
                    </Link>
                  </li>
                  <li className={linkClass("/contact")}>
                    <Link to="/contact" onClick={handleLinkClick}>
                      Contact
                    </Link>
                  </li>
                  <li className={linkClass("/blog")}>
                    <Link to="/blog" onClick={handleLinkClick}>
                      Blog
                    </Link>
                  </li>
                  <li className={linkClass("/travel-own")}>
                    <Link to="/travel-own" onClick={handleLinkClick}>
                      Travel Own
                    </Link>
                  </li>
                </>
              )}
              <li>
                {isBusinessLoggedIn ? (
                  <Link
                    to="/business/dashboard"
                    onClick={handleLinkClick}
                    className="flex items-center gap-2"
                  >
                    <span className="text-2xl">🏢</span>
                    <span className="font-medium">{businessUserData?.businessName || 'Business'}</span>
                  </Link>
                ) : currentUser ? (
                  <Link
                    to={`/profile/${currentUser.user_role === 1 ? "admin" : "user"}`}
                    onClick={handleLinkClick}
                    className="flex items-center gap-2"
                  >
                    <span className="text-2xl">👤</span>
                    <span className="font-medium">
                      {currentUser.user_role === 1 ? 'Admin' : currentUser.username || 'User'}
                    </span>
                  </Link>
                ) : (
                  <Link
                    to="/login"
                    onClick={handleLinkClick}
                    className="bg-orange-500 text-white px-4 py-2 rounded-full hover:bg-orange-600 transition-colors text-center"
                  >
                    Login
                  </Link>
                )}
              </li>
            </ul>
          )}
          <hr className="border border-orange-500 mt-2" />
        </div>
      </div>
    </>
  );
};

export default Header;