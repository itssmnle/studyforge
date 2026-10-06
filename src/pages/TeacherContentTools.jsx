import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { FiBookOpen, FiLayers, FiShield, FiTarget } from "react-icons/fi";
import { useAuthModal } from "../context/AuthModalContext";
import QuestionBankEditor from "../components/QuestionBankEditor";
import StudyPackEditor from "../components/StudyPackEditor";
import TeacherNotesEditor from "../components/TeacherNotesEditor";
import { listStudyPacks } from "../utils/studyResources";
import "../styles/StudyWorkspace.css";
import "../styles/Platform.css";

const content = {
  notes: { eyebrow: "Teacher content", title: "Revision notes", description: "Create and update the notes students see in the shared library.", icon: FiBookOpen },
  flashcards: { eyebrow: "Teacher content", title: "Flashcards and study packs", description: "Maintain shared flashcard decks or make reusable study packs for homework.", icon: FiLayers },
  questions: { eyebrow: "Teacher content", title: "Practice questions", description: "Create, amend, and remove questions from the practice bank.", icon: FiTarget },
};

export default function TeacherContentTools({ section }) {
  const { user, openLogin } = useAuthModal();
  const [packs, setPacks] = useState([]);
  const [error, setError] = useState("");
  const details = content[section];
  useEffect(() => {
    if (section !== "flashcards" || user?.role !== "teacher") return;
    let active = true;
    listStudyPacks(user).then(value => { if (active) setPacks(value); }).catch(loadError => { if (active) setError(loadError.message); });
    return () => { active = false; };
  }, [section, user]);

  if (!user) return <main className="platform-shell access-page"><FiShield className="access-icon" /><span className="eyebrow">Teacher access</span><h1>Teacher content</h1><p>Sign in with a teacher account to manage shared learning resources.</p><button className="platform-button primary" onClick={() => openLogin("login")}>Teacher login</button></main>;
  if (user.role !== "teacher") return <Navigate to="/launchpad" replace />;
  const Icon = details.icon;
  return <main className="platform-shell teacher-content-page">
    <header className="teacher-content-header"><Icon /><div><span className="eyebrow">{details.eyebrow}</span><h1>{details.title}</h1><p>{details.description}</p></div></header>
    {error && <p role="alert">{error}</p>}
    {section === "notes" && <TeacherNotesEditor user={user} />}
    {section === "flashcards" && <StudyPackEditor user={user} packs={packs} onSaved={pack => setPacks(current => [pack, ...current.filter(item => item.id !== pack.id)])} />}
    {section === "questions" && <QuestionBankEditor />}
  </main>;
}
