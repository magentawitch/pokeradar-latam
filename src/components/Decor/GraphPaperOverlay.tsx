/** Faint graph-paper grid printed over the map; never intercepts input. */
export function GraphPaperOverlay() {
  return (
    <div
      aria-hidden="true"
      className="graph-paper pointer-events-none absolute inset-0"
    />
  );
}
