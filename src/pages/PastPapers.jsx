import { useSearchParams } from 'react-router-dom';
import { FiSearch, FiFileText, FiExternalLink, FiCheckCircle, FiFolder, FiArrowUpRight } from 'react-icons/fi';
import library from '../data/pastPapers.json';
import '../styles/PaperLibrary.css';

const colours = { '0580': '#7c3aed', '0606': '#b74778', '0610': '#218a62', '0620': '#2878b5', '0625': '#b66b15' };
const allPapers = library.subjects.flatMap(subject => subject.papers.map(paper => ({ ...paper, subject })));
const totalFiles = allPapers.reduce((count, paper) => count + paper.files.length, 0);

function FileLink({ file }) {
  const answers = file.kind === 'answers';
  return <a className={`paper-file ${answers ? 'paper-answer' : ''}`} href={file.url} target="_blank" rel="noopener noreferrer" aria-label={`${file.name} (opens in a new tab)`}>
    <span className="paper-file-icon">{answers ? <FiCheckCircle /> : <FiFileText />}</span>
    <span><strong>{answers ? 'Answers' : 'Questions'}{file.variant ? ` · ${file.variant}` : ''}</strong><small>PDF{file.pages ? ` · ${file.pages.toLocaleString()} pages` : ''}{file.bytes ? ` · ${(file.bytes / 1048576).toFixed(1)} MB` : ''}</small></span><FiArrowUpRight />
  </a>;
}

export default function PastPapers() {
  const [params, setParams] = useSearchParams();
  const subjectCode = params.get('subject') || '';
  const paperNumber = params.get('paper') || '';
  const search = params.get('q') || '';
  const change = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    setParams(next, { replace: true });
  };
  const filtered = allPapers.filter(paper => (!subjectCode || paper.subject.code === subjectCode)
    && (!paperNumber || String(paper.number) === paperNumber)
    && `${paper.subject.name} ${paper.subject.code} Paper ${paper.number} ${paper.tier} ${paper.files.map(f => f.name).join(' ')}`.toLowerCase().includes(search.trim().toLowerCase()));
  return <main className="paper-library">
    <header className="paper-library-hero"><div><span className="eyebrow">Exam preparation</span><h1>Past papers</h1><p>Find your subject, choose a paper and practise. Open the answer collection when you’re ready to mark your work.</p><div className="paper-library-counts"><span>{library.subjects.length} subjects</span><span>{allPapers.length} paper collections</span><span>{totalFiles} PDFs</span></div></div><aside><FiFolder /><strong>Examinent collection</strong><p>IGCSE Core &amp; Extended</p><a href={library.folderUrl} target="_blank" rel="noopener noreferrer">Open complete folder <FiExternalLink /></a></aside></header>
    <nav className="paper-subjects" aria-label="Filter papers by subject"><button aria-pressed={!subjectCode} onClick={() => change('subject', '')}>All subjects <span>{allPapers.length}</span></button>{library.subjects.map(subject => <button key={subject.code} aria-pressed={subjectCode === subject.code} style={{ '--paper-colour': colours[subject.code] }} onClick={() => change('subject', subject.code)}>{subject.name.replace('Mathematics - Additional', 'Additional Mathematics')} <small>{subject.code}</small></button>)}</nav>
    <div className="paper-filters"><label className="paper-search"><FiSearch /><input value={search} onChange={e => change('q', e.target.value)} placeholder="Search subject, syllabus code or paper…" aria-label="Search past papers" /></label><label className="paper-select">Paper<select value={paperNumber} onChange={e => change('paper', e.target.value)}><option value="">All papers</option>{[...new Set(allPapers.map(p => p.number))].sort((a,b) => a-b).map(n => <option value={n} key={n}>Paper {n}</option>)}</select></label></div>
    <div className="paper-result-bar"><p role="status">{filtered.length} {filtered.length === 1 ? 'collection' : 'collections'}</p>{(subjectCode || paperNumber || search) && <button onClick={() => setParams({})}>Clear filters</button>}<span>PDFs open in a new tab</span></div>
    <section className="paper-results" aria-label="Paper collections">{filtered.map(paper => <article className="paper-collection" key={`${paper.subject.code}-${paper.number}`} style={{ '--paper-colour': colours[paper.subject.code] }}><header><span className="paper-number">{paper.number}</span><div><span className="paper-subject-label">{paper.subject.name.replace('Mathematics - Additional', 'Additional Mathematics')} · {paper.subject.code}</span><h2>Paper {paper.number}{paper.tier && <small>{paper.tier}</small>}</h2></div><a href={paper.folderUrl} target="_blank" rel="noopener noreferrer" aria-label={`Open ${paper.subject.name} Paper ${paper.number} folder`}><FiFolder /></a></header><div className="paper-file-groups"><section><h3>Question collections</h3>{paper.files.filter(f => f.kind === 'questions').sort((a,b) => a.variant.localeCompare(b.variant)).map(file => <FileLink key={file.id} file={file} />)}</section><section><h3>Answers &amp; mark schemes</h3>{paper.files.filter(f => f.kind === 'answers').map(file => <FileLink key={file.id} file={file} />)}{!paper.files.some(f => f.kind === 'answers') && <p className="paper-missing">No answer file uploaded yet.</p>}{paper.files.some(f => f.variant === 'TB') && !paper.files.some(f => f.kind === 'answers' && f.variant === 'TB') && <p className="paper-missing">No separate TB answer file in this collection.</p>}</section></div></article>)}</section>
    {!filtered.length && <div className="paper-empty"><FiSearch /><h2>No matching papers</h2><p>Try a different subject, paper number or search term.</p><button onClick={() => setParams({})}>Show all papers</button></div>}
    <p className="paper-library-note">These are large PDF collections that may contain hundreds of pages. Preview a file before downloading. TA and TB labels follow the uploaded filenames.</p>
  </main>;
}
