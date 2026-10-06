import { Navigate } from "react-router-dom";
import { useAuthModal } from "../context/AuthModalContext";
import StudentDashboard from "../pages/StudentDashboard";

export default function RoleDashboard() {
  const { user } = useAuthModal();

  if (user?.role === "teacher") return <Navigate to="/teachers" replace />;
  return <StudentDashboard />;
}
