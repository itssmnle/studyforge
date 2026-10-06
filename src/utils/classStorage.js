import { isUnusedLegacyClassPreset } from "./legacyClassPresets";
import { syncClasses } from "./cloudData";

const CLASS_KEY = "studyforge.classes";
export const CLASS_CHANGE_EVENT = "studyforge:classes-changed";

const withoutUnusedPresets = (classes) => classes.filter((schoolClass) => !isUnusedLegacyClassPreset(schoolClass));

export const getClasses = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(CLASS_KEY) || "null");
    return Array.isArray(saved) ? withoutUnusedPresets(saved) : [];
  } catch {
    return [];
  }
};

export const saveClasses = (classes) => {
  const previousClasses = getClasses();
  localStorage.setItem(CLASS_KEY, JSON.stringify(classes));
  window.dispatchEvent(new CustomEvent(CLASS_CHANGE_EVENT));
  syncClasses(classes, previousClasses);
};

export const classesForStudent = (username) =>
  getClasses().filter((schoolClass) => schoolClass.studentUsernames?.includes(username));

export const classesForTeacher = (username) =>
  getClasses().filter((schoolClass) =>
    schoolClass.ownerUsername === username || schoolClass.teacherUsernames?.includes(username));

export const claimOwnerlessClasses = (username) => {
  if (!username) return [];
  const classes = getClasses();
  const hasOwnerlessClasses = classes.some((schoolClass) => !schoolClass.ownerUsername);
  if (!hasOwnerlessClasses) return classesForTeacher(username);
  const next = classes.map((schoolClass) => schoolClass.ownerUsername
    ? schoolClass
    : { ...schoolClass, ownerUsername: username });
  saveClasses(next);
  return next.filter((schoolClass) => schoolClass.ownerUsername === username || schoolClass.teacherUsernames?.includes(username));
};

export const teacherCanAccessClass = (schoolClass, username) => Boolean(
  schoolClass && username && (
    schoolClass.ownerUsername === username || schoolClass.teacherUsernames?.includes(username)
  )
);
