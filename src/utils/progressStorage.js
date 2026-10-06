import { loadPractice, persistPractice, removePractice } from "./progressPersistence";
import { removeCloudPrivatePractice, syncPrivatePractice, syncSubmission } from "./cloudData";

const HOMEWORK_SUBMISSION_KEY = "studyforge.homework-submissions";
const SESSION_KEY = "studyforge.local-session";
export const PROGRESS_CHANGE_EVENT = "studyforge:progress-changed";

const read = (key) => {
  try {
    return JSON.parse(window.localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
};

const write = (key, value) => window.localStorage.setItem(key, JSON.stringify(value));

const currentUsername = () => {
  try {
    return JSON.parse(window.localStorage.getItem(SESSION_KEY) || "null")?.username || "guest";
  } catch {
    return "guest";
  }
};

export const getPrivatePractice = () => loadPractice(window.localStorage, currentUsername());
export const getAllHomeworkSubmissions = () => read(HOMEWORK_SUBMISSION_KEY);
export const getHomeworkSubmissions = () => getAllHomeworkSubmissions().filter((entry) => entry.username === currentUsername());
export const getLearningSessions = () => [...getPrivatePractice(), ...getHomeworkSubmissions()];

export const savePrivatePractice = async (result) => {
  const username = currentUsername();
  const completed = persistPractice(window.localStorage, username, result);
  window.dispatchEvent(new CustomEvent(PROGRESS_CHANGE_EVENT));
  const synced = await syncPrivatePractice(completed);
  return { ...completed, syncWarning: synced ? "" : "Saved on this device, but cloud sync failed. Retry when your connection returns." };
};

export const deletePrivatePractice = async (practiceId) => {
  const username = currentUsername();
  if (!removePractice(window.localStorage, username, practiceId)) return false;
  await removeCloudPrivatePractice(practiceId);
  window.dispatchEvent(new CustomEvent(PROGRESS_CHANGE_EVENT));
  return true;
};

export const saveHomeworkSubmission = async (result) => {
  const username = currentUsername();
  const entries = getAllHomeworkSubmissions().filter((entry) => !(entry.assignmentId === result.assignmentId && entry.username === username));
  const completed = await syncSubmission(result);
  write(HOMEWORK_SUBMISSION_KEY, [completed, ...entries]);
  window.dispatchEvent(new CustomEvent(PROGRESS_CHANGE_EVENT));
  return completed;
};
