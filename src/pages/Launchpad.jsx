import SubjectCard from "../components/SubjectCard";
import { scienceSubjects } from "../data/scienceCurriculum";
import { mathsSubject } from "../data/subjectConfig";
import "../styles/Launchpad.css";

export default function Launchpad() {
  const courses = [{ ...mathsSubject, to: "/subjects/maths" }, ...scienceSubjects.map((subject) => ({ ...subject, to: `/subjects/${subject.id}` }))];

  return (
    <main className="platform-shell course-catalogue">
      <header>
        <span className="eyebrow">Learn without an account</span>
        <h1>Choose a subject</h1>
        <p>Open a topic, read the lesson, and try a short practice set. Create an account only when you want to save progress.</p>
      </header>
      <section className="subject-card-grid" aria-label="Available subjects">
        {courses.map((course) => <SubjectCard subject={course} to={course.to} metadata={course.id === "maths" ? "Revision notes and flashcards" : `${course.topics.length} topics`} key={course.id} />)}
      </section>
    </main>
  );
}
