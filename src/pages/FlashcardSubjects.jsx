import SubjectCard from "../components/SubjectCard";
import flashcardDecks from "../data/flashcardDecks";
import { scienceSubjects } from "../data/scienceCurriculum";
import flashcardsArt from "../assets/page-heroes/flashcards.png";
import "../styles/Flashcards.css";
import "../styles/ResourcePageHero.css";

const flashcardSubjectDetails = {
  Maths: { id: "maths", qualification: "KS3", color: "#5d3eaa", secondaryColor: "#e5def9", description: "Number, algebra, geometry, data and probability for Years 7 to 9." },
};

export default function FlashcardSubjects() {
  return (
    <main className="flash-library-page flash-library-landing">
      <header className="flash-library-header resource-page-hero"><div className="resource-page-hero-copy"><span className="eyebrow">Recall practice</span><h1>Flashcards</h1><p>Select a subject, then use the chapter sidebar to move through its revision decks.</p></div><img className="resource-page-hero-art" src={flashcardsArt} alt="Preview of StudyForge flashcards" /></header>
      <section className="subject-card-grid" aria-label="Flashcard subjects">
        {Object.entries(flashcardDecks).filter(([subject]) => ["Maths", "Biology", "Chemistry", "Physics"].includes(subject)).map(([subject, chapters]) => {
          const details = scienceSubjects.find((item) => item.name === subject) || flashcardSubjectDetails[subject];
          const cardCount = chapters.reduce((total, chapter) => total + chapter.cards, 0);
          return <SubjectCard subject={details} to={`/flashcards/${subject}`} metadata={`${chapters.length} chapters · ${cardCount} cards`} key={subject} />;
        })}
      </section>
    </main>
  );
}
