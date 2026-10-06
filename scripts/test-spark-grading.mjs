import assert from 'node:assert/strict';
import { gradeHomework } from '../src/utils/homeworkGrading.js';
const assignment = { subject: 'biology', topic: 'cells', questionSnapshot: [{ id: 'q1', prompt: 'Cell?', answer: 'cell' }] };
assert.equal(gradeHomework({ schemaVersion: 2, answers: { q1: 'wrong' }, score: 100, responses: [{ questionId: 'q1', correct: true }] }, assignment).score, 0);
assert.equal(gradeHomework({ schemaVersion: 2, answers: { q1: ' CELL ' }, score: 0 }, assignment).score, 100);
assert.equal(gradeHomework({ responses: [{ questionId: 'q1', answer: 'wrong', correct: true, correctAnswer: 'wrong' }] }, assignment).score, 0);
assert.equal(gradeHomework({ schemaVersion: 2, answers: { q1: { correct: true } } }, assignment).score, 0);
assert.equal(gradeHomework({ score: 100 }, {}).score, null);
console.log('Passed Spark grading: ignores forged marks and answer keys, grades canonical answers, handles malformed responses and missing question sets.');
const selfMarked = gradeHomework({ schemaVersion: 2, answers: { q1: 'same idea in my words' }, selfMarks: { q1: true }, score: 100 }, assignment);
assert.equal(selfMarked.score, 0);
assert.equal(selfMarked.selfAssessedScore, 100);
assert.equal(selfMarked.responses[0].correct, false);
assert.equal(selfMarked.responses[0].selfMarkedCorrect, true);
assert.equal(gradeHomework({ schemaVersion: 2, answers: { q1: 'wrong' }, selfMarks: { q1: 'true' } }, assignment).selfAssessedScore, 0);
console.log('Passed self-marking: student claims persist separately and cannot overwrite automatic marks.');

const { correctPercentage, isResponseCorrect } = await import('../src/utils/resultMetrics.js');
assert.equal(correctPercentage(selfMarked), 100);
assert.equal(isResponseCorrect(selfMarked.responses[0]), true);
const mixed = gradeHomework({ schemaVersion: 2, answers: { q1: 'cell', q2: 'my explanation', q3: 'wrong' }, selfMarks: { q2: true, q3: false } }, {
  ...assignment, questionSnapshot: ['q1', 'q2', 'q3'].map(id => ({ id, prompt: 'Cell?', answer: 'cell' })),
});
assert.equal(correctPercentage(mixed), 67);
assert.equal(mixed.responses.filter(isResponseCorrect).length, 2);
assert.equal(correctPercentage({ score: 0, selfAssessedScore: 100 }), 100);
assert.equal(correctPercentage({ score: 40 }), 40);
assert.equal(isResponseCorrect(undefined), false);
console.log('Passed homework metrics: self-marks count in scores and question results, with legacy score fallback.');
