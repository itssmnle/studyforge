import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { FiDownload, FiLock, FiShield, FiUser, FiUsers } from "react-icons/fi";
import { accountDatabase } from "../utils/accountDatabase";
import { useAuthModal } from "../context/AuthModalContext";
import "../styles/Platform.css";

const safeCsvValue = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;

export default function AccountDirectory() {
  const { user, openLogin } = useAuthModal();
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    if (user?.role === "teacher") accountDatabase.list().then(setAccounts);
  }, [user]);

  const exportCsv = () => {
    const rows = [
      ["Full name", "Username", "Role", "Created", "Password status"],
      ...accounts.map((account) => [account.fullName, account.username, account.role, account.createdAt, "Firebase Authentication"]),
    ];
    const csv = rows.map((row) => row.map(safeCsvValue).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "kojonote-accounts.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!user) {
    return (
      <main className="platform-shell access-page">
        <FiShield className="access-icon" />
        <span className="eyebrow">Teacher access</span>
        <h1>Account directory</h1>
        <p>Sign in with a teacher account to view the account directory.</p>
        <button className="platform-button primary" onClick={() => openLogin(user ? "register" : "login")}>{user ? "Create a teacher account" : "Teacher login"}</button>
      </main>
    );
  }
  if (user.role !== "teacher") return <Navigate to="/launchpad" replace />;

  return (
    <main className="platform-shell account-directory-page">
      <header className="directory-header">
        <div><span className="eyebrow">School directory</span><h1>Account directory</h1><p>Student and teacher accounts securely stored in Firebase.</p></div>
        <button className="platform-button secondary" onClick={exportCsv}><FiDownload /> Export safe CSV</button>
      </header>
      <aside className="security-callout"><FiLock /><div><strong>Passwords are never displayed or exported.</strong><p>Firebase Authentication stores and verifies credentials separately from profile records.</p></div></aside>
      <div className="directory-summary"><span><FiUsers /> {accounts.length} accounts</span><span><FiUser /> {accounts.filter((account) => account.role === "student").length} students</span><span><FiShield /> {accounts.filter((account) => account.role === "teacher").length} teachers</span></div>
      <div className="account-table-wrap"><table className="account-table"><thead><tr><th>Full name</th><th>Username</th><th>Role</th><th>Created</th><th>Credential</th></tr></thead><tbody>{accounts.map((account) => <tr key={account.username}><td>{account.fullName}</td><td>@{account.username}</td><td><span className={`role-chip ${account.role}`}>{account.role}</span></td><td>{new Date(account.createdAt).toLocaleDateString()}</td><td><FiLock /> Firebase Auth</td></tr>)}</tbody></table></div>
    </main>
  );
}
