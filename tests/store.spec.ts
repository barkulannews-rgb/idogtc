import { test, expect, Page } from '@playwright/test';

async function login(page: Page) {
  await page.goto('/admin');
  await page.locator('input[type="text"]').fill('admin');
  await page.locator('input[type="password"]').fill('admin123');
  await page.getByRole('button', { name: 'Login to Control Panel' }).click();
  await expect(page.getByText('Total Products', { exact: true })).toBeVisible();
}

test('deleted products and empty collections survive a refresh', async ({ page }) => {
  await page.goto('/');
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('idogtc_products')!).length)).toBe(14);
  await page.evaluate(() => {
    const products = JSON.parse(localStorage.getItem('idogtc_products')!);
    localStorage.setItem('idogtc_products', JSON.stringify(products.slice(1)));
    localStorage.setItem('idogtc_partners', '[]');
    localStorage.setItem('idogtc_media', '[]');
  });
  await page.reload();
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('idogtc_products')!).length)).toBe(13);
  expect(await page.evaluate(() => localStorage.getItem('idogtc_partners'))).toBe('[]');
  expect(await page.evaluate(() => localStorage.getItem('idogtc_media'))).toBe('[]');
  await page.evaluate(() => localStorage.setItem('idogtc_products', '[]'));
  await page.reload();
  await expect(page.locator('body')).toContainText('IDO');
  expect(await page.evaluate(() => localStorage.getItem('idogtc_products'))).toBe('[]');
});

test('cart, wishlist, WhatsApp inquiry and order status survive refresh', async ({ page }) => {
  await page.goto('/');
  await page.getByTitle('Add to Cart', { exact: true }).first().click({ force: true });
  await page.getByTitle('Add to Wishlist', { exact: true }).first().click({ force: true });
  await page.reload();
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('idogtc_cart')!).length)).toBe(1);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('idogtc_wishlist')!).length)).toBe(1);
  // The existing WhatsApp workflow opens a draft; no external message is sent by this test.
  await page.evaluate(() => { window.open = () => ({ opener: null, location: { href: '' }, close() {} }) as unknown as Window; });
  await page.getByTitle('Cart', { exact: true }).filter({ visible: true }).first().click();
  await page.getByRole('button', { name: /Order via WhatsApp/ }).click();
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('idogtc_orders')!).length)).toBe(1);
  await login(page);
  await page.getByRole('button', { name: /Orders/ }).click();
  await page.locator('main select').selectOption('Contacted');
  await page.reload();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('idogtc_orders')!)[0].status)).toBe('Contacted');
});

test('renaming a category keeps products attached', async ({ page }) => {
  await login(page);
  const oldName = await page.evaluate(() => JSON.parse(localStorage.getItem('idogtc_categories')!)[0].name);
  await page.getByRole('button', { name: /Categories/ }).click();
  await page.getByTitle('Edit Category').first().click();
  const form = page.locator('form');
  await form.locator('input[type="text"]').first().fill('Renamed food category');
  await page.getByRole('button', { name: 'Save Category', exact: true }).click();
  await page.reload();
  const products = await page.evaluate(() => JSON.parse(localStorage.getItem('idogtc_products')!));
  expect(products.some((product: { category: string }) => product.category === oldName)).toBe(false);
  expect(products.some((product: { category: string }) => product.category === 'Renamed food category')).toBe(true);
});

test('corrupt browser data falls back without crashing and legacy image paths migrate', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.setItem('idogtc_slides', '{broken');
    localStorage.setItem('idogtc_settings', 'null');
    localStorage.setItem('idogtc_categories', '{}');
    const products = JSON.parse(localStorage.getItem('idogtc_products')!);
    products[0].image = '/src/assets/images/hero_global_shipping_1793690292263.jpg';
    localStorage.setItem('idogtc_products', JSON.stringify(products));
  });
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.reload();
  await expect(page.getByTitle('Add to Cart').first()).toBeAttached();
  expect(errors).toEqual([]);
  const image = await page.evaluate(() => JSON.parse(localStorage.getItem('idogtc_products')!)[0].image);
  expect(image).toMatch(/^\/images\//);
  const response = await page.request.get(image);
  expect(response.headers()['content-type']).toContain('image/');
});

test('invalid usernames are rejected', async ({ page }) => {
  await page.goto('/admin');
  await page.locator('input[type="text"]').fill('not-an-admin');
  await page.locator('input[type="password"]').fill('admin123');
  await page.getByRole('button', { name: 'Login to Control Panel' }).click();
  await expect(page.getByText(/Invalid credentials/)).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('idogtc_admin_auth'))).toBeNull();
});

test('storage failures display an error instead of crashing', async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => { throw new DOMException('Storage full', 'QuotaExceededError'); };
  });
  await page.goto('/');
  await expect(page.getByRole('alert')).toContainText('Unable to save');
  await expect(page.getByTitle('Add to Cart').first()).toBeAttached();
});

test('currency selection updates prices and newsletter saves a validated email', async ({ page }) => {
  await page.goto('/');
  await page.locator('select').selectOption('AED');
  await expect(page.locator('#featured')).toContainText('AED');
  await page.locator('input[type="email"]').fill('customer@example.com');
  await page.locator('footer button[type="submit"]').click();
  await expect.poll(() => page.evaluate(() => localStorage.getItem('idogtc_subscribers'))).toBe('["customer@example.com"]');
});
