import { test, expect } from '@playwright/test';

test.describe('検索機能', () => {
  test('検索すると「もしかして」が表示される', async ({ page }) => {
    await page.goto('/search?q=テスト');
    await expect(page.getByTestId('did-you-mean')).toBeVisible();
    await expect(page.locator('[data-testid="did-you-mean"] a')).toBeVisible();
  });

  test('「もしかして」のリンクが商品ページを指している', async ({ page }) => {
    await page.goto('/search?q=金');
    const link = page.locator('[data-testid="did-you-mean"] a');
    const href = await link.getAttribute('href');
    expect(href).toMatch(/^\/products\/p_\d{3}$/);
  });

  test('検索結果は常に0件', async ({ page }) => {
    await page.goto('/search?q=金鮭');
    await expect(page.locator('text=該当する商品はありませんでした')).toBeVisible();
  });

  test('「もしかして」のリンクをクリックすると商品詳細に遷移', async ({ page }) => {
    await page.goto('/search?q=test');
    const link = page.locator('[data-testid="did-you-mean"] a');
    await link.click();
    await expect(page).toHaveURL(/\/products\/p_\d{3}/);
    await expect(page.locator('h1')).toBeVisible();
  });

  test('おすすめ商品が12件表示される', async ({ page }) => {
    await page.goto('/search?q=anything');
    const cards = page.locator('a[href^="/products/p_"]');
    await expect(cards).toHaveCount(12);
  });
});
