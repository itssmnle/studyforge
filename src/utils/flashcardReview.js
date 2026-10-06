export function parseCards(text) {
  const rows = [];
  let row = [], field = '', quoted = false;
  const source = text.replace(/^\uFEFF/, '');
  for (let i = 0; i < source.length; i++) {
    const c = source[i];
    if (c === '"') {
      if (quoted && source[i + 1] === '"') { field += '"'; i++; }
      else quoted = !quoted;
    } else if (c === ',' && !quoted) { row.push(field.trim()); field = ''; }
    else if ((c === '\n' || c === '\r') && !quoted) {
      if (c === '\r' && source[i + 1] === '\n') i++;
      row.push(field.trim()); if (row.some(Boolean)) rows.push(row);
      row = []; field = '';
    } else field += c;
  }
  if (quoted) throw new Error('The CSV has an unclosed quotation mark.');
  row.push(field.trim()); if (row.some(Boolean)) rows.push(row);
  if (/^(question|front|term)$/i.test(rows[0]?.[0])) rows.shift();
  if (!rows.length || rows.some(r => r.length !== 2 || !r[0] || !r[1])) throw new Error('Each card needs a question and an answer in two CSV columns.');
  return rows.map(([front, back]) => ({ front, back }));
}

export const emptyReview = (cards) => ({ queue: cards.map((_, i) => i), learned: [], history: [] });

export function rateReview(review, rating, now = new Date().toISOString()) {
  if (!['wrong', 'nearly', 'right'].includes(rating) || !review.queue.length) return review;
  const [card, ...queue] = review.queue;
  const learned = [...review.learned];
  if (rating === 'right') learned.push(card);
  else queue.splice(Math.min(rating === 'wrong' ? 2 : 5, queue.length), 0, card);
  return { queue, learned, history: [{ card, rating, at: now }, ...review.history].slice(0, 200) };
}
