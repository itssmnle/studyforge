import { useEffect, useState } from "react";
import { FiActivity, FiBookOpen } from "react-icons/fi";
import { getLearningSessions, PROGRESS_CHANGE_EVENT } from "../utils/progressStorage";
import { useAuthModal } from "../context/AuthModalContext";

export default function ProgressStrip() {
  const { user } = useAuthModal();
  const [, refresh] = useState(0);

  useEffect(() => {
    const update = () => refresh((value) => value + 1);
    window.addEventListener(PROGRESS_CHANGE_EVENT, update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener(PROGRESS_CHANGE_EVENT, update);
      window.removeEventListener("storage", update);
    };
  }, [user]);

  const sessions = getLearningSessions();
  const completedQuestions = sessions.reduce((total, session) => total + session.total, 0);
  const level = Math.floor(completedQuestions / 10) + 1;
  const levelProgress = completedQuestions % 10;

  if (!user || user.role === "teacher") return null;

  return (
    <div className="progress-strip">
      <div className="progress-strip-inner">
        <p>{user ? `Ready for another session, ${user.displayName}?` : "Build your understanding one topic at a time."}</p>
        <div className="streak-stat"><FiActivity /><strong>{sessions.length}</strong><span>sessions</span></div>
        <div className="level-stat"><FiBookOpen /><div><span>Level {level}</span><div className="level-track"><i style={{ width: `${levelProgress * 10}%` }} /></div></div><small>{levelProgress}/10 questions</small></div>
      </div>
    </div>
  );
}
