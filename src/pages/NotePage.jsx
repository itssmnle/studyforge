import SubjectCard from "../components/SubjectCard";
import { FiCheckCircle } from "react-icons/fi";
import { noteSubjects } from "../data/noteSubjects";
import notesArt from "../assets/page-heroes/revision-notes.png";
import { usePublishedNotes } from "../utils/teacherNotes";
import "../styles/MarkdownNotes.css";
import "../styles/ResourcePageHero.css";

export default function NotePage() {
  const { notes } = usePublishedNotes();
  return (
    <main className="platform-shell notes-library">
      <header className="notes-library-header resource-page-hero"><div className="resource-page-hero-copy"><span className="eyebrow">Study smarter</span><h1>Revision notes</h1><p>Focused KS3 Maths and Science notes, organised by subject, year, and chapter.</p><div className="resource-hero-checks" aria-label="Revision note verification"><span><FiCheckCircle /> Verified Maths source</span><span><FiCheckCircle /> Curriculum linked</span><span><FiCheckCircle /> Worked examples included</span></div></div><img className="resource-page-hero-art" src={notesArt} alt="Preview of kojonote revision notes" /></header>
      <section className="subject-card-grid" aria-label="Revision note subjects">
        {noteSubjects.filter((subject) => ["maths", "biology", "chemistry", "physics"].includes(subject.id)).sort((a, b) => (a.id === "maths" ? -1 : b.id === "maths" ? 1 : 0)).map((subject) => {
          const isMaths = subject.id === "maths";
          const count = notes.filter((note) => note.subject === subject.id).length;
          return <SubjectCard subject={subject} to={isMaths ? "/notes/maths" : `/notes/${subject.id}`} metadata={isMaths ? "Complete Year 7 to 9 worked notes" : `${count} revision note chapters`} key={subject.id} />;
        })}
      </section>
    </main>
  );
}
