import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
// Using public directory path instead of asset import

const Header = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [menuOpen, setMenuOpen] = useState(false);
  const [businessUser, setBusinessUser] = useState(null);
  const location = useLocation();

  useEffect(() => {
    // Check for business user in localStorage
    const checkBusinessUser = () => {
      const businessData = localStorage.getItem('businessData');
      const businessToken = localStorage.getItem('businessToken');
      if (businessData && businessToken) {
        setBusinessUser(JSON.parse(businessData));
      } else {
        setBusinessUser(null);
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
  }, []);

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
              <Link to="/" onClick={handleLinkClick}>
                <h1 className="text-4xl font-bold text-[#EB662B]">Travel-Zone</h1>
              </Link>
            </div>

            {/* Desktop Menu */}
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

            {/* Profile/Login */}
            <div className="flex-1 flex justify-end items-center gap-4">
              {currentUser ? (
                <Link
                  to={`/profile/${currentUser.user_role === 1 ? "admin" : "user"}`}
                  onClick={handleLinkClick}
                >
                  <img
                    src={
                      currentUser?.avatar
                        ? `http://localhost:8000/images/${currentUser.avatar}`
                        : "/images/profile.png"
                    }
                    alt="avatar"
                    className="border w-10 h-10 border-white rounded-full"
                  />
                </Link>
              ) : businessUser ? (
                <Link
                  to="/business/dashboard"
                  onClick={handleLinkClick}
                  className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-full border border-gray-100 hover:bg-orange-600 transition-colors"
                >
                  <img
                    src="/images/profile.png"
                    alt="business avatar"
                    className="border w-8 h-8 border-white rounded-full"
                  />
                  <span className="hidden sm:inline">Business</span>
                </Link>
              ) : (
                <Link
                  className="bg-orange-500 text-white px-8 py-2 rounded-full border border-gray-100"
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
              <li>
                {currentUser ? (
                  <Link
                    to={`/profile/${currentUser.user_role === 1 ? "admin" : "user"}`}
                    onClick={handleLinkClick}
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src={
                          currentUser?.avatar
                            ? `http://localhost:8000/images/${currentUser.avatar}`
                            : "/images/profile.png"
                        }
                        alt="avatar"
                        className="border w-10 h-10 object-cover border-white rounded-full"
                      />
                      <span>Profile</span>
                    </div>
                  </Link>
                ) : businessUser ? (
                  <Link
                    to="/business/dashboard"
                    onClick={handleLinkClick}
                    className="flex items-center gap-2"
                  >
                    <img
                      src="/images/profile.png"
                      alt="business avatar"
                      className="border w-10 h-10 object-cover border-white rounded-full"
                    />
                    <span>Business Dashboard</span>
                  </Link>
                ) : (
                  <Link
                    to="/login"
                    onClick={handleLinkClick}
                    className={linkClass("/login")}
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