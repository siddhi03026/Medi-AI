import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { FaHeart } from 'react-icons/fa';

const navClass = ({ isActive }) =>
  `rounded-full px-4 py-2 text-sm font-medium transition ${
    isActive ? 'bg-sky-100 text-slate-800' : 'text-slate-700 hover:bg-slate-100'
  }`;

export default function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('imai_user');
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch { setUser(null); }
    }

    const onStorage = () => {
      const s = localStorage.getItem('imai_user');
      if (s) { try { setUser(JSON.parse(s)); } catch { setUser(null); } }
      else { setUser(null); }
    };
    window.addEventListener('storage', onStorage);
    // Also listen for custom event when same-tab login happens
    const onLogin = () => onStorage();
    window.addEventListener('imai_auth_change', onLogin);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('imai_auth_change', onLogin);
    };
  }, []);

  const logout = () => {
    localStorage.removeItem('imai_token');
    localStorage.removeItem('imai_user');
    setUser(null);
    window.dispatchEvent(new Event('imai_auth_change'));
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2">
        <Link to="/" className="flex items-center gap-2 brand-font text-xl font-bold text-medicalBlue">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-cyan-600 to-blue-600 text-white text-sm">
            <FaHeart />
          </span>
          <span className="text-base text-slate-800">
            <span className="text-slate-900">India</span>
            <span className="text-blue-800">Medicare</span>
            <span className="ml-1 text-xs text-slate-500">AI</span>
          </span>
        </Link>
        <div className="flex flex-wrap items-center gap-1">
          <NavLink to="/" className={navClass}>Home</NavLink>
          <NavLink to="/search" className={navClass}>Search</NavLink>
          <NavLink to="/map" className={navClass}>Map</NavLink>
          <NavLink to="/emergency" className={navClass}>Emergency</NavLink>
          <NavLink to="/settings" className={navClass}>Settings</NavLink>

          {user ? (
            <div className="flex items-center gap-2 ml-2">
              <span className="text-sm font-medium text-slate-700">{user.name || user.email}</span>
              <button onClick={logout} className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100 transition">
                Logout
              </button>
            </div>
          ) : (
            <NavLink to="/login" className="ml-2 rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 transition">
              Log in
            </NavLink>
          )}
        </div>
      </nav>
    </header>
  );
}
