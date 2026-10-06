import { assignments as starterAssignments } from "../data/assignments";
import { syncAssignment, removeCloudAssignment } from "./cloudData";

const ASSIGNMENT_KEY = "studyforge.assignments";
const LEGACY_SAMPLE_IDS = new Set(["assignment-bonding", "assignment-electricity"]);
export const ASSIGNMENT_CHANGE_EVENT = "studyforge:assignments-changed";

export const getAssignments = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(ASSIGNMENT_KEY) || "null");
    return Array.isArray(saved) ? saved.filter((assignment) => !LEGACY_SAMPLE_IDS.has(assignment.id)) : starterAssignments;
  } catch {
    return starterAssignments;
  }
};

export const saveAssignment = async (assignment) => {
  await syncAssignment(assignment);
  const assignments = getAssignments();
  const next = [assignment, ...assignments.filter((item) => item.id !== assignment.id)];
  localStorage.setItem(ASSIGNMENT_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent(ASSIGNMENT_CHANGE_EVENT));
  return next;
};

export const assignmentsForTeacher = (username, classes = []) => {
  const accessibleClassIds = new Set(classes.map((schoolClass) => schoolClass.id));
  return getAssignments().filter((assignment) =>
    assignment.createdByUsername === username || accessibleClassIds.has(assignment.classId));
};

export const claimOwnerlessAssignments = (username, classes = []) => {
  if (!username) return [];
  const assignments = getAssignments();
  const accessibleClassIds = new Set(classes.map((schoolClass) => schoolClass.id));
  const ownedClassIds = new Set(classes
    .filter((schoolClass) => schoolClass.ownerUsername === username)
    .map((schoolClass) => schoolClass.id));
  let changed = false;
  const next = assignments.map((assignment) => {
    if (assignment.createdByUsername || !ownedClassIds.has(assignment.classId)) return assignment;
    changed = true;
    return { ...assignment, createdByUsername: username };
  });
  if (changed) {
    localStorage.setItem(ASSIGNMENT_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent(ASSIGNMENT_CHANGE_EVENT));
  }
  return next.filter((assignment) => assignment.createdByUsername === username || accessibleClassIds.has(assignment.classId));
};

export const deleteAssignment = async id => {
  await removeCloudAssignment(id);
  const next = getAssignments().filter(a => a.id !== id);
  localStorage.setItem(ASSIGNMENT_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent(ASSIGNMENT_CHANGE_EVENT));
  return next;
};
