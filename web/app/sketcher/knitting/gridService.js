export function cellKey(row, col) {
  return `${row},${col}`;
}

export function toggleCell(filledCells, row, col) {
  const key = cellKey(row, col);
  const updated = new Set(filledCells);
  if (updated.has(key)) {
    updated.delete(key);
  } else {
    updated.add(key);
  }
  return updated;
}

export function clearCells() {
  return new Set();
}

export function clearManualCellsOutsideSketch(filledCells, sketchFilled) {
  if (!filledCells || filledCells.size === 0) return new Set();
  const sketchSet = sketchFilled ?? new Set();
  const remaining = new Set();
  for (const key of filledCells) {
    if (sketchSet.has(key)) {
      remaining.add(key);
    }
  }
  return remaining;
}

export function getFilledBoundingBox(filledCells) {
  if (!filledCells || filledCells.size === 0) return null;
  let minRow = Infinity, minCol = Infinity, maxRow = -Infinity, maxCol = -Infinity;
  for (const key of filledCells) {
    const [r, c] = key.split(',').map(Number);
    if (r < minRow) minRow = r;
    if (c < minCol) minCol = c;
    if (r > maxRow) maxRow = r;
    if (c > maxCol) maxCol = c;
  }
  return { minRow, minCol, maxRow, maxCol };
}

export function getCombinedBoundingBox(filledCells, sketchFilled) {
  const all = new Set(filledCells);
  if (sketchFilled) {
    for (const key of sketchFilled) all.add(key);
  }
  return getFilledBoundingBox(all);
}

export function gaugeToCellSize(stitchesPer4Inches, rowsPer4Inches) {
  return {
    cellWidthPx: Math.max(1, stitchesPer4Inches),
    cellHeightPx: Math.max(1, rowsPer4Inches),
  };
}
