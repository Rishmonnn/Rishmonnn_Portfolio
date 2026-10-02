export default function RoseWindow({ src, style }) {
  return (
    <div className="rose-wrap" style={style} aria-hidden="true">
      <img src={src} alt="" className="rose" />
    </div>
  );
}
