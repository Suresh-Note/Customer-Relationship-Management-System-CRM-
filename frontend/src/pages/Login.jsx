import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "../api/axios";
import { useAuth } from "../context/AuthContext";

// ── Icons ─────────────────────────────────────────────────────────
function AstraLogo() {
  return (
    <svg viewBox="0 0 120 100" className="w-20 h-16" aria-label="AstrawinCRM logo">
      <defs>
        <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b9fd4" />
          <stop offset="100%" stopColor="#1a6bae" />
        </linearGradient>
        <linearGradient id="g2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4cb8e0" />
          <stop offset="100%" stopColor="#2290cc" />
        </linearGradient>
      </defs>
      <polygon points="60,4 82,40 38,40"  fill="url(#g1)" />
      <polygon points="32,46 54,82 10,82" fill="url(#g2)" />
      <polygon points="88,46 110,82 66,82" fill="url(#g1)" />
    </svg>
  );
}

function EyeOpen() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
function EyeClosed() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

// ── Password strength meter ───────────────────────────────────────
const STRENGTH_RULES = [
  { label: "8+ characters",      test: (p) => p.length >= 8 },
  { label: "Uppercase letter",   test: (p) => /[A-Z]/.test(p) },
  { label: "Lowercase letter",   test: (p) => /[a-z]/.test(p) },
  { label: "Number",             test: (p) => /[0-9]/.test(p) },
  { label: "Special character",  test: (p) => /[^A-Za-z0-9]/.test(p) },
];

function PasswordStrength({ password }) {
  if (!password) return null;
  const passed = STRENGTH_RULES.filter(r => r.test(password)).length;
  const colors  = ["bg-red-400", "bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-green-400"];
  const labels  = ["Very Weak", "Weak", "Fair", "Good", "Strong"];

  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex gap-1">
        {STRENGTH_RULES.map((_, i) => (
          <div key={i}
            className={`h-1 flex-1 rounded-full transition-colors ${i < passed ? colors[passed - 1] : "bg-slate-100"}`}
          />
        ))}
      </div>
      <div className="flex justify-between items-center">
        <p className="text-xs text-slate-400">{labels[passed - 1] || "Too weak"}</p>
        <div className="flex gap-2 flex-wrap justify-end">
          {STRENGTH_RULES.map(r => (
            <span key={r.label}
              className={`text-[10px] font-medium ${r.test(password) ? "text-green-500" : "text-slate-300"}`}>
              {r.test(password) ? "✓" : "·"} {r.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Input validation ──────────────────────────────────────────────
function validateLogin(email, password) {
  const errors = {};
  if (!email.trim()) {
    errors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.email = "Enter a valid email address";
  }
  if (!password) {
    errors.password = "Password is required";
  } else if (password.length < 8) {
    errors.password = "Password must be at least 8 characters";
  }
  return errors;
}

function validateRegister(name, email, password, confirm) {
  const errors = {};
  // name is optional — backend falls back to email local part
  if (!email.trim()) {
    errors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.email = "Enter a valid email address";
  }
  const passed = STRENGTH_RULES.filter(r => r.test(password)).length;
  if (!password) {
    errors.password = "Password is required";
  } else if (passed < 5) {
    errors.password = "Password is too weak — meet all 5 requirements";
  }
  if (password !== confirm) errors.confirm = "Passwords do not match";
  return errors;
}

// ── Eye toggle button ─────────────────────────────────────────────
function EyeToggle({ show, onToggle }) {
  return (
    <button type="button" onClick={onToggle} tabIndex={-1}
      className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center border border-slate-200 rounded-lg text-slate-400 hover:text-[#3b9fd4] hover:border-[#3b9fd4] transition bg-white">
      {show ? <EyeClosed /> : <EyeOpen />}
    </button>
  );
}

// ══════════════════════════════════════════════════════════════════
export default function Login() {
  const { login }  = useAuth();
  const navigate   = useNavigate();
  const location   = useLocation();
  const idleReason = new URLSearchParams(location.search).get("reason") === "idle";

  const [mode, setMode]   = useState("login"); // "login" | "register"
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  // Login fields
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  // Register fields
  const [regName, setRegName]         = useState("");
  const [regEmail, setRegEmail]       = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm]   = useState("");
  const [showRegPass, setShowRegPass]       = useState(false);
  const [showRegConfirm, setShowRegConfirm] = useState(false);

  // ── Login ──────────────────────────────────────────────────────
  async function handleLogin(e) {
    e.preventDefault();
    setError(""); setFieldErrors({});

    const errs = validateLogin(email, password);
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }

    setLoading(true);
    try {
      const { data } = await axios.post("/auth/login", { email: email.trim().toLowerCase(), password });
      login(data.user);  // update AuthContext — tokens are in httpOnly cookies
      navigate("/", { replace: true });
    } catch (err) {
      const msg = err?.response?.data?.error || "Invalid email or password";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  // ── Register ───────────────────────────────────────────────────
  async function handleRegister(e) {
    e.preventDefault();
    setError(""); setFieldErrors({});

    const errs = validateRegister(regName, regEmail, regPassword, regConfirm);
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }

    setLoading(true);
    try {
      await axios.post("/auth/register", {
        name: regName.trim(),
        email: regEmail.trim().toLowerCase(),
        password: regPassword,
        confirmPassword: regConfirm,
      });
      setSuccess("Account created! You can now sign in.");
      setMode("login");
      setEmail(regEmail.trim().toLowerCase());
      setRegName(""); setRegEmail(""); setRegPassword(""); setRegConfirm("");
    } catch (err) {
      setError(err?.response?.data?.error || "Registration failed — please try again");
    } finally {
      setLoading(false);
    }
  }

  // ── Shared input class ─────────────────────────────────────────
  const inp = (hasErr) =>
    `w-full px-4 py-3 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3b9fd4]/30 focus:border-[#3b9fd4] placeholder-slate-300 transition ${
      hasErr ? "border-red-400 bg-red-50/30" : "border-slate-200"
    }`;

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "linear-gradient(135deg, #d6eaf8 0%, #c8e4f5 50%, #b8d9f0 100%)" }}>

      <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm px-8 py-10">

        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <AstraLogo />
          <p className="text-lg font-extrabold tracking-widest text-[#1a6bae] mt-2 uppercase">Astrawin CRM</p>
          <p className="text-xs text-[#5bb4d8] tracking-widest mt-0.5 italic">Ideas Into Reality</p>
        </div>

        {/* Idle session notice */}
        {idleReason && (
          <div className="mb-4 px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700 text-center font-medium">
            You were logged out due to inactivity.
          </div>
        )}

        {/* Success banner */}
        {success && (
          <div className="mb-4 px-3 py-2.5 bg-green-50 border border-green-200 rounded-xl text-xs text-green-700 text-center font-medium">
            {success}
          </div>
        )}

        {mode === "login" ? (
          <>
            <div className="text-center mb-6">
              <h1 className="text-xl font-bold text-slate-800">Welcome back</h1>
              <p className="text-sm text-slate-400 mt-1">Sign in to your account</p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-4 px-3 py-2 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4" noValidate>
              {/* Email */}
              <div>
                <label className="block text-[11px] font-bold text-[#3b9fd4] uppercase tracking-wider mb-1.5">
                  Email
                </label>
                <input type="email" autoComplete="email" required
                  value={email} onChange={e => { setEmail(e.target.value); setFieldErrors(f => ({...f, email: undefined})); }}
                  placeholder="you@example.com"
                  className={inp(fieldErrors.email)}
                />
                {fieldErrors.email && <p className="text-xs text-red-500 mt-1">{fieldErrors.email}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="block text-[11px] font-bold text-[#3b9fd4] uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input type={showPass ? "text" : "password"} autoComplete="current-password" required
                    value={password} onChange={e => { setPassword(e.target.value); setFieldErrors(f => ({...f, password: undefined})); }}
                    placeholder="••••••••"
                    className={`${inp(fieldErrors.password)} pr-12`}
                  />
                  <EyeToggle show={showPass} onToggle={() => setShowPass(v => !v)} />
                </div>
                {fieldErrors.password && <p className="text-xs text-red-500 mt-1">{fieldErrors.password}</p>}
              </div>

              {/* Remember me + Forgot */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 rounded border-slate-300 accent-[#3b9fd4]" />
                  <span className="text-xs text-slate-500">Remember me</span>
                </label>
                <button type="button"
                  className="text-xs text-[#3b9fd4] font-semibold hover:underline"
                  onClick={() => setError("Password reset coming soon — contact your admin.")}>
                  Forgot password?
                </button>
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-3 mt-1 border-2 border-slate-800 rounded-xl text-sm font-extrabold text-slate-800 tracking-widest hover:bg-slate-800 hover:text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed">
                {loading ? "SIGNING IN…" : "LOGIN"}
              </button>
            </form>

            <p className="text-center text-sm text-slate-400 mt-6">
              Don't have an account?{" "}
              <button onClick={() => { setMode("register"); setError(""); setSuccess(""); setFieldErrors({}); }}
                className="text-[#3b9fd4] font-bold hover:underline">
                Register
              </button>
            </p>
          </>
        ) : (
          <>
            <div className="text-center mb-6">
              <h1 className="text-xl font-bold text-slate-800">Create account</h1>
              <p className="text-sm text-slate-400 mt-1">Fill in your details to get started</p>
            </div>

            {error && (
              <div className="mb-4 px-3 py-2 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4" noValidate>
              {/* Name */}
              <div>
                <label className="block text-[11px] font-bold text-[#3b9fd4] uppercase tracking-wider mb-1.5">Full Name</label>
                <input type="text" autoComplete="name"
                  value={regName} onChange={e => { setRegName(e.target.value); setFieldErrors(f => ({...f, name: undefined})); }}
                  placeholder="Your full name (optional)"
                  className={inp(fieldErrors.name)}
                />
                {fieldErrors.name && <p className="text-xs text-red-500 mt-1">{fieldErrors.name}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-[11px] font-bold text-[#3b9fd4] uppercase tracking-wider mb-1.5">Email</label>
                <input type="email" autoComplete="email" required
                  value={regEmail} onChange={e => { setRegEmail(e.target.value); setFieldErrors(f => ({...f, email: undefined})); }}
                  placeholder="you@example.com"
                  className={inp(fieldErrors.email)}
                />
                {fieldErrors.email && <p className="text-xs text-red-500 mt-1">{fieldErrors.email}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="block text-[11px] font-bold text-[#3b9fd4] uppercase tracking-wider mb-1.5">Password</label>
                <div className="relative">
                  <input type={showRegPass ? "text" : "password"} autoComplete="new-password" required
                    value={regPassword} onChange={e => { setRegPassword(e.target.value); setFieldErrors(f => ({...f, password: undefined})); }}
                    placeholder="••••••••"
                    className={`${inp(fieldErrors.password)} pr-12`}
                  />
                  <EyeToggle show={showRegPass} onToggle={() => setShowRegPass(v => !v)} />
                </div>
                {fieldErrors.password && <p className="text-xs text-red-500 mt-1">{fieldErrors.password}</p>}
                {/* Live strength indicator */}
                <PasswordStrength password={regPassword} />
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-[11px] font-bold text-[#3b9fd4] uppercase tracking-wider mb-1.5">Confirm Password</label>
                <div className="relative">
                  <input type={showRegConfirm ? "text" : "password"} autoComplete="new-password" required
                    value={regConfirm} onChange={e => { setRegConfirm(e.target.value); setFieldErrors(f => ({...f, confirm: undefined})); }}
                    placeholder="••••••••"
                    className={`${inp(fieldErrors.confirm)} pr-12`}
                  />
                  <EyeToggle show={showRegConfirm} onToggle={() => setShowRegConfirm(v => !v)} />
                </div>
                {fieldErrors.confirm && <p className="text-xs text-red-500 mt-1">{fieldErrors.confirm}</p>}
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-3 mt-1 border-2 border-slate-800 rounded-xl text-sm font-extrabold text-slate-800 tracking-widest hover:bg-slate-800 hover:text-white transition-all disabled:opacity-60">
                {loading ? "CREATING…" : "REGISTER"}
              </button>
            </form>

            <p className="text-center text-sm text-slate-400 mt-6">
              Already have an account?{" "}
              <button onClick={() => { setMode("login"); setError(""); setFieldErrors({}); }}
                className="text-[#3b9fd4] font-bold hover:underline">
                Sign in
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
