import SubjectCard from "../components/SubjectCard";
import flashcardDecks from "../data/flashcardDecks";
import { scienceSubjects } from "../data/scienceCurriculum";
import { mathsSubject } from "../data/subjectConfig";
import flashcardsArt from "../assets/page-heroes/flashcards.png";
import "../styles/Flashcards.css";
import "../styles/ResourcePageHero.css";

const flashcardSubjectDetails = { Maths: mathsSubject };
const flashcardSubjectOrder = ["Maths", "Biology", "Chemistry", "Physics"];

export default function FlashcardSubjects() {
  return (
    <main className="flash-library-page flash-library-landing">
      <header className="flash-library-header resource-page-hero"><div className="resource-page-hero-copy"><span className="eyebrow">Recall practice</span><h1>Flashcards</h1><p>Select a subject, then use the chapter sidebar to move through its revision decks.</p></div><img className="resource-page-hero-art" src={flashcardsArt} alt="Preview of kojonote flashcards" /></header>
      <section className="subject-card-grid" aria-label="Flashcard subjects">
        {flashcardSubjectOrder.filter((subject) => flashcardDecks[subject]).map((subject) => {
          const chapters = flashcardDecks[subject];
          const details = scienceSubjects.find((item) => item.name === subject) || flashcardSubjectDetails[subject];
          const cardCount = chapters.reduce((total, chapter) => total + chapter.cards, 0);
          return <SubjectCard subject={details} to={`/flashcards/${subject}`} metadata={`${chapters.length} chapters · ${cardCount} cards`} key={subject} />;
        })}
      </section>
    </main>
  );
}
