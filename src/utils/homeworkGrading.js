import { grade } from '../../functions/grading.js';
export function gradeHomework(submission, assignment) {
  if (!assignment?.questionSnapshot?.length) return { ...submission, score: null, responses: [], gradingStatus: 'unavailable' };
  const input = submission.schemaVersion === 2 ? submission.answers : Object.fromEntries((submission.responses || []).map(r => [r.questionId, r.answer]));
  const answers = Object.fromEntries(assignment.questionSnapshot.map(q => [q.id, typeof input?.[q.id] === 'string' ? input[q.id].slice(0,10000) : '']));
  const result = grade(assignment.questionSnapshot, answers);
  const responses = result.responses.map(response => {
    const claim = submission.selfMarks?.[response.questionId];
    const selfMarked = response.answered && !response.correct && typeof claim === 'boolean';
    return { ...response, selfMarked, selfMarkedCorrect: selfMarked && claim === true };
  });
  const selfMarkedCount = responses.filter(r => r.selfMarked).length;
  const selfAssessedCorrect = responses.filter(r => r.correct || r.selfMarkedCorrect).length;
  return { ...submission, ...result, responses, selfMarkedCount, selfAssessedCorrect,
    selfAssessedScore: Math.round(100 * selfAssessedCorrect / result.total), subject: assignment.subject, topic: assignment.topic, topicName: assignment.topicName || assignment.topic,
    completedAt: submission.submittedAt?.toDate?.().toISOString() || submission.completedAt || null,
    gradingStatus: 'calculated-from-answers' };
}
