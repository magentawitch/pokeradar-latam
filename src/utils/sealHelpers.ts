// SVG geometry for the stamp book's completed-page stamp and its category
// icons, in a 100×100 box.

const SCALLOPS = 18;
// Bumps reach SCALLOP_RADIUS + 7.3, kept inside the box: the worn-ink mask
// clips anything outside it.
const SCALLOP_RADIUS = 42;

const round = (value: number) => value.toFixed(2);

const pointAt = (
  centerX: number,
  centerY: number,
  radius: number,
  angle: number,
) =>
  `${round(centerX + radius * Math.cos(angle))},${round(centerY + radius * Math.sin(angle))}`;

/**
 * A rosette outline: semicircular bumps between points on a circle, like the
 * pinked edge of a commemorative stamp.
 */
export const SCALLOP_PATH = (() => {
  const points = Array.from({ length: SCALLOPS + 1 }, (_, index) =>
    pointAt(
      50,
      50,
      SCALLOP_RADIUS,
      (index / SCALLOPS) * 2 * Math.PI - Math.PI / 2,
    ),
  );
  const bump = round(SCALLOP_RADIUS * Math.sin(Math.PI / SCALLOPS));
  const [start, ...rest] = points;
  return `M ${start} ${rest.map((point) => `A ${bump} ${bump} 0 0 1 ${point}`).join(" ")} Z`;
})();

/** A five-point star, point up. */
export function starPath(
  centerX: number,
  centerY: number,
  outerRadius: number,
  innerRadius: number,
) {
  const points = Array.from({ length: 10 }, (_, index) =>
    pointAt(
      centerX,
      centerY,
      index % 2 === 0 ? outerRadius : innerRadius,
      (index / 10) * 2 * Math.PI - Math.PI / 2,
    ),
  );
  return `M ${points.join(" L ")} Z`;
}

/** A closed rectangle subpath, for evenodd shapes with cut-out windows. */
export function rectPath(x: number, y: number, width: number, height: number) {
  return `M ${x} ${y} h ${width} v ${height} h ${-width} Z`;
}

/**
 * A scallop shell: ribs fanning up from the hinge at (50, 86), split by thin
 * gaps.
 */
export const SHELL_RIBS_PATH = (() => {
  const ribs = 5;
  const radius = 46;
  const start = Math.PI * (200 / 180);
  const sweep = Math.PI * (140 / 180);
  const gap = 0.05;
  return Array.from({ length: ribs }, (_, index) => {
    const from = start + (index / ribs) * sweep + gap / 2;
    const to = start + ((index + 1) / ribs) * sweep - gap / 2;
    return `M 50,86 L ${pointAt(50, 86, radius, from)} A ${radius} ${radius} 0 0 1 ${pointAt(50, 86, radius, to)} Z`;
  }).join(" ");
})();
