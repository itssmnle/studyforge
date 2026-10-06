import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiAlertCircle, FiArrowLeft, FiEye, FiEyeOff, FiKey, FiLock, FiUser } from "react-icons/fi";
import { IoClose } from "react-icons/io5";
import { useAuthModal } from "../context/AuthModalContext";
import "./LoginModal.css";

export default function LoginModal() {
  const navigate = useNavigate();
  const { isLoginOpen, closeLogin, authMode, setAuthMode, login, register } = useAuthModal();
  const [form, setForm] = useState({ username: "", fullName: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (isLoginOpen) {
      setError("");
      setShowPassword(false);
      setForm({ username: "", fullName: "", password: "" });
    }
  }, [isLoginOpen, authMode]);

  if (!isLoginOpen) return null;

  if (authMode === "recovery") {
    return (
      <div className="login-backdrop" onMouseDown={closeLogin}>
        <section className="login-modal academy-login" onMouseDown={(event) => event.stopPropagation()} aria-modal="true" role="dialog" aria-labelledby="recovery-title">
          <button className="login-close" onClick={closeLogin} aria-label="Close password help"><IoClose /></button>
          <span className="auth-kicker">Password help</span>
          <h2 id="recovery-title">Reset your password</h2>
          <p className="auth-intro">StudyForge accounts use usernames, so Firebase cannot send these accounts an email reset link.</p>
          <div className="password-recovery-card"><FiKey /><div><strong>Ask your teacher or StudyForge administrator</strong><p>They can issue a temporary password. Log in with it, then choose Settings and create a private password you will remember.</p></div></div>
          <button className="login-secondary" type="button" onClick={() => setAuthMode("login")}><FiArrowLeft /> Back to log in</button>
        </section>
      </div>
    );
  }

  const submit = async (event) => {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      if (authMode === "register") await register(form);
      else await login(form);
      navigate("/launchpad");
    } catch (submissionError) {
      setError(submissionError.message);
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="login-backdrop" onMouseDown={closeLogin}>
      <section className="login-modal academy-login" onMouseDown={(event) => event.stopPropagation()} aria-modal="true" role="dialog" aria-labelledby="auth-title">
        <button className="login-close" onClick={closeLogin} aria-label="Close sign in"><IoClose /></button>
        <span className="auth-kicker">StudyForge account</span>
        <h2 id="auth-title">{authMode === "register" ? "Create your account" : "Welcome back"}</h2>
        <p className="auth-intro">{authMode === "register" ? "Create a student account and keep your progress securely synced." : "Sign in with your StudyForge username and password."}</p>

        <div className="auth-tabs" role="tablist">
          <button className={authMode === "login" ? "active" : ""} onClick={() => setAuthMode("login")} type="button">Log in</button>
          <button className={authMode === "register" ? "active" : ""} onClick={() => setAuthMode("register")} type="button">Create account</button>
        </div>

        <form onSubmit={submit}>
          {authMode === "register" && (
            <>
              <label>Full name<input autoComplete="name" value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} placeholder="user_fullname" required /></label>
            </>
          )}
          <label>Username<div className="auth-input-wrap"><FiUser /><input autoComplete="username" value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} placeholder="user_name" required /></div></label>
          <label>Password<div className="auth-input-wrap"><FiLock /><input autoComplete={authMode === "register" ? "new-password" : "current-password"} type={showPassword ? "text" : "password"} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="At least 8 characters" required /><button className="password-toggle" type="button" aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword} onClick={() => setShowPassword((value) => !value)}>{showPassword ? <FiEyeOff /> : <FiEye />} {showPassword ? "Hide" : "Show"}</button></div></label>
          {authMode === "login" && <button className="forgot-password" type="button" onClick={() => setAuthMode("recovery")}>Forgot password?</button>}
          {error && <div className="auth-error"><FiAlertCircle /> {error}</div>}
          <button className="login-primary" disabled={pending}>{pending ? "Please wait..." : authMode === "register" ? "Create account" : "Log in"}</button>
        </form>

        <p className="auth-security-note">Your account keeps your courses, homework, and revision progress in one place.</p>
      </section>
    </div>
  );
}
