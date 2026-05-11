import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ArrowRight, Menu, X, LogOut, Home, LayoutDashboard } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../hooks/useAuth";
import LanguageSwitcher from "../ui/LanguageSwitcher";
import logo from "../../assets/logow.png";

export default function Navbar() {
  const [navOpen, setNavOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

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

  // Show section nav links when: guest OR logged-in user on home page
  const showNavLinks = !user || pathname === "/";

  // Show Home button on auth/register pages for guests
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

  return (
    <nav
      dir="ltr"
      className={`fixed top-0 inset-x-0 z-50 transition-all border-b ${
        pathname.startsWith("/admin")
          ? "bg-white shadow-sm py-3"
          : scrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm py-3"
          : "bg-white/90 backdrop-blur-md py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" onClick={closeMenu} className="flex items-center gap-2">
          <img src={logo} alt="WorkBridge Logo" className="h-10 w-auto object-contain" />
          <span className="font-black text-2xl">WorkBridge</span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center ml-auto gap-4">

          {/* Section links: show for guests AND for logged-in users on home page */}
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

        {/* Mobile hamburger */}
        <div className="md:hidden flex items-center gap-2">
          <LanguageSwitcher />
          <button onClick={() => setNavOpen(!navOpen)}>
            {navOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {navOpen && (
        <div className="md:hidden bg-white border-t p-5 flex flex-col gap-4">

          {user ? (
            <>
              {/* Section links on home page even when logged in */}
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
                >
                  {t(labelKey)}
                </a>
              ))}

              {isAuthPage && (
                <button onClick={handleHome} className="text-left font-semibold flex items-center gap-2">
                  <Home className="w-4 h-4" />
                  {t("nav.home")}
                </button>
              )}

              <Link to="/login">{t("nav.login")}</Link>

              <Link to="/register/employer">
                {t("nav.get_started")}
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}