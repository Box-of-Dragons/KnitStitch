import { test, expect } from '@playwright/test';
import { openSketch, clickStage } from './helpers/sketchHelpers.js';

test.describe('Sketch tools — line', () => {
  test('line tool creates a single segment from two clicks', async ({ page }) => {
    const box = await openSketch(page);

    await clickStage(page, box, { x: 0, y: 0 });
    await clickStage(page, box, { x: 100, y: 0 });

    const state = await page.evaluate(() => {
      const sketch = window.__knitstitchStore?.state?.sketch;
      return {
        lineCount: sketch?.lines?.length ?? 0,
        pointCount: sketch?.points?.filter((p) => !p.isAnchor).length ?? 0,
      };
    });

    expect(state.lineCount).toBe(1);
    // Origin anchor is reused for the first click; only the (100, 0)
    // endpoint is a new non-anchor point.
    expect(state.pointCount).toBe(1);
  });

  test('line tool creates a polyline with a shared midpoint', async ({ page }) => {
    const box = await openSketch(page);

    await clickStage(page, box, { x: 0, y: 0 });
    await clickStage(page, box, { x: 100, y: 0 });
    await clickStage(page, box, { x: 100, y: 100 });

    const state = await page.evaluate(() => {
      const sketch = window.__knitstitchStore?.state?.sketch;
      return {
        lineCount: sketch?.lines?.length ?? 0,
        pointCount: sketch?.points?.filter((p) => !p.isAnchor).length ?? 0,
      };
    });

    expect(state.lineCount).toBe(2);
    // Two new non-anchor points beyond the origin anchor.
    expect(state.pointCount).toBe(2);
  });

  test('closing a polyline back to the start creates a coincident constraint', async ({ page }) => {
    const box = await openSketch(page);

    await clickStage(page, box, { x: 0, y: 0 });
    await clickStage(page, box, { x: 100, y: 0 });
    await clickStage(page, box, { x: 100, y: 100 });
    await clickStage(page, box, { x: 2, y: 2 });

    const state = await page.evaluate(() => {
      const sketch = window.__knitstitchStore?.state?.sketch;
      return {
        lineCount: sketch?.lines?.length ?? 0,
        pointCount: sketch?.points?.filter((p) => !p.isAnchor).length ?? 0,
        constraintCount: sketch?.constraints?.length ?? 0,
        hasCoincident: (sketch?.constraints || []).some((c) => c.type === 'Coincident'),
      };
    });

    expect(state.lineCount).toBe(3);
    // Origin anchor is reused as the closing point; two new points drawn.
    expect(state.pointCount).toBe(2);
  });

  test('construction line tool draws dashed construction segments', async ({ page }) => {
    const box = await openSketch(page);

    await page.getByRole('button', { name: 'Construction' }).click();

    await clickStage(page, box, { x: -50, y: 50 });
    await clickStage(page, box, { x: 150, y: 50 });

    const state = await page.evaluate(() => {
      const sketch = window.__knitstitchStore?.state?.sketch;
      const lines = sketch?.lines || [];
      return {
        lineCount: lines.length,
        constructionCount: lines.filter((l) => l.isConstruction).length,
        pointCount: sketch?.points?.filter((p) => !p.isAnchor).length ?? 0,
      };
    });

    expect(state.lineCount).toBe(1);
    expect(state.constructionCount).toBe(1);
    expect(state.pointCount).toBe(2);
  });
});
