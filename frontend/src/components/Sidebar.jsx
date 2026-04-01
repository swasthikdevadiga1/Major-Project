import { NavLink, useNavigate } from "react-router-dom";
import { HiArrowLeftOnRectangle, HiChatBubbleLeftRight, HiMiniShieldCheck } from "react-icons/hi2";

import { useAuth } from "../context/AuthContext";

const navLinkClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
    isActive
      ? "bg-cyan-400 text-slate-950 shadow-soft"
      : "text-slate-300 hover:bg-white/10 hover:text-white"
  }`;

export default function Sidebar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <aside className="hidden w-72 shrink-0 rounded-[32px] border border-white/10 bg-white/6 p-5 backdrop-blur-2xl lg:flex lg:flex-col">
      <div>
        <div className="mb-8 rounded-3xl border border-cyan-400/30 bg-cyan-400/10 p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-200">Smart College AI</p>
          <h1 className="mt-2 text-2xl font-semibold text-white">Campus Knowledge Hub</h1>
          <p className="mt-3 text-sm text-slate-300">LLM + RAG + FAISS with role-based access and live document grounding.</p>
        </div>
        <div className="mb-6">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Signed In</p>
          <p className="mt-2 text-lg font-semibold text-white">{user?.name}</p>
          <p className="text-sm text-slate-400">{user?.role}</p>
        </div>
        <nav className="space-y-2">
          <NavLink to="/chat" className={navLinkClass}>
            <HiChatBubbleLeftRight className="text-lg" />
            Chat
          </NavLink>
          {user?.role === "admin" ? (
            <NavLink to="/admin" className={navLinkClass}>
              <HiMiniShieldCheck className="text-lg" />
              Admin Dashboard
            </NavLink>
          ) : null}
        </nav>
      </div>
      <button
        type="button"
        onClick={handleLogout}
        className="mt-auto flex items-center justify-center gap-3 rounded-2xl border border-white/10 px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/10"
      >
        <HiArrowLeftOnRectangle className="text-lg" />
        Logout
      </button>
    </aside>
  );
}
