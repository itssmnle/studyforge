export function validateAnswers(questions, answers) {
  if (!Array.isArray(questions) || !questions.length || questions.length > 300) throw new Error('Question set unavailable');
  if (!answers || typeof answers !== 'object' || Array.isArray(answers)) throw new Error('Answers must be an object');
  const ids = new Set(questions.map(q => q.id));
  if (ids.size !== questions.length || Object.keys(answers).some(id => !ids.has(id))) throw new Error('Invalid question IDs');
  if (Object.values(answers).some(a => typeof a !== 'string' || a.length > 10000)) throw new Error('Invalid answer');
}
const normalise = value => String(value).trim().toLowerCase().replace(/\s+/g, ' ');
export function grade(questions, answers) {
  validateAnswers(questions, answers);
  const responses = questions.map(q => {
    const answer = answers[q.id] || '';
    const answered = Boolean(answer.trim());
    const correct = answered && (q.type === 'numerical'
      ? Number.isFinite(Number(answer)) && Math.abs(Number(answer) - Number(q.answer)) <= (q.tolerance ?? 0)
      : (q.acceptableAnswers || [q.answer]).some(a => normalise(a) === normalise(answer)));
    return { questionId: q.id, prompt: q.prompt, answer, correctAnswer: q.answer, answered, correct, selfMarked: false };
  });
  const correct = responses.filter(r => r.correct).length;
  return { responses, correct, total: questions.length, score: Math.round(100 * correct / questions.length) };
}
