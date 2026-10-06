import { Link, useSearchParams } from "react-router-dom";
import { FiArrowRight, FiFilter, FiTarget } from "react-icons/fi";
import { scienceSubjects } from "../data/scienceCurriculum";
import { questionsForTopic } from "../data/scienceQuestions";
import "../styles/Platform.css";

export default function ExamQuestions() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q")?.trim().toLowerCase() || "";
  const availableTopics = scienceSubjects.flatMap((subject) =>
    subject.topics
      .map((topic) => ({ subject, topic, count: questionsForTopic(subject.id, topic.id).length }))
      .filter((item) => item.count > 0)
  ).filter(({ subject, topic }) => !query || `${subject.name} ${topic.name} ${topic.subtopics.join(" ")}`.toLowerCase().includes(query));

  return (
    <main className="platform-shell question-library-page">
      <header className="library-header">
        <span className="eyebrow">Original question bank</span>
        <h1>{query ? `Results for “${searchParams.get("q")}”` : "Practise by topic"}</h1>
        <p>{availableTopics.length ? "Choose a science topic. Every available question includes an answer and explanation." : "No available practice topics match that search yet."}</p>
      </header>
      <div className="library-toolbar"><span><FiFilter /> KS4 Science</span><span><FiTarget /> {availableTopics.reduce((sum, item) => sum + item.count, 0)} questions available in this prototype</span></div>
      <section className="library-grid">
        {availableTopics.map(({ subject, topic, count }) => (
          <article className="library-card" key={`${subject.id}-${topic.id}`} style={{ "--subject-color": subject.color }}>
            <span className="subject-label">{subject.name}</span>
            <h2>{topic.name}</h2>
            <p>{topic.subtopics.join(" · ")}</p>
            <div><span>{count} questions</span><Link to={`/practice/${subject.id}/${topic.id}`}>Start practice <FiArrowRight /></Link></div>
          </article>
        ))}
      </section>
    </main>
  );
}
