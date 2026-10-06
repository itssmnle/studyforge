const normalise = (value) => String(value ?? "").trim().toLowerCase().replace(/\s+/g, " ");

export const exactTextMatch = (answer, correctAnswer) => (
  Boolean(String(answer ?? "").trim()) && normalise(answer) === normalise(correctAnswer)
);

export const isCorrectAnswer = (question, answer) => {
  if (!question || !String(answer ?? "").trim()) return false;
  if (question.type === "numerical") {
    const number = Number(answer);
    return Number.isFinite(number) && Math.abs(number - Number(question.answer)) <= (question.tolerance ?? 0);
  }
  const accepted = question.acceptableAnswers || [question.answer];
  return accepted.some((item) => normalise(item) === normalise(answer));
};
