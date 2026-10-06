export const formatAssignmentDue = (assignment) => {
  if (!assignment?.dueAt) return assignment?.dueLabel || "No due date";
  const date = new Date(assignment.dueAt);
  if (Number.isNaN(date.getTime())) return assignment.dueAt;
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(date);
};
