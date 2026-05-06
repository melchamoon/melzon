import { test, expect } from '@playwright/test';

test.describe('ミニゲーム', () => {
  test('ゲーム一覧ページが表示される', async ({ page }) => {
    await page.goto('/games');
    await expect(page.getByTestId('game-card-slot')).toBeVisible();
    await expect(page.getByTestId('game-card-click')).toBeVisible();
    await expect(page.getByTestId('game-card-memory')).toBeVisible();
  });

  test('ゲーム一覧のポイント残高が表示される', async ({ page }) => {
    await page.goto('/games');
    await expect(page.getByTestId('games-balance')).toBeVisible();
    const balanceText = await page.getByTestId('games-balance').textContent();
    expect(balanceText).toContain('pt');
  });

  test('スロット: スピンボタンが動作する', async ({ page }) => {
    await page.goto('/games/slot');
    const spinBtn = page.getByTestId('spin-button');
    await expect(spinBtn).toBeVisible();
    await spinBtn.click();
    await expect(spinBtn).toBeDisabled();
    await page.waitForTimeout(1200);
    await expect(spinBtn).toBeEnabled();
  });

  test('連打ゲーム: ボタンをクリックするとポイントが増える', async ({ page }) => {
    await page.goto('/games/click');
    const clickBtn = page.getByTestId('click-button');
    await expect(clickBtn).toBeVisible();

    await clickBtn.click();
    await clickBtn.click();
    await clickBtn.click();

    const earned = page.getByTestId('total-earned');
    const text = await earned.textContent();
    const num = parseInt((text ?? '0').replace(/[^0-9]/g, ''));
    expect(num).toBeGreaterThan(0);
  });

  test('神経衰弱: カードが12枚表示される', async ({ page }) => {
    await page.goto('/games/memory');
    const cards = page.locator('[data-testid^="memory-card-"]');
    await expect(cards).toHaveCount(12);
  });

  test('神経衰弱: カードをクリックするとめくれる', async ({ page }) => {
    await page.goto('/games/memory');
    const firstCard = page.locator('[data-testid^="memory-card-"]').first();
    await firstCard.click();
    // クリック後にカードが表向きになる（？が消える）
    await expect(firstCard.locator('text=？')).toHaveCount(0);
  });

  test('不正なスラッグは404', async ({ page }) => {
    const response = await page.goto('/games/invalid-game');
    expect(response?.status()).toBe(404);
  });
});
