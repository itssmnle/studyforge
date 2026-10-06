export const PRIVATE_PRACTICE_KEY = "studyforge.private-practice";

export const parseStoredList = (value) => {
  try {
    const parsed = JSON.parse(value || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const practiceKeyFor = (username) => `${PRIVATE_PRACTICE_KEY}.${username}`;

export const loadPractice = (storage, username) => parseStoredList(storage.getItem(practiceKeyFor(username)));

export const createCompletedPractice = (result, now = Date.now()) => ({
  ...result,
  id: String(now),
  completedAt: new Date(now).toISOString(),
});

export const persistPractice = (storage, username, result, now = Date.now()) => {
  if (!username || username === "guest") throw new Error("Create an account to save this practice result.");
  const completed = createCompletedPractice(result, now);
  storage.setItem(practiceKeyFor(username), JSON.stringify([completed, ...loadPractice(storage, username)].slice(0, 50)));
  return completed;
};

export const removePractice = (storage, username, practiceId) => {
  const entries = loadPractice(storage, username);
  const next = entries.filter((entry) => entry.id !== practiceId);
  if (next.length === entries.length) return false;
  storage.setItem(practiceKeyFor(username), JSON.stringify(next));
  return true;
};
