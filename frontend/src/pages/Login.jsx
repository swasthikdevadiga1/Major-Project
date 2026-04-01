import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { HiLockClosed, HiOutlineSparkles, HiUserCircle } from "react-icons/hi2";

import { useAuth } from "../context/AuthContext";

const initialForms = {
  login: { email: "", password: "" },
  register: { name: "", email: "", password: "" },
  admin: { name: "", email: "", password: "" },
};

export default function Login() {
  const navigate = useNavigate();
  const { login, register, setupAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState("login");
  const [forms, setForms] = useState(initialForms);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const onChange = (tab, field, value) => {
    setForms((prev) => ({
      ...prev,
      [tab]: { ...prev[tab], [field]: value },
    }));
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const user = await login(forms.login.email, forms.login.password);
      navigate(user.role === "admin" ? "/admin" : "/chat");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError("");
    setMessage("");
    try {
      await register(forms.register);
      setMessage("Student account created. You can sign in now.");
      setActiveTab("login");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminSetup = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError("");
    setMessage("");
    try {
      await setupAdmin(forms.admin);
      setMessage("Admin account created. Sign in with the admin credentials.");
      setActiveTab("login");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.2),_transparent_22%),linear-gradient(135deg,_#020617,_#0f172a_50%,_#111827)] px-4 py-10 text-slate-100">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:120px_120px] opacity-20" />
      <div className="relative mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm text-cyan-100">
            <HiOutlineSparkles />
            Smart College Information Chatbot
          </div>
          <div>
            <h1 className="max-w-2xl text-4xl font-semibold leading-tight text-white sm:text-5xl">
              Secure campus knowledge retrieval with document-grounded AI answers.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-slate-300">
              Admins upload institutional PDFs, embeddings are persisted into FAISS, and students chat against only the approved document base.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              "JWT authentication with role-aware navigation",
              "FAISS-backed retrieval that persists on restart",
              "Voice-enabled conversational search over uploaded PDFs",
            ].map((item) => (
              <div key={item} className="rounded-3xl border border-white/10 bg-white/6 p-4 backdrop-blur-xl">
                <p className="text-sm leading-7 text-slate-200">{item}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[32px] border border-white/10 bg-white/8 p-6 shadow-soft backdrop-blur-2xl sm:p-8">
          <div className="mb-6 flex rounded-2xl border border-white/10 bg-slate-950/30 p-1">
            {[
              ["login", "Login"],
              ["register", "Student Sign Up"],
              ["admin", "Setup Admin"],
            ].map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setActiveTab(key);
                  setError("");
                  setMessage("");
                }}
                className={`flex-1 rounded-2xl px-3 py-3 text-sm font-medium transition ${
                  activeTab === key ? "bg-cyan-400 text-slate-950" : "text-slate-300 hover:text-white"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {message ? <div className="mb-4 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">{message}</div> : null}
          {error ? <div className="mb-4 rounded-2xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">{error}</div> : null}

          {activeTab === "login" ? (
            <form className="space-y-4" onSubmit={handleLogin}>
              <Input label="Email" icon={<HiUserCircle />} value={forms.login.email} onChange={(value) => onChange("login", "email", value)} />
              <Input label="Password" type="password" icon={<HiLockClosed />} value={forms.login.password} onChange={(value) => onChange("login", "password", value)} />
              <SubmitButton loading={isLoading} label="Sign In" />
            </form>
          ) : null}

          {activeTab === "register" ? (
            <form className="space-y-4" onSubmit={handleRegister}>
              <Input label="Full Name" icon={<HiUserCircle />} value={forms.register.name} onChange={(value) => onChange("register", "name", value)} />
              <Input label="Email" icon={<HiUserCircle />} value={forms.register.email} onChange={(value) => onChange("register", "email", value)} />
              <Input label="Password" type="password" icon={<HiLockClosed />} value={forms.register.password} onChange={(value) => onChange("register", "password", value)} />
              <SubmitButton loading={isLoading} label="Create Student Account" />
            </form>
          ) : null}

          {activeTab === "admin" ? (
            <form className="space-y-4" onSubmit={handleAdminSetup}>
              <Input label="Admin Name" icon={<HiUserCircle />} value={forms.admin.name} onChange={(value) => onChange("admin", "name", value)} />
              <Input label="Admin Email" icon={<HiUserCircle />} value={forms.admin.email} onChange={(value) => onChange("admin", "email", value)} />
              <Input label="Password" type="password" icon={<HiLockClosed />} value={forms.admin.password} onChange={(value) => onChange("admin", "password", value)} />
              <SubmitButton loading={isLoading} label="Initialize Admin Account" />
            </form>
          ) : null}
        </section>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, type = "text", icon }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-slate-300">{label}</span>
      <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 focus-within:border-cyan-300/60">
        <span className="text-slate-400">{icon}</span>
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
          placeholder={`Enter ${label.toLowerCase()}`}
          required
        />
      </div>
    </label>
  );
}

function SubmitButton({ loading, label }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full rounded-2xl bg-cyan-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {loading ? "Please wait..." : label}
    </button>
  );
}
