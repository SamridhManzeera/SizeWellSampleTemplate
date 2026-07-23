export interface AxisBounds {
  max: number;
  stepSize: number;
}

// Picks a "nice" (1/2/5-multiple) step size and rounded max so the same
// bounds can be reused across two separate chart instances and still line
// up pixel-for-pixel.
export function getNiceAxisBounds(maxValue: number, tickCount = 5): AxisBounds {
  if (maxValue <= 0) {
    return { max: 10, stepSize: 2 };
  }

  const rawStep = maxValue / tickCount;
  const magnitude = 10 ** Math.floor(Math.log10(rawStep));
  const residual = rawStep / magnitude;

  let niceResidual = 1;
  if (residual > 5) niceResidual = 10;
  else if (residual > 2) niceResidual = 5;
  else if (residual > 1) niceResidual = 2;

  const stepSize = niceResidual * magnitude;
  const max = Math.ceil(maxValue / stepSize) * stepSize;
  return { max, stepSize };
}
