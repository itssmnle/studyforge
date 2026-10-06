import { useEffect, useMemo, useState } from "react";
import { FiCheck, FiEdit2, FiPlus, FiSearch, FiTrash2, FiUserPlus, FiUsers, FiX } from "react-icons/fi";
import { accountDatabase } from "../utils/accountDatabase";
import { getClasses, saveClasses } from "../utils/classStorage";
import ClassIcon, { classIconOptions } from "../utils/classIcons";

export default function ClassManager({ classes, ownerUsername, onClassesChange }) {
  const [students, setStudents] = useState([]);
  const [queries, setQueries] = useState({});
  const [classDialog, setClassDialog] = useState(null);
  const [classForm, setClassForm] = useState({ name: "", icon: "users", color: "#7c3aed" });
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const studentsByUsername = useMemo(() => new Map(students.map((student) => [student.username, student])), [students]);
  const colourPresets = ["#7c3aed", "#218a62", "#d27b19", "#2878b5", "#b74778", "#8a5a2b", "#3c7480", "#8b5d3b"];
  const yearGroup = (student) => student.profession?.replace(/^Year\s*/i, "Year ") || "Year not set";

  useEffect(() => {
    accountDatabase.list().then((accounts) => setStudents(accounts.filter((account) => account.role === "student")));
  }, []);

  useEffect(() => {
    if (!classDialog) return undefined;
    const closeOnEscape = (event) => {
      if (event.key !== "Escape") return;
      if (deleteDialogOpen) setDeleteDialogOpen(false);
      else setClassDialog(null);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [classDialog, deleteDialogOpen]);

  const persist = (next) => {
    const visibleClassIds = new Set(classes.map((schoolClass) => schoolClass.id));
    const retained = getClasses()
      .filter((schoolClass) => !visibleClassIds.has(schoolClass.id));
    saveClasses([...retained, ...next]);
    onClassesChange?.(next);
  };

  const openAddDialog = () => {
    setClassForm({ name: "", icon: "users", color: "#7c3aed" });
    setDeleteConfirmation("");
    setDeleteDialogOpen(false);
    setClassDialog({ mode: "add" });
  };

  const openEditDialog = (schoolClass) => {
    setClassForm({ name: schoolClass.name, icon: schoolClass.icon || "users", color: schoolClass.color || "#7c3aed" });
    setDeleteConfirmation("");
    setDeleteDialogOpen(false);
    setClassDialog({ mode: "edit", classId: schoolClass.id });
  };

  const submitClass = (event) => {
    event.preventDefault();
    const name = classForm.name.trim();
    if (!name) return;
    if (classDialog.mode === "edit") {
      persist(classes.map((schoolClass) => schoolClass.id === classDialog.classId ? { ...schoolClass, name, icon: classForm.icon, color: classForm.color } : schoolClass));
    } else {
      const id = `class-${ownerUsername}-${Date.now()}`;
      persist([...classes, { id, name, icon: classForm.icon, color: classForm.color, ownerUsername, studentUsernames: [] }]);
    }
    setClassDialog(null);
  };

  const classBeingEdited = classDialog?.mode === "edit" ? classes.find((schoolClass) => schoolClass.id === classDialog.classId) : null;

  const deleteClass = () => {
    if (!classBeingEdited || deleteConfirmation !== classBeingEdited.name) return;
    persist(classes.filter((schoolClass) => schoolClass.id !== classBeingEdited.id));
    setClassDialog(null);
    setDeleteDialogOpen(false);
    setDeleteConfirmation("");
  };

  const addStudent = (classId, username) => {
    persist(classes.map((schoolClass) => schoolClass.id === classId
      ? { ...schoolClass, studentUsernames: [...new Set([...schoolClass.studentUsernames, username])] }
      : schoolClass));
    setQueries((current) => ({ ...current, [classId]: "" }));
  };

  const removeStudent = (classId, username) => {
    persist(classes.map((schoolClass) => schoolClass.id === classId
      ? { ...schoolClass, studentUsernames: schoolClass.studentUsernames.filter((item) => item !== username) }
      : schoolClass));
  };

  return (
    <section className="teacher-tool-section">
      <div className="section-heading">
        <div><span className="eyebrow">Class membership</span><h2>Classes and students</h2></div>
        <button className="platform-button primary" onClick={openAddDialog}><FiPlus /> Add class</button>
      </div>
      <div className="class-manager-grid">
        {classes.map((schoolClass) => {
          const query = queries[schoolClass.id] || "";
          const normalisedQuery = query.trim().toLowerCase();
          const assignedStudents = schoolClass.studentUsernames.map((username) => studentsByUsername.get(username)).filter(Boolean);
          const matches = normalisedQuery ? students.filter((student) => {
            if (schoolClass.studentUsernames.includes(student.username)) return false;
            return `${student.fullName} ${student.username} ${student.profession || ""}`.toLowerCase().includes(normalisedQuery);
          }).slice(0, 20) : [];

          return (
            <article className="class-manager-card" style={{ "--class-colour": schoolClass.color || "#7c3aed" }} key={schoolClass.id}>
              <header><div className="class-card-heading"><span className="class-icon"><ClassIcon icon={schoolClass.icon} /></span><div><h3>{schoolClass.name}</h3><span><FiUsers /> {schoolClass.studentUsernames.length} students</span></div></div><button type="button" className="class-edit-button" onClick={() => openEditDialog(schoolClass)} aria-label={`Edit ${schoolClass.name}`}><FiEdit2 /></button></header>
              <div className="student-search-wrap"><FiSearch /><input value={query} onChange={(event) => setQueries((current) => ({ ...current, [schoolClass.id]: event.target.value }))} placeholder="Search name or username" aria-label={`Search students for ${schoolClass.name}`} /></div>
              {normalisedQuery && <div className="student-search-results">
                {matches.map((student) => <button type="button" key={student.username} onClick={() => addStudent(schoolClass.id, student.username)}><span><strong>{student.fullName} <em className="year-group-chip">{yearGroup(student)}</em></strong><small>@{student.username}</small></span><FiUserPlus /></button>)}
                {!matches.length && <p>No unassigned students match that search.</p>}
              </div>}
              <div className="assigned-student-list">
                {assignedStudents.map((student) => <div key={student.username}><span><strong>{student.fullName} <em className="year-group-chip">{yearGroup(student)}</em></strong><small>@{student.username}</small></span><button type="button" onClick={() => removeStudent(schoolClass.id, student.username)} aria-label={`Remove ${student.fullName} from ${schoolClass.name}`}><FiX /></button></div>)}
                {!assignedStudents.length && <p>No students assigned. Search above to add one.</p>}
              </div>
            </article>
          );
        })}
      </div>
      {classDialog && <div className="class-dialog-backdrop" onMouseDown={() => setClassDialog(null)}>
        <section className="class-dialog" role="dialog" aria-modal="true" aria-labelledby="class-dialog-title" onMouseDown={(event) => event.stopPropagation()}>
          <header><div><span className="eyebrow">{classDialog.mode === "edit" ? "Edit class" : "New class"}</span><h2 id="class-dialog-title">{classDialog.mode === "edit" ? "Update class details" : "Create a class"}</h2></div><button type="button" onClick={() => setClassDialog(null)} aria-label="Close class editor"><FiX /></button></header>
          <div className="class-dialog-preview" style={{ "--class-colour": classForm.color }}><span><ClassIcon icon={classForm.icon} /></span><div><strong>{classForm.name.trim() || "Class name"}</strong><small>Class preview</small></div></div>
          <form onSubmit={submitClass}>
            <label className="class-name-field">Class name<input autoFocus value={classForm.name} onChange={(event) => setClassForm({ ...classForm, name: event.target.value })} placeholder="For example: 10A Science" required /></label>
            <fieldset><legend>Choose an icon</legend><div className="class-icon-options">{classIconOptions.map((option) => { const Icon = option.Icon; return <button type="button" className={classForm.icon === option.value ? "selected" : ""} onClick={() => setClassForm({ ...classForm, icon: option.value })} aria-label={option.label} title={option.label} key={option.value}><Icon /></button>; })}</div></fieldset>
            <fieldset><legend>Choose a colour</legend><div className="class-colour-options">{colourPresets.map((colour) => <button type="button" className={classForm.color === colour ? "selected" : ""} style={{ "--swatch-colour": colour }} onClick={() => setClassForm({ ...classForm, color: colour })} aria-label={`Use colour ${colour}`} key={colour}>{classForm.color === colour && <FiCheck />}</button>)}</div></fieldset>
            <footer className="class-dialog-footer">{classBeingEdited && <button type="button" className="class-delete-trigger" onClick={() => { setDeleteConfirmation(""); setDeleteDialogOpen(true); }}><FiTrash2 /> Delete</button>}<button type="button" className="platform-button secondary" onClick={() => setClassDialog(null)}>Cancel</button><button className="platform-button primary"><FiCheck /> {classDialog.mode === "edit" ? "Save changes" : "Create class"}</button></footer>
          </form>
        </section>
      </div>}
      {deleteDialogOpen && classBeingEdited && <div className="class-delete-dialog-backdrop" onMouseDown={() => setDeleteDialogOpen(false)}>
        <section className="class-delete-dialog" role="alertdialog" aria-modal="true" aria-labelledby="delete-class-title" onMouseDown={(event) => event.stopPropagation()}>
          <span className="delete-dialog-icon"><FiTrash2 /></span>
          <h2 id="delete-class-title">Delete {classBeingEdited.name}?</h2>
          <p>This removes the class and its current roster. Existing assignment result records are kept.</p>
          <label>Type <strong>{classBeingEdited.name}</strong> exactly to confirm<input autoFocus value={deleteConfirmation} onChange={(event) => setDeleteConfirmation(event.target.value)} aria-label={`Type ${classBeingEdited.name} to confirm deletion`} autoComplete="off" /></label>
          <footer><button type="button" className="platform-button secondary" onClick={() => setDeleteDialogOpen(false)}>Cancel</button><button type="button" className="class-delete-button" disabled={deleteConfirmation !== classBeingEdited.name} onClick={deleteClass}><FiTrash2 /> Delete class</button></footer>
        </section>
      </div>}
    </section>
  );
}
