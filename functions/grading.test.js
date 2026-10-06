import test from 'node:test';
import assert from 'node:assert/strict';
import { grade } from './grading.js';
const questions = [{ id: 'q1', prompt: 'Text', answer: 'Cell', type: 'short-answer' }, { id: 'q2', prompt: 'Number', answer: 12, type: 'numerical', tolerance: 0.1 }];
test('grades canonical answers and rejects numeric trailing junk', () => {
  assert.equal(grade(questions, { q1: ' CELL ', q2: '12abc' }).score, 50);
  assert.equal(grade(questions, { q1: 'wrong', q2: '12.05' }).score, 50);
  assert.equal(grade(questions, {}).score, 0);
});
test('rejects injected question IDs and malformed answers', () => {
  for (const answers of [{ foreign: 'Cell' }, { q1: { correct: true } }, { q1: 'a'.repeat(10001) }, [], null]) assert.throws(() => grade(questions, answers));
  assert.throws(() => grade([], {}));
  assert.throws(() => grade([questions[0], questions[0]], {}));
});
