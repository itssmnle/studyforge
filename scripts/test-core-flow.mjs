import assert from "node:assert/strict";
import { exactTextMatch, isCorrectAnswer } from "../src/utils/answerGrading.js";
import { loadPractice, persistPractice, removePractice } from "../src/utils/progressPersistence.js";

assert.equal(exactTextMatch("  CELL membrane ", "cell membrane"), true);
assert.equal(isCorrectAnswer({ type: "numerical", answer: 12, tolerance: 0.1 }, "12.05"), true);
assert.equal(isCorrectAnswer({ type: "numerical", answer: 12, tolerance: 0.1 }, "12abc"), false);
assert.equal(isCorrectAnswer({ type: "short-answer", answer: "diffusion", acceptableAnswers: ["diffusion", "net diffusion"] }, "Net  diffusion"), true);

const values = new Map();
const storage = { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
assert.throws(() => persistPractice(storage, "guest", { score: 80 }), /Create an account/);
const saved = persistPractice(storage, "sam", { score: 80 }, Date.UTC(2026, 9, 4));
assert.equal(saved.completedAt, "2026-10-04T00:00:00.000Z");
assert.deepEqual(loadPractice(storage, "sam").map((entry) => entry.score), [80]);
assert.equal(loadPractice(storage, "another-user").length, 0);
assert.equal(removePractice(storage, "sam", saved.id), true);
assert.equal(loadPractice(storage, "sam").length, 0);

console.log("Passed: active question grading and account-scoped progress persistence.");
