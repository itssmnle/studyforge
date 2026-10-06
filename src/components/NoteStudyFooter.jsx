import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FiArrowRight, FiBookOpen, FiChevronLeft, FiChevronRight, FiLayers, FiThumbsDown, FiThumbsUp } from "react-icons/fi";
import { completeFlow, startFlow } from "../utils/analytics";
import { useAuthModal } from "../context/AuthModalContext";
import { saveCourseMastery } from "../utils/courseMastery";
import { markNotePageComplete } from "../utils/noteProgress";

const pagePath = (page) => page?.url || (page ? `/notes/${page.note.subject}/${page.note.topic}/${page.section.id}` : null);

export default function NoteStudyFooter({ note, section, topic, flashcardDeck, previous, next, completeTopic = false }) {
  const { pathname } = useLocation();
  const { user } = useAuthModal();
  const completionRef = useRef(null);
  const storageKey = `studyforge.note-feedback.${note.subject}.${note.topic}.${section.id}`;
  const flowId = `${note.subject}/${note.topic}/${section.id}`;
  const [ratings, setRatings] = useState({});
  const rating = ratings[storageKey] ?? localStorage.getItem(storageKey) ?? "";

  useEffect(() => startFlow("lesson", flowId, "reading", pathname), [flowId, pathname]);
  useEffect(() => {
    const target = completionRef.current;
    if (!target || typeof IntersectionObserver === "undefined") return undefined;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      completeFlow("lesson", flowId, "lesson_completion", { subject: note.subject, topic: note.topic, lesson: section.id });
      markNotePageComplete(note.subject, note.topic, section.id);
      if (completeTopic && topic) {
        if (user) void saveCourseMastery(user.uid, note.subject, topic.id).catch(() => {});
        else sessionStorage.setItem(`studyforge.guest-notes.${note.subject}.${topic.id}`, "true");
      }
      observer.disconnect();
    }, { threshold: 0.45 });
    observer.observe(target);
    return () => observer.disconnect();
  }, [completeTopic, flowId, note.subject, note.topic, section.id, topic, user]);

  const rate = (value) => {
    localStorage.setItem(storageKey, value);
    setRatings((current) => ({ ...current, [storageKey]: value }));
  };

  return (
    <footer className="note-study-footer" ref={completionRef}>
      <section className="note-feedback" aria-label="Note feedback">
        <span>Was this revision note helpful?</span>
        <button className={rating === "yes" ? "selected" : ""} aria-pressed={rating === "yes"} onClick={() => rate("yes")}><FiThumbsUp /> Yes</button>
        <button className={rating === "no" ? "selected" : ""} aria-pressed={rating === "no"} onClick={() => rate("no")}><FiThumbsDown /> No</button>
      </section>

      {(topic || flashcardDeck) && <section className="note-build-section">
        <h2>Build on this topic</h2>
        <div className="note-build-links">
          {topic && <Link to={`/practice/${note.subject}/${topic.id}`}><span className="note-build-icon"><FiBookOpen /></span><span><strong>Check your understanding</strong><small>Try practice questions on this topic</small></span><FiArrowRight /></Link>}
          {flashcardDeck && <Link to={`/flashcards/${flashcardDeck.subject}/${flashcardDeck.deckId}`}><span className="note-build-icon"><FiLayers /></span><span><strong>Test your recall</strong><small>Reinforce key facts with flashcards</small></span><FiArrowRight /></Link>}
        </div>
      </section>}

      <nav className="note-page-navigation" aria-label="Revision note pages">
        {previous ? <Link to={pagePath(previous)}><FiChevronLeft /><span><small>Previous</small><strong>{previous.section.title}</strong></span></Link> : <span />}
        {next ? <Link className="next" to={pagePath(next)}><span><small>Next</small><strong>{next.section.title}</strong></span><FiChevronRight /></Link> : <span />}
      </nav>
    </footer>
  );
}
