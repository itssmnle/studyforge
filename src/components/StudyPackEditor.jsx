import { useState } from 'react';
import { loadDeckCards, saveDeckCards, saveStudyPack } from '../utils/studyResources';
import decks from '../data/flashcardDecks';

export default function StudyPackEditor({ user, packs, onSaved }) {
  const [mode, setMode] = useState('packs');
  const [draft, setDraft] = useState(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [deckId, setDeckId] = useState(decks.Biology[0].id);
  const allDecks = Object.entries(decks).flatMap(([subject, entries]) => entries.map(deck => ({ ...deck, subject })));
  const selectedDeck = allDecks.find(deck => deck.id === deckId);
  async function editDeck() {
    setBusy(true); setMessage('');
    try { setDraft({ ...selectedDeck, cards: await loadDeckCards(selectedDeck) }); }
    catch (error) { setMessage(error.message); }
    finally { setBusy(false); }
  }
  async function save(event) {
    event.preventDefault(); setBusy(true); setMessage('');
    try {
      if (mode === 'decks') await saveDeckCards(draft, draft.cards, user);
      else onSaved(await saveStudyPack(draft, user));
      setDraft(null); setMessage('Saved successfully.');
    } catch (error) { setMessage(error.message); }
    finally { setBusy(false); }
  }
  const updateCard = (index, field, value) => setDraft({ ...draft, cards: draft.cards.map((card, i) => i === index ? { ...card, [field]: value } : card) });
  return <section className="teacher-tool-section study-tools">
    <div className="section-heading"><div><span className="eyebrow">Revision resources</span><h2>Study packs & flashcards</h2></div></div>
    <div className="work-tabs">{[['packs', 'My study packs'], ['decks', 'Edit flashcards']].map(([value, label]) => <button key={value} aria-pressed={mode === value} disabled={busy} onClick={() => { setMode(value); setDraft(null); setMessage(''); }}>{label}</button>)}</div>
    {mode === 'packs' ? <><p>Create a reusable set of question and answer cards, then select it when assigning homework. Existing assignments keep their original questions.</p><button className="platform-button primary" disabled={busy} onClick={() => setDraft({ title: '', subject: 'biology', cards: [{ front: '', back: '' }] })}>Create study pack</button><div className="test-history-grid">{packs.map(pack => <article key={pack.id}><h3>{pack.title}</h3><p>{pack.cards.length} cards · {pack.subject}</p><button className="platform-button secondary" disabled={busy} onClick={() => setDraft(structuredClone(pack))}>Edit pack</button></article>)}</div></> : <><p>Edit the shared flashcard library here. Practice questions have their own editor below.</p><div className="resource-picker"><label>Chapter deck<select value={deckId} disabled={busy} onChange={event => { setDeckId(event.target.value); setDraft(null); }}>{allDecks.map(deck => <option key={deck.id} value={deck.id}>{deck.subject} · {deck.title}</option>)}</select></label><button className="platform-button primary" disabled={busy} onClick={editDeck}>{busy ? 'Loading…' : 'Edit flashcards'}</button></div></>}
    {message && <p role="status">{message}</p>}
    {draft && <form className="pack-form" onSubmit={save}><fieldset disabled={busy}>
      {mode === 'packs' && <div className="resource-picker"><label>Pack title<input required maxLength={150} value={draft.title} onChange={event => setDraft({ ...draft, title: event.target.value })} /></label><label>Subject<select value={draft.subject} onChange={event => setDraft({ ...draft, subject: event.target.value })}>{Object.keys(decks).map(subject => <option key={subject} value={subject.toLowerCase()}>{subject}</option>)}</select></label></div>}
      <h3>{mode === 'decks' ? draft.title : 'Your cards'}</h3>
      {draft.cards.map((card, index) => <div className="pack-card-editor" key={index}><strong>Card {index + 1}</strong><label>Question<textarea required maxLength={3000} value={card.front} onChange={event => updateCard(index, 'front', event.target.value)} /></label><label>Answer<textarea required maxLength={3000} value={card.back} onChange={event => updateCard(index, 'back', event.target.value)} /></label><button type="button" className="platform-button secondary" onClick={() => setDraft({ ...draft, cards: draft.cards.filter((_, i) => i !== index) })}>Remove card</button></div>)}
      <button type="button" className="platform-button secondary" disabled={draft.cards.length >= 100} onClick={() => setDraft({ ...draft, cards: [...draft.cards, { front: '', back: '' }] })}>Add card</button>
      <div className="form-actions"><button type="button" className="platform-button secondary" onClick={() => setDraft(null)}>Cancel</button><button className="platform-button primary" disabled={!draft.cards.length}>{busy ? 'Saving…' : 'Save changes'}</button></div>
    </fieldset></form>}
  </section>;
}
