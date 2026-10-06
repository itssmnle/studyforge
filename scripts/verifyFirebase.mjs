import fs from "node:fs/promises";

const apiKey = "AIzaSyDADTmbdAU3K8s6aMv4DMPRSyXsWCkNHhY";
const projectId = "revision-hub-ee911";
const profiles = JSON.parse(await fs.readFile(new URL("../.firebase-import/profiles.json", import.meta.url), "utf8"));
const student = profiles.find((profile) => profile.role === "student");
const otherStudent = profiles.find((profile) => profile.role === "student" && profile.uid !== student.uid);
const teacher = profiles.find((profile) => profile.role === "teacher");

const login = async (profile) => {
  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: `${profile.username}@users.studyforge.local`, password: "password", returnSecureToken: true }),
  });
  const result = await response.json();
  if (!response.ok) throw new Error(`Login failed for ${profile.role}: ${result.error?.message}`);
  return result.idToken;
};

const request = (path, token, options = {}) => fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents${path}`, {
  ...options,
  headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...options.headers },
});

const [studentToken, teacherToken] = await Promise.all([login(student), login(teacher)]);
const results = {
  studentOwnProfile: (await request(`/users/${student.uid}`, studentToken)).status,
  studentOtherProfile: (await request(`/users/${otherStudent.uid}`, studentToken)).status,
  teacherOtherProfile: (await request(`/users/${student.uid}`, teacherToken)).status,
  studentQuestion: (await request("/questions/bio-cell-001", studentToken)).status,
  studentTeacherWrite: (await request("/classes/forbidden-test", studentToken, {
    method: "PATCH",
    body: JSON.stringify({ fields: { ownerUid: { stringValue: student.uid }, name: { stringValue: "Forbidden" } } }),
  })).status,
};

const expected = {
  studentOwnProfile: 200,
  studentOtherProfile: 403,
  teacherOtherProfile: 200,
  studentQuestion: 200,
  studentTeacherWrite: 403,
};
const passed = Object.entries(expected).every(([key, value]) => results[key] === value);
console.log(JSON.stringify({ passed, results }, null, 2));
if (!passed) process.exit(1);
