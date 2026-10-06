import { FiCheck } from "react-icons/fi";

export function TopicProgressRing({ completed, total, label }) {
  const safeTotal = Math.max(total, 0);
  const safeCompleted = Math.min(Math.max(completed, 0), safeTotal);
  const percent = safeTotal ? Math.round((safeCompleted / safeTotal) * 100) : 0;

  return (
    <span
      className="math-outline-marker"
      style={{ "--topic-progress": `${percent}%` }}
      role="img"
      aria-label={`${label}: ${safeCompleted} of ${safeTotal} notes complete`}
      title={`${safeCompleted} of ${safeTotal} notes complete`}
    />
  );
}

export function NoteProgressNode({ active = false, completed = false }) {
  const state = active ? "current" : completed ? "completed" : "pending";
  const label = active ? "Current note" : completed ? "Completed note" : "Not completed";

  return (
    <span className={`math-note-node is-${state}`} aria-label={label} title={label}>
      {state === "pending" ? null : <FiCheck />}
    </span>
  );
}
