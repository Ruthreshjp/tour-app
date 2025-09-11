import { useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import defaultProfileImg from "../../assets/images/profile.png";
import { useLocation } from "react-router-dom";
const Header = () => {
  const { currentUser } = useSelector((state) => state.user);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const activeLink = location.pathname;
  const linkClass = (path) =>
    `hover:underline hover:scale-105 transition-all duration-150 ${
      activeLink === path ? "underline text-orange-500" : ""
    }`;

  return (
    <>
      <div className="fixed top-0 left-0 w-full bg-white  z-50">
        <div className="  bg-white max-w-7xl w-full mx-auto p-4 text-gray-800">
          {/* Navbar Container */}
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex-1">
              <Link to={`/`} onClick={() => handleLinkClick("/")}>
                <h1 className="text-4xl font-bold text-[#EB662B]">Trevo</h1>
              </Link>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex justify-center flex-1">
              <ul className="flex items-center gap-6 text-lg">
                <li className={linkClass("/")}>
                  <Link to="/">Home</Link>
                </li>
                <li className={linkClass("/search")}>
                  <Link to="/search">Bookings</Link>
                </li>
                <li className={linkClass("/about")}>
                  <Link to="/about">About</Link>
                </li>
                <li className={linkClass("/contact")}>
                  <Link to="/contact">Contact</Link>
                </li>
                <li className={linkClass("/blog")}>
                  <Link to="/blog">Blog</Link>
                </li>
              </ul>
            </div>

            {/* Profile/Login */}
            <div className="flex-1 flex justify-end items-center">
              {currentUser ? (
                <Link
                  to={`/profile/${
                    currentUser.user_role === 1 ? "admin" : "user"
                  }`}
                >
                  <img
                    src={
                      `http://localhost:8000/images/${currentUser?.avatar}` ||
                      defaultProfileImg
                    }
                    alt="avatar"
                    className="border w-10 h-10 border-white rounded-full"
                  />
                </Link>
              ) : (
                <Link
                  className="bg-orange-500 text-white px-8 py-2 rounded-full border border-gray-100"
                  to="/login"
                  onClick={() => handleLinkClick("/login")}
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
                <Link to="/" onClick={() => handleLinkClick("/")}>
                  Home
                </Link>
              </li>
              <li className={linkClass("/search")}>
                <Link to="/search" onClick={() => handleLinkClick("/search")}>
                  Bookings
                </Link>
              </li>
              <li className={linkClass("/about")}>
                <Link to="/about" onClick={() => handleLinkClick("/about")}>
                  About
                </Link>
              </li>
              <li className={linkClass("/contact")}>
                <Link to="/contact" onClick={() => handleLinkClick("/contact")}>
                  Contact
                </Link>
              </li>
              <li className={linkClass("/blog")}>
                <Link to="/blog" onClick={() => handleLinkClick("/blog")}>
                  Blog
                </Link>
              </li>
              <li>
                {currentUser ? (
                  <Link
                    to={`/profile/${
                      currentUser.user_role === 1 ? "admin" : "user"
                    }`}
                    onClick={() =>
                      setActiveLink(
                        `/profile/${
                          currentUser.user_role === 1 ? "admin" : "user"
                        }`
                      )
                    }
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src={
                          `http://localhost:8000/images/${currentUser?.avatar}` ||
                          defaultProfileImg
                        }
                        alt="avatar"
                        className="border w-10 h-10 object-cover border-white rounded-full"
                      />
                      <span>Profile</span>
                    </div>
                  </Link>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => handleLinkClick("/login")}
                    className={linkClass("/login")}
                  >
                    Login
                  </Link>
                )}
              </li>
            </ul>
          )}
          <hr className=" border border-orange-500 mt-2" />
        </div>
      </div>
    </>
  );
};

export default Header;
