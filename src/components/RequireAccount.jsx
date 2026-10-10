import { useState } from "react";
import { FiAlertCircle, FiEye, FiEyeOff, FiLock, FiUser } from "react-icons/fi";
import { useAuthModal } from "../context/AuthModalContext";
import "../styles/Platform.css";
import LoadingState from "./LoadingState";

export default function RequireAccount({ children, description = "Your courses, homework, and saved revision progress are available after you log in or create an account." }) {
  const { authReady, user, login, openLogin } = useAuthModal();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  if (!authReady) return <main className="platform-shell access-page"><LoadingState label="Loading your account!" detail="Checking your secure kojonote session" /></main>;
  if (user) return children;

  const submit = async (event) => {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      await login({ username, password });
    } catch (submissionError) {
      setError(submissionError.message);
    } finally {
      setPending(false);
    }
  };

  return (
    <main className="platform-shell access-page account-gate">
      <section className="account-gate-form" aria-labelledby="account-gate-title">
        <FiLock className="account-gate-lock" aria-hidden="true" />
        <h1 id="account-gate-title">Log in to your account</h1>
        <form onSubmit={submit}>
          <label>Username<div className="account-gate-input"><FiUser /><input autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} placeholder="user_name" required /></div></label>
          <label>Password<div className="account-gate-input"><FiLock /><input autoComplete="current-password" type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Your password" required /><button type="button" aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword} onClick={() => setShowPassword((value) => !value)}>{showPassword ? <FiEyeOff /> : <FiEye />}</button></div></label>
          <button className="account-gate-forgot" type="button" onClick={() => openLogin("recovery")}>Forgot password?</button>
          {error && <div className="account-gate-error"><FiAlertCircle /> {error}</div>}
          <button className="account-gate-submit" disabled={pending}>{pending ? "Signing in..." : "Log in"}</button>
        </form>
        <button className="account-gate-register" type="button" onClick={() => openLogin("register")}>Don’t have an account? Create one</button>
        <p className="account-gate-context">{description}</p>
      </section>
    </main>
  );
}
