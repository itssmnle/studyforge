const pieces = Array.from({ length: 36 }, (_, index) => ({
  left: `${(index * 37) % 100}%`,
  delay: `${(index % 9) * 45}ms`,
  duration: `${900 + (index % 6) * 120}ms`,
  color: ['#6757d9', '#f2b84b', '#2bad7b', '#e95d75', '#55a7e8'][index % 5],
}));

export default function Confetti({ active }) {
  if (!active) return null;
  return <div className="confetti" aria-hidden="true">{pieces.map((piece, index) => <i key={index} style={{ '--left': piece.left, '--delay': piece.delay, '--duration': piece.duration, '--confetti-color': piece.color }} />)}</div>;
}
