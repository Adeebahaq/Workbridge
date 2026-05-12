import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ArrowRight, Menu, X, LogOut, Home, LayoutDashboard } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../hooks/useAuth";
import LanguageSwitcher from "../ui/LanguageSwitcher";
import logo from "../../assets/logow.png";

export default function Navbar() {
  const [navOpen, setNavOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef(null);

  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { t } = useTranslation();

  const closeMenu = () => setNavOpen(false);

  const handleLogout = () => {
    logout();
    closeMenu();
    navigate("/");
  };

  const handleHome = () => {
    closeMenu();
    navigate("/");
  };

  const handleSectionLink = (e, id) => {
    e.preventDefault();
    closeMenu();
    if (pathname === "/") {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate(`/#${id}`);
    }
  };

  const NAV_LINKS = [
    { labelKey: "nav.how_it_works", id: "how" },
    { labelKey: "nav.services", id: "services" },
    { labelKey: "nav.faqs", id: "faqs" },
  ];

  const getDashboardLink = () => {
    if (!user) return "/";
    if (user.role === "admin") return "/admin/dashboard";
    if (user.role === "worker") return "/worker/dashboard";
    if (user.role === "employer") return "/employer/workers";
    return "/";
  };

  const isInsideApp =
    pathname.startsWith("/worker") ||
    pathname.startsWith("/employer") ||
    pathname.startsWith("/admin");
    
  const showNavLinks = !user || pathname === "/";

  const isAuthPage =
    pathname.startsWith("/login") ||
    pathname.startsWith("/register");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = navOpen ? "hidden" : "";
    return () => (document.body.style.overflow = "");
  }, [navOpen]);

  // Close menu when clicking outside
  useEffect(() => {
    if (!navOpen) return;
    const handleOutsideClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        closeMenu();
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [navOpen]);

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-[60] transition-all border-b ${
        pathname.startsWith("/admin")
          ? "bg-white shadow-sm py-3"
          : scrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm py-3"
          : "bg-white/90 backdrop-blur-md py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 flex items-center justify-between" dir="ltr">

        {/* Logo */}
        <Link to="/" onClick={closeMenu} className="flex items-center gap-2 min-w-0">
          <img src={logo} alt="WorkBridge Logo" className="h-8 sm:h-10 w-auto object-contain shrink-0" />
          <span className="font-black text-xl sm:text-2xl truncate">
            <span className="text-[#0F172A]">Work</span>
            <span className="text-teal-500">Bridge</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center ml-auto gap-4">
          {showNavLinks && (
            <div className="flex gap-6 mr-4">
              {NAV_LINKS.map(({ labelKey, id }) => (
                <a
                  key={id}
                  href={`/#${id}`}
                  onClick={(e) => handleSectionLink(e, id)}
                  className="font-semibold text-slate-600 hover:text-teal-500"
                >
                  {t(labelKey)}
                </a>
              ))}
            </div>
          )}

          <LanguageSwitcher />

          {user ? (
            <>
              {pathname !== "/" && (
                <button
                  onClick={handleHome}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border"
                >
                  <Home className="w-4 h-4" />
                  {t("nav.home")}
                </button>
              )}

              {!isInsideApp && (
                <Link
                  to={getDashboardLink()}
                  onClick={closeMenu}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  {t("nav.dashboard")}
                </Link>
              )}

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 text-red-600"
              >
                {t("nav.logout")}
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              {isAuthPage && (
                <button
                  onClick={handleHome}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold"
                >
                  <Home className="w-4 h-4" />
                  {t("nav.home")}
                </button>
              )}

              <Link to="/login" className="font-semibold">
                {t("nav.login")}
              </Link>

              <Link
                to="/register/employer"
                className="flex items-center gap-2 bg-black text-white px-5 py-2 rounded-xl"
              >
                {t("nav.get_started")}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile: hamburger + menu wrapped in menuRef */}
        <div ref={menuRef} className="md:hidden relative flex items-center gap-2 shrink-0 ms-auto">
          <LanguageSwitcher />
          <button
            onClick={() => setNavOpen(!navOpen)}
            className="w-8 h-8 flex items-center justify-center shrink-0"
          >
            {navOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Mobile Menu Panel */}
          {navOpen && (
            <div className="absolute top-full right-0 mt-2 w-56 bg-white border rounded-xl shadow-lg p-4 flex flex-col gap-4 z-50">
              {user ? (
                <>
                  {pathname === "/" &&
                    NAV_LINKS.map(({ labelKey, id }) => (
                      <a
                        key={id}
                        href={`/#${id}`}
                        onClick={(e) => handleSectionLink(e, id)}
                        className="font-semibold text-slate-600"
                      >
                        {t(labelKey)}
                      </a>
                    ))}

                  {pathname !== "/" && (
                    <button onClick={handleHome} className="text-left font-semibold">
                      {t("nav.home")}
                    </button>
                  )}

                  {!isInsideApp && (
                    <Link to={getDashboardLink()} onClick={closeMenu} className="font-semibold">
                      {t("nav.dashboard")}
                    </Link>
                  )}

                  <button onClick={handleLogout} className="text-red-600 text-left font-semibold">
                    {t("nav.logout")}
                  </button>
                </>
              ) : (
                <>
                  {NAV_LINKS.map(({ labelKey, id }) => (
                    <a
                      key={id}
                      href={`/#${id}`}
                      onClick={(e) => handleSectionLink(e, id)}
                      className="font-semibold text-slate-600"
                    >
                      {t(labelKey)}
                    </a>
                  ))}

                  {isAuthPage && (
                    <button
                      onClick={() => { handleHome(); closeMenu(); }}
                      className="text-left font-semibold flex items-center gap-2"
                    >
                      <Home className="w-4 h-4" />
                      {t("nav.home")}
                    </button>
                  )}

                  <Link to="/login" onClick={closeMenu} className="font-semibold">
                    {t("nav.login")}
                  </Link>

                  <Link to="/register/employer" onClick={closeMenu} className="font-semibold">
                    {t("nav.get_started")}
                  </Link>
                </>
              )}
            </div>
          )}
        </div>

      </div>
    </nav>
  );
}