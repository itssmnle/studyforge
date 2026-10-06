import { useEffect, useMemo, useRef, useState } from "react";
import { FiChevronDown, FiCode, FiEdit3, FiFileText, FiLink, FiList, FiMaximize2, FiMoreHorizontal, FiPlus, FiRotateCcw, FiRotateCw, FiTrash2, FiX } from "react-icons/fi";
import { useAuthModal } from "../context/AuthModalContext";
import { deleteStudentNote, getLastStudentNoteId, listStudentNotes, sanitizeStudentNoteHtml, saveStudentNote, setLastStudentNoteId } from "../utils/studentNotes";
import "../styles/StudentNotes.css";

const emptyNote = () => {
  const now = new Date().toISOString();
  return { id: crypto.randomUUID(), title: "Untitled note", content: "<p><br></p>", createdAt: now, updatedAt: now };
};

const Tool = ({ label, children, onClick }) => <button type="button" title={label} aria-label={label} onMouseDown={(event) => event.preventDefault()} onClick={onClick}>{children}</button>;
const highlightColours = ["#fff19d", "#c8f3c1", "#bfeaf5", "#ffd0e1", "#ffd3a6", "#ddd0ff"];
const fontColours = [
  { label: "Default", value: "#272331", token: "--note-font-default" },
  { label: "Red", value: "#b22929", token: "--note-font-red" },
  { label: "Orange", value: "#c05d16", token: "--note-font-orange" },
  { label: "Green", value: "#18734b", token: "--note-font-green" },
  { label: "Blue", value: "#145bdb", token: "--note-font-blue" },
  { label: "Purple", value: "#7c3aed", token: "--note-font-purple" },
];

export default function StudentNotes({ embedded = false, onFullscreen }) {
  const { user } = useAuthModal();
  const [notes, setNotes] = useState([]);
  const [activeId, setActiveId] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("Loading notes...");
  const [moreOpen, setMoreOpen] = useState(false);
  const [colourOpen, setColourOpen] = useState("");
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);
  const editorRef = useRef(null);
  const selectionRef = useRef(null);
  const timerRef = useRef(null);
  const pendingRef = useRef(null);

  const activeNote = useMemo(() => notes.find((note) => note.id === activeId), [activeId, notes]);

  useEffect(() => {
    let cancelled = false;
    listStudentNotes(user.uid).then(async ({ notes: loaded, cloudAvailable }) => {
      if (cancelled) return;
      if (loaded.length) {
        const lastActive = loaded.find((note) => note.id === getLastStudentNoteId(user.uid)) || loaded[0];
        setNotes(loaded);
        setActiveId(lastActive.id);
        setTitle(lastActive.title);
        setContent(lastActive.content);
        setLastStudentNoteId(user.uid, lastActive.id);
        setStatus(cloudAvailable ? "Saved to your account" : "Saved on this device · cloud sync unavailable");
        return;
      }
      const first = emptyNote();
      const saved = await saveStudentNote(user.uid, first);
      if (!cancelled) {
        setNotes([saved]);
        setActiveId(saved.id);
        setTitle(saved.title);
        setContent(saved.content);
        setLastStudentNoteId(user.uid, saved.id);
        setStatus(saved.cloudSaved ? "Saved to your account" : "Saved on this device · cloud sync unavailable");
      }
    }).catch(() => { if (!cancelled) setStatus("Could not load your notes. Check your connection."); });
    return () => { cancelled = true; };
  }, [user.uid]);

  useEffect(() => {
    if (!contextMenu) return undefined;
    const close = () => setContextMenu(null);
    const closeOnEscape = (event) => { if (event.key === "Escape") close(); };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", closeOnEscape);
    return () => { document.removeEventListener("pointerdown", close); document.removeEventListener("keydown", closeOnEscape); };
  }, [contextMenu]);

  useEffect(() => {
    if (editorRef.current && activeId) editorRef.current.innerHTML = content || "<p><br></p>";
    // Content is deliberately excluded so typing does not reset the caret.
  }, [activeId]); // eslint-disable-line react-hooks/exhaustive-deps

  const finishSave = async (note) => {
    try {
      const saved = await saveStudentNote(user.uid, note);
      setNotes((current) => current.map((item) => item.id === saved.id ? saved : item));
      setStatus(saved.cloudSaved ? "Saved to your account" : "Saved on this device · cloud sync unavailable");
    } catch {
      setStatus("Could not save. Keep this page open and try again.");
    }
  };

  const flushPending = () => {
    window.clearTimeout(timerRef.current);
    const pending = pendingRef.current;
    pendingRef.current = null;
    if (pending) void finishSave(pending);
  };

  useEffect(() => () => flushPending(), []); // eslint-disable-line react-hooks/exhaustive-deps

  const scheduleSave = (next) => {
    const sanitised = { ...next, title: next.title || "Untitled note", content: sanitizeStudentNoteHtml(next.content) };
    pendingRef.current = sanitised;
    setNotes((current) => current.map((item) => item.id === sanitised.id ? { ...item, ...sanitised } : item));
    setStatus("Saving...");
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => flushPending(), 650);
  };

  const currentDraft = (overrides = {}) => ({ ...activeNote, title, content, ...overrides });

  const selectNote = (note) => {
    flushPending();
    setContextMenu(null);
    setActiveId(note.id);
    setLastStudentNoteId(user.uid, note.id);
    setTitle(note.title);
    setContent(note.content);
    setMoreOpen(false);
  };

  const renameNote = (note) => {
    const nextTitle = window.prompt("Rename note", note.title || "Untitled note");
    if (!nextTitle?.trim()) return;
    selectNote(note);
    setTitle(nextTitle.trim());
    scheduleSave({ ...note, title: nextTitle.trim() });
  };

  const duplicateNote = async (note) => {
    flushPending();
    const now = new Date().toISOString();
    const copy = { ...note, id: crypto.randomUUID(), title: `${note.title || "Untitled note"} copy`, createdAt: now, updatedAt: now };
    setNotes((current) => [copy, ...current]);
    setActiveId(copy.id);
    setLastStudentNoteId(user.uid, copy.id);
    setTitle(copy.title);
    setContent(copy.content);
    setContextMenu(null);
    await finishSave(copy);
  };

  const createNote = async () => {
    flushPending();
    const draft = emptyNote();
    setNotes((current) => [draft, ...current]);
    setActiveId(draft.id);
    setLastStudentNoteId(user.uid, draft.id);
    setTitle(draft.title);
    setContent(draft.content);
    setStatus("Saving...");
    await finishSave(draft);
    requestAnimationFrame(() => editorRef.current?.focus());
  };

  const removeNote = async () => {
    const doomedId = activeId;
    window.clearTimeout(timerRef.current);
    pendingRef.current = null;
    setDeleteOpen(false);
    try {
      const cloudDeleted = await deleteStudentNote(user.uid, doomedId);
      let remaining = notes.filter((note) => note.id !== doomedId);
      if (!remaining.length) {
        const replacement = emptyNote();
        remaining = [replacement];
        await saveStudentNote(user.uid, replacement);
      }
      setNotes(remaining);
      setActiveId(remaining[0].id);
      setLastStudentNoteId(user.uid, remaining[0].id);
      setTitle(remaining[0].title);
      setContent(remaining[0].content);
      setStatus(cloudDeleted ? "Saved to your account" : "Deleted on this device · cloud sync unavailable");
    } catch {
      setStatus("Could not delete this note.");
    }
  };

  const rememberSelection = () => {
    const selection = window.getSelection();
    if (selection?.rangeCount && editorRef.current?.contains(selection.anchorNode)) selectionRef.current = selection.getRangeAt(0).cloneRange();
  };

  const restoreSelection = () => {
    const range = selectionRef.current;
    if (!range) return;
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
  };

  const readEditor = () => {
    const nextContent = editorRef.current?.innerHTML || "<p><br></p>";
    setContent(nextContent);
    scheduleSave(currentDraft({ content: nextContent }));
    rememberSelection();
  };

  const command = (name, value = null) => {
    editorRef.current?.focus();
    restoreSelection();
    document.execCommand(name, false, value);
    readEditor();
  };

  const addLink = () => {
    const url = window.prompt("Paste a link URL");
    if (url && /^(https?:|mailto:)/i.test(url.trim())) command("createLink", url.trim());
  };

  const selectedCell = () => {
    const node = window.getSelection()?.anchorNode;
    return (node?.nodeType === Node.TEXT_NODE ? node.parentElement : node)?.closest?.("td, th");
  };

  const editTable = (action) => {
    restoreSelection();
    const cell = selectedCell();
    const row = cell?.parentElement;
    const table = cell?.closest("table");
    if (action === "insert-table") command("insertHTML", "<table><tbody><tr><td>Cell</td><td>Cell</td></tr><tr><td>Cell</td><td>Cell</td></tr></tbody></table><p><br></p>");
    else if (!cell || !row || !table) setStatus("Place the cursor inside a table first.");
    else {
      if (action === "insert-row") row.after(row.cloneNode(true));
      if (action === "insert-column") [...table.rows].forEach((item) => item.insertCell(Math.min(cell.cellIndex + 1, item.cells.length)).textContent = "Cell");
      if (action === "delete-row") table.rows.length === 1 ? table.remove() : row.remove();
      if (action === "delete-column") [...table.rows].forEach((item) => item.cells.length === 1 ? table.remove() : item.deleteCell(cell.cellIndex));
      if (action === "delete-table") table.remove();
      readEditor();
    }
    setMoreOpen(false);
  };

  return (
    <main className={`student-notes-page ${embedded ? "student-notes-embedded" : ""}`}>
      <aside className="student-note-list">
        <header><div><span>Private workspace</span><h1>My notes</h1></div><button type="button" onClick={createNote} aria-label="Create note"><FiPlus /></button></header>
        <p>Only you can access these notes.</p>
        <nav aria-label="Your notes">{notes.map((note, index) => <button type="button" className={`student-note-card ${note.id === activeId ? "active" : ""}`} style={{ "--note-accent": ["#7c3aed", "#145bdb", "#c05d16", "#18734b", "#b22929"][index % 5] }} onClick={() => selectNote(note)} onContextMenu={(event) => { event.preventDefault(); setContextMenu({ note, x: event.clientX, y: event.clientY }); }} key={note.id}><span className="student-note-card-icon"><FiFileText /></span><span className="student-note-card-copy"><strong>{note.title || "Untitled note"}</strong></span></button>)}</nav>
      </aside>

      <section className="student-note-workspace">
        <header className="student-note-heading"><input value={title} maxLength={120} aria-label="Note title" onChange={(event) => { const nextTitle = event.target.value; setTitle(nextTitle); scheduleSave(currentDraft({ title: nextTitle })); }} /><div><span className={status.startsWith("Could") ? "error" : ""}>{status}</span>{embedded && <button type="button" onClick={onFullscreen} aria-label="Open notes fullscreen" title="Open notes fullscreen"><FiMaximize2 /></button>}<button type="button" onClick={() => setDeleteOpen(true)} aria-label="Delete note"><FiTrash2 /></button></div></header>

        <div className="student-note-toolbar" role="toolbar" aria-label="Text formatting">
          <Tool label="Bold" onClick={() => command("bold")}><strong>B</strong></Tool>
          <Tool label="Italic" onClick={() => command("italic")}><em>I</em></Tool>
          <Tool label="Underline" onClick={() => command("underline")}><u>U</u></Tool>
          <Tool label="Strikethrough" onClick={() => command("strikeThrough")}><s>S</s></Tool>
          <span className="toolbar-divider" />
          <Tool label="Bulleted list" onClick={() => command("insertUnorderedList")}><FiList /></Tool>
          <Tool label="Numbered list" onClick={() => command("insertOrderedList")}><span className="numbered-list-icon">1.</span><FiList /></Tool>
          <span className="toolbar-divider" />
          <div className="colour-picker"><Tool label="Text highlight colour" onClick={() => setColourOpen((open) => open === "highlight" ? "" : "highlight")}><span className="colour-picker-trigger highlight"><FiEdit3 /></span></Tool>{colourOpen === "highlight" && <div className="colour-preset-menu" aria-label="Highlight colour presets">{highlightColours.map((colour) => <button type="button" key={colour} style={{ "--preset-colour": colour }} aria-label={`Highlight ${colour}`} onMouseDown={(event) => event.preventDefault()} onClick={() => { command("hiliteColor", colour); setColourOpen(""); }} />)}</div>}</div>
          <div className="colour-picker"><Tool label="Font colour" onClick={() => setColourOpen((open) => open === "font" ? "" : "font")}><span className="colour-picker-trigger font">A</span></Tool>{colourOpen === "font" && <div className="colour-preset-menu" aria-label="Font colour presets">{fontColours.map((colour) => <button type="button" key={colour.token} style={{ "--preset-colour": `var(${colour.token})` }} aria-label={`${colour.label} text`} onMouseDown={(event) => event.preventDefault()} onClick={() => { command("foreColor", colour.value); setColourOpen(""); }} />)}</div>}</div>
          <label className="font-size-tool" title="Font size"><select aria-label="Font size" defaultValue="3" onChange={(event) => command("fontSize", event.target.value)}><option value="1">12</option><option value="2">14</option><option value="3">16</option><option value="4">18</option><option value="5">24</option><option value="6">32</option><option value="7">48</option></select><FiChevronDown /></label>
          <Tool label="Quote" onClick={() => command("formatBlock", "blockquote")}><span className="quote-icon">❞</span></Tool>
          <Tool label="Insert link" onClick={addLink}><FiLink /></Tool>
          <Tool label="Code block" onClick={() => command("formatBlock", "pre")}><FiCode /></Tool>
          <span className="toolbar-divider" />
          <Tool label="Undo" onClick={() => command("undo")}><FiRotateCcw /></Tool>
          <Tool label="Redo" onClick={() => command("redo")}><FiRotateCw /></Tool>
          <div className="more-formatting"><Tool label="More formatting" onClick={() => setMoreOpen((open) => !open)}><FiMoreHorizontal /></Tool>{moreOpen && <div className="more-formatting-menu" role="menu">
            <button type="button" onClick={() => command("formatBlock", "p")}>¶ <span>Paragraph</span></button>
            <button type="button" onClick={() => command("formatBlock", "pre")}><FiCode /><span>Code</span></button>
            <button type="button" onClick={() => command("removeFormat")}>Aa <span>Clear all formatting</span></button>
            <hr />
            <button type="button" onClick={() => command("outdent")}>← <span>Decrease indent</span></button>
            <button type="button" onClick={() => command("indent")}>→ <span>Increase indent</span></button>
            <hr />
            <button type="button" onClick={() => command("insertHorizontalRule")}>― <span>Insert horizontal rule</span></button>
            <button type="button" onClick={() => editTable("insert-table")}>▦ <span>Insert table</span></button>
            <button type="button" onClick={() => editTable("insert-row")}>＋ <span>Insert row</span></button>
            <button type="button" onClick={() => editTable("insert-column")}>＋ <span>Insert column</span></button>
            <button type="button" onClick={() => editTable("delete-row")}>− <span>Delete row</span></button>
            <button type="button" onClick={() => editTable("delete-column")}>− <span>Delete column</span></button>
            <button type="button" onClick={() => editTable("delete-table")}><FiTrash2 /><span>Delete table</span></button>
          </div>}</div>
        </div>

        <div ref={editorRef} className="student-note-editor" contentEditable suppressContentEditableWarning role="textbox" aria-multiline="true" data-placeholder="Start writing your notes..." onInput={readEditor} onKeyUp={rememberSelection} onMouseUp={rememberSelection} onBlur={flushPending} />
      </section>

      {contextMenu && <div className="student-note-context-menu" role="menu" style={{ left: contextMenu.x, top: contextMenu.y }} onPointerDown={(event) => event.stopPropagation()}><button type="button" onClick={() => selectNote(contextMenu.note)}>Open note</button><button type="button" onClick={() => { setContextMenu(null); renameNote(contextMenu.note); }}>Rename</button><button type="button" onClick={() => duplicateNote(contextMenu.note)}>Duplicate</button><hr /><button className="danger-item" type="button" onClick={() => { selectNote(contextMenu.note); setDeleteOpen(true); }}>Delete note</button></div>}

      {deleteOpen && <div className="student-note-dialog-backdrop" onMouseDown={() => setDeleteOpen(false)}><section className="student-note-dialog" role="alertdialog" aria-modal="true" aria-labelledby="delete-note-title" onMouseDown={(event) => event.stopPropagation()}><button className="dialog-close" type="button" onClick={() => setDeleteOpen(false)} aria-label="Close"><FiX /></button><FiTrash2 /><h2 id="delete-note-title">Delete this note?</h2><p>This permanently removes <strong>{title || "Untitled note"}</strong> from your account.</p><footer><button className="platform-button secondary" type="button" onClick={() => setDeleteOpen(false)}>Cancel</button><button className="platform-button danger" type="button" onClick={removeNote}>Delete note</button></footer></section></div>}
    </main>
  );
}
