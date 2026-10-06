import { Navigate } from "react-router-dom";
import { useAuthModal } from "../context/AuthModalContext";

export default function HideFromTeachers({ children }) {
  const { user } = useAuthModal();

  if (user?.role === "teacher") return <Navigate to="/teachers" replace />;
  return children;
}
