import { expect, test } from '@playwright/test';
import { openSketch, clickStage, dragStage } from './helpers/sketchHelpers.js';

test.describe('Sketch shapes — circle', () => {
  test('circle is created from center outward and appears in object list', async ({ page }) => {
    const box = await openSketch(page);

    // Switch to the Circle tool
    await page.getByRole('button', { name: 'Circle' }).click();

    // Click center at (100, 100), then click at (160, 100) to set radius = 60
    await clickStage(page, box, { x: 100, y: 100 });
    await clickStage(page, box, { x: 160, y: 100 });

    const circle = await page.evaluate(() => {
      const circles = window.__knitstitchStore?.state?.sketch?.circles ?? [];
      return circles.map((c) => ({
        id: c.id,
        center: { x: c.center.x, y: c.center.y },
        radius: c.radius,
      }));
    });
    expect(circle).toHaveLength(1);
    expect(Math.abs(circle[0].center.x - 100)).toBeLessThan(5);
    expect(Math.abs(circle[0].center.y - 100)).toBeLessThan(5);
    expect(Math.abs(circle[0].radius - 60)).toBeLessThan(5);

    // Object list should show the circle
    const objectList = await page.locator('#sketch-object-list').innerText();
    expect(objectList).toContain('Circle');
  });

  test('circle center can be dragged and the circle moves', async ({ page }) => {
    const box = await openSketch(page);

    await page.getByRole('button', { name: 'Circle' }).click();
    await clickStage(page, box, { x: 100, y: 100 });
    await clickStage(page, box, { x: 160, y: 100 });

    // Switch to Select and drag the center point
    await page.getByRole('button', { name: 'Select' }).click();
    await dragStage(page, box, { x: 100, y: 100 }, { x: 150, y: 150 });

    const circle = await page.evaluate(() => {
      const circles = window.__knitstitchStore?.state?.sketch?.circles ?? [];
      return circles[0] ? { center: { x: circles[0].center.x, y: circles[0].center.y }, radius: circles[0].radius } : null;
    });
    expect(circle).not.toBeNull();
    expect(circle.center.x).toBeGreaterThan(120);
    expect(circle.center.y).toBeGreaterThan(120);
  });

  test('circle radius can be resized by dragging its circumference', async ({ page }) => {
    const box = await openSketch(page);

    await page.getByRole('button', { name: 'Circle' }).click();
    await clickStage(page, box, { x: 100, y: 100 });
    await clickStage(page, box, { x: 160, y: 100 });

    await page.getByRole('button', { name: 'Select' }).click();
    await dragStage(page, box, { x: 160, y: 100 }, { x: 190, y: 100 });

    const circle = await page.evaluate(() => {
      const circles = window.__knitstitchStore?.state?.sketch?.circles ?? [];
      return circles[0] ? { center: { x: circles[0].center.x, y: circles[0].center.y }, radius: circles[0].radius } : null;
    });

    expect(circle).not.toBeNull();
    expect(circle.center.x).toBeCloseTo(100, 1);
    expect(circle.center.y).toBeCloseTo(100, 1);
    expect(circle.radius).toBeGreaterThan(80);
  });

  test('clicking the circle center does not move it', async ({ page }) => {
    const box = await openSketch(page);

    await page.getByRole('button', { name: 'Circle' }).click();
    await clickStage(page, box, { x: 100, y: 100 });
    await clickStage(page, box, { x: 160, y: 100 });

    await page.getByRole('button', { name: 'Select' }).click();
    await clickStage(page, box, { x: 100, y: 100 });
    await clickStage(page, box, { x: 220, y: 220 });

    const circle = await page.evaluate(() => {
      const circles = window.__knitstitchStore?.state?.sketch?.circles ?? [];
      return circles[0] ? { center: { x: circles[0].center.x, y: circles[0].center.y }, radius: circles[0].radius } : null;
    });

    expect(circle).not.toBeNull();
    expect(circle.center.x).toBeCloseTo(100, 1);
    expect(circle.center.y).toBeCloseTo(100, 1);
    expect(circle.radius).toBeCloseTo(60, 1);
  });

  test('clicking near the edge of the center point does not start a hidden drag', async ({ page }) => {
    const box = await openSketch(page);

    await page.getByRole('button', { name: 'Circle' }).click();
    await clickStage(page, box, { x: 100, y: 100 });
    await clickStage(page, box, { x: 160, y: 100 });

    await page.getByRole('button', { name: 'Select' }).click();
    await clickStage(page, box, { x: 104, y: 100 });
    await clickStage(page, box, { x: 220, y: 220 });

    const circle = await page.evaluate(() => {
      const circles = window.__knitstitchStore?.state?.sketch?.circles ?? [];
      return circles[0] ? { center: { x: circles[0].center.x, y: circles[0].center.y }, radius: circles[0].radius } : null;
    });

    expect(circle).not.toBeNull();
    expect(circle.center.x).toBeCloseTo(100, 1);
    expect(circle.center.y).toBeCloseTo(100, 1);
    expect(circle.radius).toBeCloseTo(60, 1);
  });

  test('releasing a center drag outside the canvas cannot leave a hidden drag active', async ({ page }) => {
    const box = await openSketch(page);

    await page.getByRole('button', { name: 'Circle' }).click();
    await clickStage(page, box, { x: 100, y: 100 });
    await clickStage(page, box, { x: 160, y: 100 });
    await page.getByRole('button', { name: 'Select' }).click();

    await page.mouse.move(box.x + 100 * box.scale, box.y + 100 * box.scale);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width + 100, box.y + 100);
    await page.mouse.up();

    const afterRelease = await page.evaluate(() => {
      const value = window.__knitstitchStore?.state?.sketch?.circles?.[0];
      return value ? { x: value.center.x, y: value.center.y } : null;
    });

    // Move and click back on the stage. A missed mouseup used to let this
    // update the old center point in the background.
    await page.mouse.move(box.x + 240 * box.scale, box.y + 220 * box.scale);
    await page.mouse.click(box.x + 240 * box.scale, box.y + 220 * box.scale);

    const circle = await page.evaluate(() => {
      const value = window.__knitstitchStore?.state?.sketch?.circles?.[0];
      return value ? { x: value.center.x, y: value.center.y } : null;
    });

    expect(circle).not.toBeNull();
    expect(circle).toEqual(afterRelease);
  });

  test('circle can be selected by clicking on its circumference', async ({ page }) => {
    const box = await openSketch(page);

    await page.getByRole('button', { name: 'Circle' }).click();
    await clickStage(page, box, { x: 100, y: 100 });
    await clickStage(page, box, { x: 160, y: 100 });

    // Switch to Select and click on the circumference (right side of circle)
    await page.getByRole('button', { name: 'Select' }).click();
    await clickStage(page, box, { x: 160, y: 100 });

    const isSelected = await page.evaluate(() => {
      const circles = window.__knitstitchStore?.state?.sketch?.circles ?? [];
      return circles[0]?.isSelected ?? false;
    });
    expect(isSelected).toBe(true);
  });

  test('circle can be deleted after selection', async ({ page }) => {
    const box = await openSketch(page);

    await page.getByRole('button', { name: 'Circle' }).click();
    await clickStage(page, box, { x: 100, y: 100 });
    await clickStage(page, box, { x: 160, y: 100 });

    await page.getByRole('button', { name: 'Select' }).click();
    await clickStage(page, box, { x: 160, y: 100 });

    await page.getByRole('button', { name: 'Delete' }).click();

    const circles = await page.evaluate(() => {
      return (window.__knitstitchStore?.state?.sketch?.circles ?? []).length;
    });
    expect(circles).toBe(0);
  });

  test('circle contributes to sketch cell fill', async ({ page }) => {
    const box = await openSketch(page);

    await page.getByRole('button', { name: 'Circle' }).click();
    await clickStage(page, box, { x: 100, y: 100 });
    await clickStage(page, box, { x: 160, y: 100 });

    const fillCount = await page.evaluate(() => {
      const store = window.__knitstitchStore;
      const computeFilledCellsForSketch = window.__knitstitchComputeFilledCellsForSketch;
      if (!store || !computeFilledCellsForSketch) return 0;
      return computeFilledCellsForSketch(
        store.state.sketch,
        store.get('cellWidthPx'),
        store.get('cellHeightPx'),
        store.get('fillThreshold'),
      ).size;
    });

    expect(fillCount).toBeGreaterThan(0);
  });

  test('right click cancels pending circle instead of creating one', async ({ page }) => {
    const box = await openSketch(page);

    await page.getByRole('button', { name: 'Circle' }).click();
    await clickStage(page, box, { x: 100, y: 100 });

    await page.mouse.click(box.x + 180 * box.scale, box.y + 100 * box.scale, { button: 'right' });

    const result = await page.evaluate(() => {
      const store = window.__knitstitchStore;
      return {
        circles: store?.state?.sketch?.circles?.length ?? 0,
        activeTool: store?.state?.sketch?.activeTool ?? null,
        previewCircle: store?.state?.sketch?.previewCircle ?? null,
      };
    });

    expect(result.circles).toBe(0);
    expect(result.activeTool).toBe('Select');
    expect(result.previewCircle).toBeNull();
  });
});
