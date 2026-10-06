import { Navigate, useParams } from "react-router-dom";
import flashcardDecks from "../data/flashcardDecks";
import { resolveFlashcardSubject } from "../utils/flashcardDeckRouting";

export default function FlashcardChapters() {
  const { subject } = useParams();
  const resolvedSubject = resolveFlashcardSubject(subject);
  const chapters = flashcardDecks[resolvedSubject] || [];
  return <Navigate to={chapters[0] ? `/flashcards/${resolvedSubject}/${chapters[0].id}` : "/flashcards"} replace />;
}
