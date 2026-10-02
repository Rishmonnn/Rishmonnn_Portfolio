// A circular, lace-like gothic window drawn with SVG geometry.
const SPOKES = 12;

export default function RoseWindow() {
  const angles = Array.from({ length: SPOKES }, (_, i) => (i * 360) / SPOKES);

  return (
    <div className="rose-wrap" aria-hidden="true">
      <svg
        className="rose"
        viewBox="-100 -100 200 200"
        fill="none"
        stroke="currentColor"
      >
        <circle r="96" />
        <circle r="88" />
        <circle r="34" />
        <circle r="10" />
        {angles.map((deg) => (
          <g key={deg} transform={`rotate(${deg})`}>
            <line x1="10" y1="0" x2="88" y2="0" />
            <circle cx="62" cy="0" r="22" />
            <circle cx="22" cy="0" r="8" />
          </g>
        ))}
      </svg>
    </div>
  );
}
