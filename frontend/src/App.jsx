import { Navigate, Route, Routes } from "react-router-dom";

import Sidebar from "./components/Sidebar";
import { useAuth } from "./context/AuthContext";
import Admin from "./pages/Admin";
import Chat from "./pages/Chat";
import Login from "./pages/Login";

function ProtectedLayout({ children, allowedRoles }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to={user?.role === "admin" ? "/admin" : "/chat"} replace />;
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_25%),linear-gradient(135deg,_#020617,_#111827_50%,_#0f172a)] text-slate-100">
      <div className="mx-auto flex min-h-screen max-w-7xl gap-6 px-4 py-4 sm:px-6 lg:px-8">
        <Sidebar />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}

export default function App() {
  const { isAuthenticated, user } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to={user?.role === "admin" ? "/admin" : "/chat"} replace /> : <Login />}
      />
      <Route
        path="/chat"
        element={
          <ProtectedLayout allowedRoles={["student", "admin"]}>
            <Chat />
          </ProtectedLayout>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedLayout allowedRoles={["admin"]}>
            <Admin />
          </ProtectedLayout>
        }
      />
      <Route path="*" element={<Navigate to={isAuthenticated ? (user?.role === "admin" ? "/admin" : "/chat") : "/login"} replace />} />
    </Routes>
  );
}
