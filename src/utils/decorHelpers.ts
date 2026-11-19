/**
 * Outline of a postage stamp: a width × height rectangle whose edges are
 * bitten by semicircles of `radius`, about `spacing` apart, like perforations.
 * Traced clockwise from the top-left corner; each bite is an inward arc.
 */
export function perforatedRectPath(
  width: number,
  height: number,
  radius: number,
  spacing: number,
) {
  const holeCentres = (length: number) => {
    const count = Math.max(1, Math.round(length / spacing) - 1);
    const step = length / (count + 1);
    return Array.from({ length: count }, (_, index) => step * (index + 1));
  };
  const bite = (toX: number, toY: number) =>
    `A${radius} ${radius} 0 0 0 ${toX} ${toY}`;

  const segments = ["M0 0"];
  for (const x of holeCentres(width)) {
    segments.push(`L${x - radius} 0`, bite(x + radius, 0));
  }
  segments.push(`L${width} 0`);
  for (const y of holeCentres(height)) {
    segments.push(`L${width} ${y - radius}`, bite(width, y + radius));
  }
  segments.push(`L${width} ${height}`);
  for (const x of holeCentres(width).reverse()) {
    segments.push(`L${x + radius} ${height}`, bite(x - radius, height));
  }
  segments.push(`L0 ${height}`);
  for (const y of holeCentres(height).reverse()) {
    segments.push(`L0 ${y + radius}`, bite(0, y - radius));
  }
  segments.push("Z");
  return segments.join(" ");
}
