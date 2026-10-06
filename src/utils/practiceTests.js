export const typeLabels = { 'multiple-choice': 'Multiple choice', 'short-answer': 'Short response', 'extended-response': 'Extended response', numerical: 'Calculation', 'diagram-based': 'Diagram-based' };
export const difficultyFor = question => question.difficulty === 'Higher' ? 'Hard' : question.difficulty === 'Foundation' ? 'Easy' : ['Easy', 'Medium', 'Hard'].includes(question.difficulty) ? question.difficulty : 'Medium';
export const subchapterKey = (topicId, subtopic) => `${topicId}::${subtopic}`;
export const filterTestQuestions = (questions, selection, types, difficulties) => questions.filter(question => selection.includes(subchapterKey(question.topic, question.subtopic)) && types.includes(question.type) && difficulties.includes(difficultyFor(question)));
export function buildTestQuestions(questions, minutes) {
  const pool = [...questions];
  for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
  const chosen = []; let duration = 0;
  for (const question of pool) { if (duration >= minutes) break; chosen.push(question); duration += Math.max(1, Number(question.marks) || 1) * 1.5; }
  return chosen;
}
export function saveTestDraft(test) { const id = crypto.randomUUID(); sessionStorage.setItem(`studyforge.test.${id}`, JSON.stringify(test)); return id; }
export function readTestDraft(id) { try { return id ? JSON.parse(sessionStorage.getItem(`studyforge.test.${id}`)) : null; } catch { return null; } }
