import { useState } from "react";
import { FiCheckCircle, FiKey, FiLock, FiUser } from "react-icons/fi";
import { useAuthModal } from "../context/AuthModalContext";
import "../styles/Settings.css";

export default function AccountSettings() {
  const { user, changePassword } = useAuthModal();
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    if (form.newPassword !== form.confirmPassword) {
      setError("The new passwords do not match.");
      return;
    }
    if (form.currentPassword === form.newPassword) {
      setError("Choose a new password that is different from your current password.");
      return;
    }
    setPending(true);
    try {
      await changePassword(form);
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setSuccess("Your password has been changed.");
    } catch (changeError) {
      setError(changeError.message);
    } finally {
      setPending(false);
    }
  };

  return (
    <main className="platform-shell settings-page">
      <header className="settings-header"><span className="eyebrow">Account settings</span><h1>Settings</h1><p>Review your account and update your sign-in password.</p></header>
      <div className="settings-grid">
        <section className="settings-card account-summary-card">
          <div className="settings-card-title"><FiUser /><div><h2>Account</h2><p>Your Kojonote identity</p></div></div>
          <dl><div><dt>Full name</dt><dd>{user.fullName}</dd></div><div><dt>Username</dt><dd>@{user.username}</dd></div><div><dt>Account type</dt><dd>{user.role === "teacher" ? "Teacher" : "Student"}</dd></div>{user.profession && <div><dt>{user.role === "student" ? "Year group" : "Profession"}</dt><dd>{user.profession.replace(/^Year\s*/i, "Year ")}</dd></div>}</dl>
        </section>
        <section className="settings-card">
          <div className="settings-card-title"><FiKey /><div><h2>Reset password</h2><p>Enter your current password before choosing a new one.</p></div></div>
          <form className="password-settings-form" onSubmit={submit}>
            <label>Current password<div><FiLock /><input type="password" autoComplete="current-password" value={form.currentPassword} onChange={(event) => setForm({ ...form, currentPassword: event.target.value })} required /></div></label>
            <label>New password<div><FiLock /><input type="password" autoComplete="new-password" minLength="8" value={form.newPassword} onChange={(event) => setForm({ ...form, newPassword: event.target.value })} required /></div><small>At least 8 characters.</small></label>
            <label>Confirm new password<div><FiLock /><input type="password" autoComplete="new-password" minLength="8" value={form.confirmPassword} onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })} required /></div></label>
            {error && <p className="settings-message error">{error}</p>}
            {success && <p className="settings-message success"><FiCheckCircle /> {success}</p>}
            <button className="platform-button primary" disabled={pending}>{pending ? "Changing password..." : "Reset password"}</button>
          </form>
        </section>
      </div>
    </main>
  );
}
