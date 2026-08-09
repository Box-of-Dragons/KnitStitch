import { expect, test } from '@playwright/test';
import { openSketch, clickStage } from './helpers/sketchHelpers.js';

test.describe('Sketch circle + dimension cancellation', () => {
  test('cancelling dimension mode does not delete a circle center point', async ({ page }) => {
    const box = await openSketch(page);

    await page.getByRole('button', { name: 'Circle' }).click();
    await clickStage(page, box, { x: 100, y: 100 });
    await clickStage(page, box, { x: 160, y: 100 });

    await page.getByRole('button', { name: 'Dimension' }).click();
    await clickStage(page, box, { x: 100, y: 100 });
    await page.mouse.click(box.x + 220 * box.scale, box.y + 220 * box.scale, { button: 'right' });

    const state = await page.evaluate(() => {
      const sketch = window.__knitstitchStore?.state?.sketch;
      const circle = sketch?.circles?.[0];
      return {
        pointCount: sketch?.points?.length ?? -1,
        circleCount: sketch?.circles?.length ?? -1,
        hasCircleCenter: !!circle && (sketch?.points ?? []).some((point) => point === circle.center),
        activeTool: sketch?.activeTool ?? null,
      };
    });

    expect(state.circleCount).toBe(1);
    expect(state.pointCount).toBeGreaterThanOrEqual(1);
    expect(state.hasCircleCenter).toBe(true);
    expect(state.activeTool).toBe('Select');
  });
});
