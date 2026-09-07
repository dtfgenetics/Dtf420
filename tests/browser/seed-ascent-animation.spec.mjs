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
  await expect(frame.locator('#game')).toHaveAttribute('data-player-animation', /idle|land/);
  await expect(frame.locator('#game')).toHaveAttribute('data-player-animation-sheet', 'base');

  await frame.locator('#game').focus();
  await page.keyboard.down('ArrowRight');
  await expect(frame.locator('#game')).toHaveAttribute('data-player-animation', 'run');
  await expect(frame.locator('#game')).toHaveAttribute('data-player-animation-sheet', 'base');
  await page.keyboard.up('ArrowRight');

  await page.keyboard.press('Space');
  await expect.poll(async()=> (await debug(frame))?.player?.grounded).toBe(false);
  await expect(frame.locator('#game')).toHaveAttribute('data-player-animation', /jump|fall/);
});

test("Seed Ascent publishes transform and phenotype attack animation states", async ({ page }) => {
  await page.goto('/games/seed-ascent', { waitUntil: 'networkidle' });
  const frame=await gameFrame(page);
  await frame.locator('#startBtn').click();

  await frame.locator('#game').evaluate(() => window.__seedAscentDebug.setPower('FIRE'));
  await expect(frame.locator('#game')).toHaveAttribute('data-player-animation', 'transform');
  await expect(frame.locator('#game')).toHaveAttribute('data-player-animation-sheet', 'fire');

  await frame.locator('#game').focus();
  await page.keyboard.press('x');
  await expect.poll(async()=> (await debug(frame))?.projectileCount).toBeGreaterThan(0);
  await expect(frame.locator('#game')).toHaveAttribute('data-player-animation', 'fireAttack');
  await expect(frame.locator('#game')).toHaveAttribute('data-player-animation-priority', '4');
  await expect(frame.locator('#game')).toHaveAttribute('data-player-authored-frame', /^\d+$/);
  await expect(frame.locator('#game')).toHaveAttribute('data-player-animation-sheet', 'fire');
});

test("Seed Ascent keeps verified fallback rendering while authored sheets are unavailable", async ({ page }) => {
  await page.goto('/games/seed-ascent', { waitUntil: 'networkidle' });
  const frame=await gameFrame(page);
  const game=frame.locator('#game');
  await frame.locator('#startBtn').click();

  await expect(game).toHaveAttribute('data-player-animation-sheet', 'base');
  await expect(game).toHaveAttribute('data-player-animation-using-authored', 'false');
  await expect(game).toHaveAttribute('data-player-animation-sheet-status', /loading|missing/);

  await game.evaluate(() => window.__seedAscentDebug.setPower('ICE'));
  await expect(game).toHaveAttribute('data-player-animation', 'transform');
  await expect(game).toHaveAttribute('data-player-animation-sheet', 'ice');
  await expect(game).toHaveAttribute('data-player-animation-using-authored', 'false');
  await expect(game).toHaveAttribute('data-player-animation-sheet-status', /loading|missing/);
});
