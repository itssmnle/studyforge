import flashcardDecks from "../data/flashcardDecks";
import { loadDeckCards } from "./studyResources";

const topicDeckIds = {
  biology: {
    "cells-and-organisation": "chapter-1-cells-and-organisms",
    "body-systems-and-movement": "chapter-1-cells-and-organisms",
    "nutrition-digestion-and-health": "chapter-2-nutrition-and-digestion",
    "gas-exchange-and-respiration": "chapter-3-gas-exchange-and-respiration",
    "ecosystems-and-photosynthesis": "chapter-4-ecosystems-and-photosynthesis",
    reproduction: "chapter-5-reproduction",
    "genetics-evolution-and-variation": "chapter-6-genetics-evolution-and-variation",
  },
  chemistry: {
    "particle-model": "chapter-1-the-particle-model",
    "atoms-elements-and-compounds": "chapter-2-atoms-elements-and-compounds",
    "pure-and-impure-substances": "chapter-3-pure-and-impure-substances",
    "periodic-table": "chapter-2-atoms-elements-and-compounds",
    "chemical-reactions": "chapter-4-chemical-reactions",
    "chemical-energy": "chapter-4-chemical-reactions",
    "materials-and-reactivity": "chapter-4-chemical-reactions",
    "earth-and-atmosphere": "chapter-5-earth-and-atmosphere",
  },
  physics: {
    "forces-and-motion": "chapter-1-forces-and-motion",
    energy: "chapter-2-energy",
    waves: "chapter-3-waves",
    "electricity-and-electromagnetism": "chapter-4-electricity-and-electromagnetism",
    "space-physics": "chapter-5-space-physics",
  },
};

export const resolveFlashcardSubject = (subject) =>
  Object.keys(flashcardDecks).find((name) => name.toLowerCase() === String(subject || "").toLowerCase());

export const flashcardDeckForTopic = (subjectId, topicId) => {
  const subject = resolveFlashcardSubject(subjectId);
  const deckId = topicDeckIds[String(subjectId).toLowerCase()]?.[topicId];
  return subject && deckId ? { subject, deckId } : null;
};

export const loadFlashcardQuestionsForTopic = async (subjectId, topicId) => {
  const route = flashcardDeckForTopic(subjectId, topicId);
  const deck = route && flashcardDecks[route.subject]?.find((item) => item.id === route.deckId);
  if (!deck) throw new Error("No flashcard deck is linked to this topic yet.");
  return (await loadDeckCards(deck)).map((card, index) => ({
    id: `flash-${deck.id}-${index + 1}`,
    type: "short-answer",
    prompt: card.front,
    answer: card.back,
    acceptableAnswers: [card.back],
    difficulty: "Recall",
    marks: 1,
    subtopic: deck.title,
    provenance: "StudyForge flashcards",
  }));
};
