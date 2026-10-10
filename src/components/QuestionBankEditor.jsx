import { useEffect, useMemo, useState } from "react";
import { FiEdit2, FiPlus, FiTrash2 } from "react-icons/fi";
import { scienceSubjects } from "../data/scienceCurriculum";
import { deleteScienceQuestion, getScienceQuestions, QUESTION_BANK_CHANGE_EVENT, saveScienceQuestion } from "../data/scienceQuestions";

const blankQuestion = (subject, topic) => ({
  id: "",
  subject,
  topic,
  subtopic: "",
  difficulty: "Foundation",
  marks: 1,
  type: "multiple-choice",
  prompt: "",
  optionsText: "",
  answer: "",
  explanation: "",
});

const choiceLabels = ["A", "B", "C", "D"];
const optionFields = (optionsText) => {
  const options = optionsText.split("\n").slice(0, 4);
  return [...options, ...Array(Math.max(0, 4 - options.length)).fill("")];
};

export default function QuestionBankEditor() {
  const [questions, setQuestions] = useState(getScienceQuestions);
  const [subjectId, setSubjectId] = useState(scienceSubjects[0].id);
  const [topicId, setTopicId] = useState(scienceSubjects[0].topics[0].id);
  const [form, setForm] = useState(null);
  const subject = scienceSubjects.find((item) => item.id === subjectId);
  const visibleQuestions = useMemo(() => questions.filter((question) => question.subject === subjectId && question.topic === topicId), [questions, subjectId, topicId]);

  useEffect(() => {
    const refreshQuestions = () => setQuestions(getScienceQuestions());
    window.addEventListener(QUESTION_BANK_CHANGE_EVENT, refreshQuestions);
    refreshQuestions();
    return () => window.removeEventListener(QUESTION_BANK_CHANGE_EVENT, refreshQuestions);
  }, []);

  const changeSubject = (value) => {
    const nextSubject = scienceSubjects.find((item) => item.id === value);
    setSubjectId(value);
    setTopicId(nextSubject.topics[0].id);
    setForm(null);
  };

  const startEdit = (question) => setForm({
    ...question,
    answer: String(question.answer),
    optionsText: question.options?.join("\n") || "",
  });

  const updateOption = (index, value) => {
    const options = optionFields(form.optionsText);
    const previous = options[index];
    options[index] = value;
    setForm({
      ...form,
      optionsText: options.join("\n"),
      answer: form.answer === previous ? value : form.answer,
    });
  };

  const submit = (event) => {
    event.preventDefault();
    const options = form.optionsText.split("\n").map((option) => option.trim()).filter(Boolean);
    let questionNumber = questions.length + 1;
    while (questions.some((question) => question.id === `${form.subject}-${form.topic}-teacher-${questionNumber}`)) questionNumber += 1;
    const question = {
      id: form.id || `${form.subject}-${form.topic}-teacher-${questionNumber}`,
      subject: form.subject,
      topic: form.topic,
      subtopic: form.subtopic.trim() || subject.topics.find((topic) => topic.id === form.topic)?.name || "General",
      difficulty: form.difficulty,
      marks: Number(form.marks),
      type: form.type,
      prompt: form.prompt.trim(),
      answer: form.type === "numerical" ? Number(form.answer) : form.answer.trim(),
      explanation: form.explanation.trim(),
      provenance: "kojonote teacher authored",
      specificationTags: [],
      ...(form.type === "multiple-choice" ? { options } : {}),
      ...(form.type === "short-answer" ? { acceptableAnswers: [form.answer.trim()] } : {}),
      ...(form.type === "numerical" ? { tolerance: 0 } : {}),
    };
    saveScienceQuestion(question);
    setQuestions(getScienceQuestions());
    setForm(null);
  };

  const remove = (questionId) => {
    deleteScienceQuestion(questionId);
    setQuestions(getScienceQuestions());
    if (form?.id === questionId) setForm(null);
  };

  return (
    <section className="teacher-tool-section question-editor">
      <div className="section-heading"><div><span className="eyebrow">Question bank</span><h2>Edit practice questions</h2></div><button className="platform-button primary" onClick={() => setForm(blankQuestion(subjectId, topicId))}><FiPlus /> Add question</button></div>
      <div className="question-bank-filters">
        <label>Subject<select value={subjectId} onChange={(event) => changeSubject(event.target.value)}>{scienceSubjects.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}</select></label>
        <label>Topic<select value={topicId} onChange={(event) => { setTopicId(event.target.value); setForm(null); }}>{subject.topics.map((topic) => <option value={topic.id} key={topic.id}>{topic.name}</option>)}</select></label>
      </div>
      {form && (
        <form className="question-edit-form" onSubmit={submit}>
          <div className="form-grid question-form-grid">
            <label>Type<select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}><option value="multiple-choice">Multiple choice</option><option value="short-answer">Short answer</option><option value="numerical">Numerical</option></select></label>
            <label>Difficulty<select value={form.difficulty} onChange={(event) => setForm({ ...form, difficulty: event.target.value })}><option>Easy</option><option>Medium</option><option>Hard</option><option>Foundation</option><option>Higher</option></select></label>
            <label>Marks<input type="number" min="1" value={form.marks} onChange={(event) => setForm({ ...form, marks: event.target.value })} /></label>
            <label>Subchapter<input list="practice-subchapters" value={form.subtopic} onChange={(event) => setForm({ ...form, subtopic: event.target.value })} /><datalist id="practice-subchapters">{subject.topics.find(topic => topic.id === form.topic)?.subtopics.map(sub => <option key={sub} value={sub} />)}</datalist></label>
          </div>
          <label>Question<input value={form.prompt} onChange={(event) => setForm({ ...form, prompt: event.target.value })} required /></label>
          {form.type === "multiple-choice" ? <fieldset className="multiple-choice-editor"><legend>Answer options</legend><p>Enter all four options, then choose the correct one.</p>{optionFields(form.optionsText).map((option, index) => <label key={choiceLabels[index]}><span>{choiceLabels[index]}</span><input value={option} onChange={(event) => updateOption(index, event.target.value)} placeholder={`Option ${choiceLabels[index]}`} required /></label>)}<label className="correct-choice">Correct answer<select value={form.answer} onChange={(event) => setForm({ ...form, answer: event.target.value })} required><option value="" disabled>Select the correct option</option>{optionFields(form.optionsText).map((option, index) => <option key={choiceLabels[index]} value={option} disabled={!option.trim()}>{choiceLabels[index]}{option.trim() ? `: ${option}` : ""}</option>)}</select></label></fieldset> : <label>Correct answer<input value={form.answer} onChange={(event) => setForm({ ...form, answer: event.target.value })} required /></label>}
          <label>Explanation<textarea value={form.explanation} onChange={(event) => setForm({ ...form, explanation: event.target.value })} required /></label>
          <div className="form-actions"><button type="button" className="platform-button secondary" onClick={() => setForm(null)}>Cancel</button><button className="platform-button primary">Save question</button></div>
        </form>
      )}
      <div className="question-bank-list">
        {visibleQuestions.map((question, index) => <article key={question.id}><span>{index + 1}</span><div><strong>{question.prompt}</strong><small>{question.type.replaceAll("-", " ")} · {question.difficulty} · {question.marks} {question.marks === 1 ? "mark" : "marks"}</small></div><button onClick={() => startEdit(question)} aria-label={`Edit ${question.prompt}`}><FiEdit2 /></button><button className="danger-icon-button" onClick={() => remove(question.id)} aria-label={`Delete ${question.prompt}`}><FiTrash2 /></button></article>)}
        {!visibleQuestions.length && <p className="empty-tool-state">No questions in this topic yet.</p>}
      </div>
    </section>
  );
}
