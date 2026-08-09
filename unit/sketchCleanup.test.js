import { describe, it, expect } from 'vitest';
import { removeOrphanPoint } from '../src/services/sketch/state/sketchCleanup.js';

describe('removeOrphanPoint', () => {
  it('does not remove a point used as a circle center', () => {
    const center = { id: 1, x: 10, y: 20, isOrigin: false };
    const sketch = {
      points: [center],
      lines: [],
      dimensions: [],
      constraints: [],
      circles: [{ center, radius: 30 }],
      beziers: [],
    };

    const removed = removeOrphanPoint(sketch, center);

    expect(removed).toBe(false);
    expect(sketch.points).toHaveLength(1);
    expect(sketch.points[0]).toBe(center);
  });
});
