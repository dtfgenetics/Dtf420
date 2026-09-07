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

  await frame.locator('#game').focus();
  await page.keyboard.down('ArrowRight');
  await expect(frame.locator('#game')).toHaveAttribute('data-player-animation', 'run');
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

  await frame.locator('#game').focus();
  await page.keyboard.press('x');
  await expect.poll(async()=> (await debug(frame))?.projectileCount).toBeGreaterThan(0);
  await expect(frame.locator('#game')).toHaveAttribute('data-player-animation', 'fireAttack');
  await expect(frame.locator('#game')).toHaveAttribute('data-player-animation-priority', '4');
  await expect(frame.locator('#game')).toHaveAttribute('data-player-authored-frame', /^\d+$/);
});
