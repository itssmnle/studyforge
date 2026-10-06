import { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { FiArrowLeft, FiArrowRight, FiRotateCcw, FiCheck, FiClock, FiShuffle, FiMaximize, FiChevronDown } from 'react-icons/fi';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { firestore } from '../utils/firebase';
import { useAuthModal } from '../context/AuthModalContext';
import { parseCards, emptyReview, rateReview } from '../utils/flashcardReview';
import decks from '../data/flashcardDecks';
import { loadDeckCards } from '../utils/studyResources';
import { resolveFlashcardSubject } from '../utils/flashcardDeckRouting';
import { useNoteSidebarVisibility } from '../utils/noteSidebarVisibility';
import NoteTopicsToggle from '../components/NoteTopicsToggle';
import '../styles/Flashcards.css';
import '../styles/FlashcardReview.css';

const labels = { wrong: 'Wrong', nearly: 'Nearly right', right: 'Right' };
const inlineMathPattern = /(\\\((?:\\.|[^\\])*?\\\))/g;

function InlineMath({ value }) {
  return String(value).split(inlineMathPattern).map((part, index) => {
    if (!part.startsWith('\\(') || !part.endsWith('\\)')) return part;
    return <span key={index} dangerouslySetInnerHTML={{ __html: katex.renderToString(part.slice(2, -2), { throwOnError: false, strict: 'ignore', output: 'htmlAndMathml' }) }} />;
  });
}

export default function Flashcards() {
  const { subject, chapter } = useParams();
  const navigate = useNavigate();
  const { user, authReady } = useAuthModal();
  const resolvedSubject = resolveFlashcardSubject(subject);
  const deck = decks[resolvedSubject]?.find(d => d.id === chapter);
  const [cards, setCards] = useState([]);
  const [review, setReview] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [loading, setLoading] = useState(Boolean(chapter));
  const [error, setError] = useState('');
  const [saveStatus, setSaveStatus] = useState('');
  const [historyTab, setHistoryTab] = useState('learned');
  const [resetOpen, setResetOpen] = useState(false);
  const [customName, setCustomName] = useState('Custom deck');
  const [collapsedDecks, setCollapsedDecks] = useState(() => new Set());
  const [deckSidebarHidden, toggleDeckSidebar] = useNoteSidebarVisibility('studyforge.flashcard-sidebar-hidden');
  const saveChain = useRef(Promise.resolve());
  const version = useRef(0);
  const currentSave = useRef(null);
  const studyStageRef = useRef(null);
  const deckId = `${resolvedSubject}-${chapter}`;

  useEffect(() => {
    const controller = new AbortController();
    const generation = ++version.current;
    async function load() {
      if (!authReady) return;
      setError(''); setRevealed(false); setCards([]); setReview(null); setSaveStatus('');
      currentSave.current = null;
      if (!chapter) { setLoading(false); return; }
      setLoading(true);
      try {
        if (!deck) throw new Error('This deck could not be found. Choose a chapter from the flashcard library.');
        const loaded = await loadDeckCards(deck);
        // A content fingerprint prevents changed CSV rows inheriting another card's history.
        const bytes = new TextEncoder().encode(JSON.stringify(loaded));
        const digest = await crypto.subtle.digest('SHA-256', bytes);
        const fingerprint = Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('');
        let saved = null;
        if (user) {
          const snapshot = await getDoc(doc(firestore, 'users', user.uid, 'flashcards', deckId));
          const data = snapshot.data();
          if (data?.fingerprint === fingerprint) saved = data;
        } else {
          try {
            const data = JSON.parse(localStorage.getItem(`studyforge.flashcards.guest.${deckId}`));
            if (data?.fingerprint === fingerprint) saved = data;
          } catch { /* A missing or invalid guest cache starts a new deck. */ }
        }
        if (controller.signal.aborted) return;
        setCards(loaded); setReview(saved || emptyReview(loaded));
        currentSave.current = { uid: user?.uid, deckId, fingerprint, generation };
        setSaveStatus(user ? 'Progress synced to your account' : 'Progress saved on this browser');
      } catch (e) {
        if (!controller.signal.aborted) setError(e.message);
      } finally { if (!controller.signal.aborted) setLoading(false); }
    }
    load();
    return () => controller.abort();
  }, [deck, deckId, chapter, user?.uid, authReady]); // eslint-disable-line react-hooks/exhaustive-deps

  function persist(next) {
    setReview(next); setRevealed(false);
    const destination = currentSave.current;
    if (!destination) { setSaveStatus('Custom deck progress lasts for this visit'); return; }
    const data = { ...next, fingerprint: destination.fingerprint, updatedAt: new Date().toISOString() };
    if (!destination.uid) {
      try { localStorage.setItem(`studyforge.flashcards.guest.${destination.deckId}`, JSON.stringify(data)); }
      catch { setSaveStatus('Browser storage is unavailable. Keep this tab open to retain progress.'); }
      return;
    }
    setSaveStatus('Saving progress…');
    saveChain.current = saveChain.current.catch(() => {}).then(() => setDoc(doc(firestore, 'users', destination.uid, 'flashcards', destination.deckId), data));
    saveChain.current.then(() => {
      if (version.current === destination.generation) setSaveStatus('Progress synced to your account');
    }).catch(() => {
      if (version.current === destination.generation) setSaveStatus('Could not sync progress. Check your connection and try saving again.');
    });
  }

  async function upload(event) {
    const file = event.target.files[0];
    if (!file) return;
    try {
      const loaded = parseCards(await file.text());
      setCards(loaded); setReview(emptyReview(loaded)); setCustomName(file.name.replace(/\.csv$/i, ''));
      setError(''); setRevealed(false); setSaveStatus('Custom deck progress lasts for this visit');
    } catch (e) { setError(e.message); }
  }

  const current = review?.queue[0];
  const card = cards[current];
  const done = review && review.queue.length === 0;
  const subjectDecks = decks[resolvedSubject] || [];
  const showDeckSidebar = Boolean(deck && resolvedSubject);
  const cardPosition = review ? Math.min(review.learned.length + 1, cards.length) : 0;

  function shuffleRemaining() {
    if (!review || review.queue.length < 2) return;
    const queue = [...review.queue];
    for (let index = queue.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [queue[index], queue[swapIndex]] = [queue[swapIndex], queue[index]];
    }
    persist({ ...review, queue });
  }

  function enterFullScreen() {
    studyStageRef.current?.requestFullscreen?.();
  }

  function toggleDeckOutline(deckKey) {
    setCollapsedDecks(current => {
      const next = new Set(current);
      if (next.has(deckKey)) next.delete(deckKey); else next.add(deckKey);
      return next;
    });
  }

  useEffect(() => {
    function flipWithSpace(event) {
      if (event.code !== 'Space' || event.repeat || loading || done || resetOpen || !card) return;
      if (event.target.closest('button, input, textarea, select, a, [contenteditable="true"]')) return;
      event.preventDefault();
      setRevealed(current => !current);
    }

    window.addEventListener('keydown', flipWithSpace);
    return () => window.removeEventListener('keydown', flipWithSpace);
  }, [loading, done, resetOpen, card]);

  return <main className={showDeckSidebar ? `flashcard-reader-shell${deckSidebarHidden ? ' topics-hidden' : ''}` : 'flashcard-standalone'}>
    {showDeckSidebar && <aside className="flashcard-reader-aside"><div className="flashcard-reader-aside-heading"><strong>Flashcards</strong><NoteTopicsToggle hidden={deckSidebarHidden} onToggle={toggleDeckSidebar} /></div><div className="flashcard-reader-aside-content"><div className="flashcard-reader-title"><Link to={`/flashcards/${resolvedSubject}`}>View all topics <FiArrowRight /></Link></div><nav className="flashcard-topic-outline" aria-label={`${resolvedSubject} flashcard chapters`}>{subjectDecks.map((item, index) => { const active = item.id === chapter; const open = active && !collapsedDecks.has(item.id); const progress = active && cards.length ? `${Math.round((review?.learned.length || 0) / cards.length * 100)}%` : '0%'; const summary = <><span className="flashcard-topic-progress" style={{ '--deck-progress': progress }} aria-hidden="true" /><span><strong>{index + 1}. {item.title.replace(/^Year \d: /, '')}</strong><small>1 Topic</small></span><FiChevronDown /></>; return <section className={`flashcard-topic-card${open ? ' open' : ''}`} key={item.id}>{active ? <button type="button" className="flashcard-topic-summary" aria-expanded={open} onClick={() => toggleDeckOutline(item.id)}>{summary}</button> : <Link className="flashcard-topic-summary" to={`/flashcards/${resolvedSubject}/${item.id}`}>{summary}</Link>}<div className="flashcard-topic-collapse" aria-hidden={!open}><div><Link className="flashcard-topic-current" to={`/flashcards/${resolvedSubject}/${item.id}`} tabIndex={open ? undefined : -1}>{item.title.replace(/^Year \d: /, '')}</Link></div></div></section>; })}</nav></div></aside>}
    <section className="recall-page">
    <header className="recall-header"><div><span>{resolvedSubject || 'Personal revision'}{deck ? ` · Chapter ${deck.chapter}` : ''}</span><strong>{cards.length ? `${cardPosition}/${cards.length}` : ''}</strong></div><h1>{deck?.title || customName}</h1><p>Click the card or press Space to flip it, then decide whether it still needs work.</p></header>
    {loading ? <p role="status">Loading your deck and progress…</p> : <>
      {error && <p role="alert" className="recall-error">{error}</p>}
      {!chapter && !cards.length && <label className="recall-upload">Upload a Question, Answer CSV<input type="file" accept=".csv" onChange={upload} /></label>}
      {review && <>
        <progress className="recall-progress" value={review.learned.length} max={cards.length} aria-label="Cards learned" />
        <div className="recall-status" aria-live="polite"><span className="still-learning"><b>{review.queue.length}</b> Still learning</span><button className="know" onClick={() => { setHistoryTab('learned'); document.getElementById('recall-history')?.scrollIntoView({ behavior: 'smooth' }); }}>Know <b>{review.learned.length}</b></button></div>
        <section className="recall-study-stage" ref={studyStageRef}>
          {done ? <section className="recall-card recall-complete"><FiCheck /><h2>Deck learned</h2><p>You know all {cards.length} cards. Your review history is below.</p></section> : <div className="recall-card-scene"><button className={`recall-card ${revealed ? 'is-flipped' : ''}`} type="button" aria-label={revealed ? 'Showing answer. Click to show the question.' : 'Showing question. Click to reveal the answer.'} aria-pressed={revealed} onClick={() => setRevealed(!revealed)}><span className="recall-card-face recall-card-front"><span className="recall-card-toolbar"><b>Front</b><span>{deck?.title || customName}</span></span><span className="recall-card-copy"><InlineMath value={card.front} /></span><span className="recall-flip-hint">Click to reveal <FiRotateCcw /></span></span><span className="recall-card-face recall-card-back"><span className="recall-card-toolbar"><b>Back</b><span>{deck?.title || customName}</span></span><span className="recall-card-copy"><InlineMath value={card.back} /></span><span className="recall-flip-hint">Click to see question <FiRotateCcw /></span></span></button>{revealed && <div className="recall-rating-dock" aria-label="Rate your recall"><button className="rating-wrong" onClick={() => persist(rateReview(review, 'wrong'))} aria-label="Still learning">🤔</button><button className="rating-right" onClick={() => persist(rateReview(review, 'right'))} aria-label="I know this">😀</button></div>}</div>}
        </section>
        {!done && <div className="recall-study-tools"><button className="recall-help" onClick={() => setRevealed(true)}>Stuck? <span>Help with this card</span></button><div><button className="recall-tool-icon" onClick={shuffleRemaining} aria-label="Shuffle flashcards"><FiShuffle /></button><button className="recall-fullscreen" onClick={enterFullScreen}><FiMaximize /> Full screen</button></div></div>}
        <div className="recall-actions"><button onClick={() => navigate(showDeckSidebar ? `/subjects/${resolvedSubject.toLowerCase()}` : '/flashcards')}><FiArrowLeft /> {showDeckSidebar ? 'Course Resources' : 'All subjects'}</button><span role="status">{saveStatus}</span><button onClick={() => setResetOpen(true)}><FiRotateCcw /> Reset deck</button></div>
        {saveStatus.startsWith('Could not') && <button onClick={() => persist(review)}>Retry saving</button>}
        <section className="recall-history" id="recall-history"><header><h2><FiClock /> Learning history</h2><div><button aria-pressed={historyTab === 'learned'} onClick={() => setHistoryTab('learned')}>Learned ({review.learned.length})</button><button aria-pressed={historyTab === 'all'} onClick={() => setHistoryTab('all')}>Recent reviews</button></div></header><p className="recall-history-hint">{historyTab === 'learned' ? 'Cards you marked Right in this deck.' : 'Your most recent 200 ratings, newest first.'}</p>
          {historyTab === 'learned' ? review.learned.length ? review.learned.map(i => <details key={i}><summary><span><InlineMath value={cards[i].front} /></span><b className="history-right">Learned</b></summary><p><InlineMath value={cards[i].back} /></p></details>) : <p>No learned cards yet. Reveal an answer and rate it to begin.</p> : review.history.length ? review.history.map((entry, i) => <details key={`${entry.at}-${i}`}><summary><span><InlineMath value={cards[entry.card]?.front} /><small>{new Date(entry.at).toLocaleString()}</small></span><b className={`history-${entry.rating}`}>{labels[entry.rating]}</b></summary><p><InlineMath value={cards[entry.card]?.back} /></p></details>) : <p>No reviews yet.</p>}
        </section>
      </>}
    </>}
    </section>
    {resetOpen && <div className="recall-modal"><section role="dialog" aria-modal="true" aria-labelledby="reset-title"><h2 id="reset-title">Reset this deck?</h2><p>This clears the learned pile and review history for this deck so you can start again.</p><div><button autoFocus onClick={() => setResetOpen(false)}>Cancel</button><button onClick={() => { persist(emptyReview(cards)); setResetOpen(false); }}>Reset deck</button></div></section></div>}
  </main>;
}
