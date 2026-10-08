import { FiSidebar } from "react-icons/fi";

export default function NoteTopicsToggle({ hidden, onToggle }) {
  const label = hidden ? "Show topics" : "Hide topics";
  return (
    <button className="note-topics-toggle" type="button" onClick={onToggle} aria-expanded={!hidden} aria-label={label}>
      <FiSidebar />
      <span className="note-topics-tooltip" role="tooltip">{label}</span>
    </button>
  );
}
