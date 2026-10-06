import { removeCloudQuestion, syncQuestion } from "../utils/cloudData";
import defaultQuestions from "./scienceQuestions.generated.json";

export const scienceQuestions = defaultQuestions;

const QUESTION_BANK_KEY = "studyforge.question-bank";
export const QUESTION_BANK_CHANGE_EVENT = "studyforge:question-bank-changed";

export const getScienceQuestions = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(QUESTION_BANK_KEY) || "null");
    return Array.isArray(saved) ? saved : scienceQuestions;
  } catch {
    return scienceQuestions;
  }
};

const persistQuestions = (questions) => {
  localStorage.setItem(QUESTION_BANK_KEY, JSON.stringify(questions));
  window.dispatchEvent(new CustomEvent(QUESTION_BANK_CHANGE_EVENT));
};

export const saveScienceQuestion = (question) => {
  const questions = getScienceQuestions();
  persistQuestions([question, ...questions.filter((item) => item.id !== question.id)]);
  syncQuestion(question);
};

export const deleteScienceQuestion = (questionId) => {
  persistQuestions(getScienceQuestions().filter((question) => question.id !== questionId));
  removeCloudQuestion(questionId);
};

export const questionsForTopic = (subject, topic) =>
  getScienceQuestions().filter((question) => question.subject === subject && question.topic === topic);
