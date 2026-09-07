import { expect, test } from "@playwright/test";

async function gameFrame(page){
  return page.frameLocator('iframe[title="Seed Ascent browser game"]');
}

async function debug(frame){
  return frame.locator('#game').evaluate(() => window.__seedAscentDebug?.snapshot?.());
}

test("Seed Ascent publishes runtime movement animation states", async ({ page }) => {
  await page.goto('/games/seed-ascent', { waitUntil: 'networkidle' });
  const frame=await gameFrame(page);
  await frame.locator('#startBtn').click();
  const game=frame.locator('#game');
  await expect(game).toHaveAttribute('data-player-animation', /idle|land/);
  await expect(game).toHaveAttribute('data-player-animation-sheet', 'base');
  await expect(game).toHaveAttribute('data-player-rendered-sheet', 'fallback');
  await expect(game).toHaveAttribute('data-player-rendered-authored', 'false');

  await game.focus();
  await page.keyboard.down('ArrowRight');
  await expect(game).toHaveAttribute('data-player-animation', 'run');
  await expect(game).toHaveAttribute('data-player-animation-sheet', 'base');
  await expect(game).toHaveAttribute('data-player-rendered-sheet', 'fallback');
  await page.keyboard.up('ArrowRight');

  await page.keyboard.press('Space');
  await expect.poll(async()=> (await debug(frame))?.player?.grounded).toBe(false);
  await expect(game).toHaveAttribute('data-player-animation', /jump|fall/);
});

test("Seed Ascent publishes transform and phenotype attack animation states", async ({ page }) => {
  await page.goto('/games/seed-ascent', { waitUntil: 'networkidle' });
  const frame=await gameFrame(page);
  const game=frame.locator('#game');
  await frame.locator('#startBtn').click();

  await game.evaluate(() => window.__seedAscentDebug.setPower('FIRE'));
  await expect(game).toHaveAttribute('data-player-animation', 'transform');
  await expect(game).toHaveAttribute('data-player-animation-power', 'FIRE');
  await expect(game).toHaveAttribute('data-player-animation-sheet', 'fire');

  await game.focus();
  await page.keyboard.press('x');
  await expect.poll(async()=> (await debug(frame))?.projectileCount).toBeGreaterThan(0);
  await expect(game).toHaveAttribute('data-player-animation', 'fireAttack');
  await expect(game).toHaveAttribute('data-player-animation-priority', '4');
  await expect(game).toHaveAttribute('data-player-authored-frame', /^\d+$/);
  await expect(game).toHaveAttribute('data-player-animation-sheet', 'fire');
  await expect(game).toHaveAttribute('data-player-rendered-sheet', 'fallback');
  await expect(game).toHaveAttribute('data-player-rendered-authored', 'false');
});

test("Seed Ascent keeps verified fallback rendering while authored sheets are unavailable", async ({ page }) => {
  await page.goto('/games/seed-ascent', { waitUntil: 'networkidle' });
  const frame=await gameFrame(page);
  const game=frame.locator('#game');
  await frame.locator('#startBtn').click();

  await expect(game).toHaveAttribute('data-player-animation-sheet', 'base');
  await expect(game).toHaveAttribute('data-player-animation-using-authored', 'false');
  await expect(game).toHaveAttribute('data-player-animation-sheet-status', /loading|missing/);
  await expect(game).toHaveAttribute('data-player-rendered-sheet', 'fallback');
  await expect(game).toHaveAttribute('data-player-rendered-authored', 'false');

  await game.evaluate(() => window.__seedAscentDebug.setPower('ICE'));
  await expect(game).toHaveAttribute('data-player-animation', 'transform');
  await expect(game).toHaveAttribute('data-player-animation-sheet', 'ice');
  await expect(game).toHaveAttribute('data-player-animation-using-authored', 'false');
  await expect(game).toHaveAttribute('data-player-animation-sheet-status', /loading|missing/);
  await expect(game).toHaveAttribute('data-player-rendered-sheet', 'fallback');
});

test("Seed Ascent preserves phenotype sheet identity through revert animation", async ({ page }) => {
  await page.goto('/games/seed-ascent', { waitUntil: 'networkidle' });
  const frame=await gameFrame(page);
  const game=frame.locator('#game');
  await frame.locator('#startBtn').click();

  await game.evaluate(() => window.__seedAscentDebug.setPower('FIRE'));
  await expect(game).toHaveAttribute('data-player-animation-sheet', 'fire');
  await expect(game).toHaveAttribute('data-player-animation-power', 'FIRE');

  await expect.poll(async()=> game.getAttribute('data-player-animation'), { timeout: 2500 }).not.toBe('transform');
  await game.evaluate(() => window.__seedAscentDebug.setPower('NONE'));
  await expect(game).toHaveAttribute('data-player-animation', 'revert');
  await expect(game).toHaveAttribute('data-player-animation-power', 'FIRE');
  await expect(game).toHaveAttribute('data-player-animation-sheet', 'fire');
  await expect(game).toHaveAttribute('data-player-rendered-sheet', 'fallback');

  await expect.poll(async()=> game.getAttribute('data-player-animation'), { timeout: 2500 }).not.toBe('revert');
  await expect(game).toHaveAttribute('data-player-animation-power', 'NONE');
  await expect(game).toHaveAttribute('data-player-animation-sheet', 'base');
});

test("Seed Ascent authored renderer debug API reports fallback until an authored atlas is ready", async ({ page }) => {
  await page.goto('/games/seed-ascent', { waitUntil: 'networkidle' });
  const frame=await gameFrame(page);
  await frame.locator('#startBtn').click();
  const renderer=await frame.locator('#game').evaluate(() => window.__seedAscentAuthoredRenderer?.snapshot?.());
  expect(renderer).toBeTruthy();
  expect(renderer.usingAuthored).toBe(false);
  expect(renderer.renderedSheet).toBe('fallback');
  expect(renderer.state).toMatch(/idle|land/);
});
