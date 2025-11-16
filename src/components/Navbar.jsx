import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    navigate("/login");
  };
  
  const activeLink = (path) =>
    location.pathname === path
      ? "text-purple-400 font-semibold border-b-2 border-purple-500 pb-1"
      : "hover:text-purple-300 transition-all";

  return (
    <nav className="bg-gray-900 text-white px-8 py-4 flex justify-between items-center shadow-md fixed w-full top-0 z-50">
      {/* ✅ Logo */}
      <Link
        to="/"
        className="text-2xl font-extrabold text-purple-400 flex items-center gap-1 hover:text-purple-300 transition-all"
      >
        ProTasker 🚀
      </Link>

      {/* ✅ Navigation Links */}
      <div className="flex items-center space-x-8 text-lg font-medium">
        <Link to="/" className={activeLink("/")}>
          Home
        </Link>

        {/* 🔒 Show Dashboard + Projects only when logged in */}
        {isLoggedIn && (
          <>
            <Link to="/dashboard" className={activeLink("/dashboard")}>
              Dashboard
            </Link>

            <Link to="/projects" className={activeLink("/projects")}>
              Projects
            </Link>
          </>
        )}

        {/* 👤 Auth links (only if logged out) */}
        {!isLoggedIn && (
          <>
            <Link to="/login" className={activeLink("/login")}>
              Login
            </Link>
            <Link to="/register" className={activeLink("/register")}>
              Register
            </Link>
          </>
        )}

        {/* 🚪 Logout button (only if logged in) */}
        {isLoggedIn && (
          <button
            onClick={handleLogout}
            className="bg-gradient-to-r from-purple-600 to-pink-500 px-5 py-2 rounded-lg hover:opacity-90 transition-all font-semibold shadow-md"
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
