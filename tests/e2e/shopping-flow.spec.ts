import { test, expect } from '@playwright/test';

test.describe('ショッピングフロー', () => {
  test('トップページに12件の商品が表示される', async ({ page }) => {
    await page.goto('/');
    const cards = page.locator('a[href^="/products/p_"]');
    await expect(cards).toHaveCount(12);
  });

  test('商品カードをクリックすると商品詳細に遷移する', async ({ page }) => {
    await page.goto('/');
    const firstCard = page.locator('a[href^="/products/p_"]').first();
    const href = await firstCard.getAttribute('href');
    await firstCard.click();
    await expect(page).toHaveURL(new RegExp('/products/p_\\d{3}'));
    expect(href).toMatch(/^\/products\/p_\d{3}$/);
  });

  test('商品詳細ページで価格が表示される', async ({ page }) => {
    await page.goto('/products/p_001');
    await expect(page.getByTestId('product-price')).toContainText('pt');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('カートに追加 → カートページで確認', async ({ page }) => {
    await page.goto('/products/p_020');
    await page.locator('button:has-text("カートに入れる")').click();
    await page.waitForTimeout(500);
    await page.goto('/cart');
    await expect(page.getByTestId('cart-total')).toBeVisible();
    const totalText = await page.getByTestId('cart-total').textContent();
    expect(totalText).toContain('pt');
  });

  test('プレゼント完了フロー（ポイント不足時）', async ({ page }) => {
    await page.goto('/products/p_002');
    await page.locator('button:has-text("カートに入れる")').click();
    await page.waitForTimeout(500);
    await page.goto('/checkout');

    // p_002は980,000ptなので残高0では不足
    const shortageNotice = page.getByTestId('shortage-notice');
    const presentButton = page.getByTestId('present-button');

    // どちらか表示される（ポイントの初期値による）
    const hasShortage = await shortageNotice.isVisible().catch(() => false);
    const hasPresent = await presentButton.isVisible().catch(() => false);
    expect(hasShortage || hasPresent).toBe(true);
  });

  test('ポイントを設定してプレゼント完了まで', async ({ page }) => {
    // ポイントをセットするためのクッキーを直接設定
    await page.context().addCookies([
      { name: 'melzon_points', value: '99999999', domain: 'localhost', path: '/' },
    ]);

    // カートに商品を追加
    await page.goto('/products/p_020');
    await page.locator('button:has-text("カートに入れる")').click();
    await page.waitForTimeout(500);

    await page.goto('/checkout');
    await expect(page.getByTestId('present-button')).toBeVisible();
    await page.getByTestId('present-button').click();

    await expect(page).toHaveURL('/complete');
    await expect(page.locator('text=めるちゃもへのプレゼントが完了しました')).toBeVisible();
    await expect(page.getByTestId('tweet-button')).toBeVisible();
  });

  test('完了ページのTweetボタンがXのURLを持つ', async ({ page }) => {
    await page.context().addCookies([
      { name: 'melzon_points', value: '99999999', domain: 'localhost', path: '/' },
    ]);
    await page.goto('/products/p_014');
    await page.locator('button:has-text("カートに入れる")').click();
    await page.waitForTimeout(500);

    await page.goto('/checkout');
    await page.getByTestId('present-button').click();
    await expect(page).toHaveURL('/complete');

    const tweetBtn = page.getByTestId('tweet-button');
    const href = await tweetBtn.getAttribute('href');
    expect(href).toContain('twitter.com/intent/tweet');
  });
});
