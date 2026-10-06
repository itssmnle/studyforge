import { NavLink } from "react-router-dom";
import { FiBookOpen, FiEdit3, FiHome, FiLayers, FiTarget, FiUsers } from "react-icons/fi";
import { useAuthModal } from "../context/AuthModalContext";

const links = [
  { to: "/launchpad", label: "Dashboard", icon: FiHome },
  { to: "/notes", label: "Revision notes", icon: FiBookOpen },
  { to: "/my-notes", label: "My notes", icon: FiEdit3 },
  { to: "/flashcards", label: "Flashcards", icon: FiLayers },
  { to: "/examquestions", label: "Practice", icon: FiTarget },
];

export default function AppNavigation() {
  const { user } = useAuthModal();
  const navigationLinks = user?.role === "teacher"
    ? [
      { to: "/teachers", label: "Dashboard", icon: FiUsers },
      { to: "/teachers/notes", label: "Notes", icon: FiBookOpen },
      { to: "/teachers/flashcards", label: "Flashcards", icon: FiLayers },
      { to: "/teachers/questions", label: "Practice questions", icon: FiTarget },
    ]
    : links.filter((link) => user || !["/launchpad", "/my-notes"].includes(link.to));

  return (
    <div className="app-navigation" aria-label="Primary navigation">
      <div className="app-navigation-inner">
        {navigationLinks.map((link) => {
          const LinkIcon = link.icon;
          return <NavLink to={link.to} end={link.to === "/teachers"} key={link.to} className={({ isActive }) => isActive ? "active" : ""}><LinkIcon /> {link.label}</NavLink>;
        })}
      </div>
    </div>
  );
}
