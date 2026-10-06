import SubjectCard from "../components/SubjectCard";
import { scienceSubjects } from "../data/scienceCurriculum";
import "../styles/Launchpad.css";

const maths = {
  id: "maths",
  name: "Maths",
  qualification: "KS3",
  description: "Complete Years 7 to 9 revision notes and maths flashcards.",
  color: "#6f42c1",
  secondaryColor: "#eee8fb",
  to: "/subjects/maths",
};

export default function Launchpad() {
  const courses = [maths, ...scienceSubjects.map((subject) => ({ ...subject, to: `/subjects/${subject.id}` }))];

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
