import { test, expect, BrowserContext } from '@playwright/test';
import fs from 'node:fs';

function database(withCatalogue = false) {
  let snapshot = { state: JSON.parse(fs.readFileSync('release/public_html/api/seed.json', 'utf8')), revision: 1 };
  if (withCatalogue) {
    const catalogue = JSON.parse(fs.readFileSync('catalogue/idogtc-catalogue-2026-11.json', 'utf8'));
    snapshot.state.products.push(...catalogue.products.map((product: object, index: number) => ({ ...product, id: 1000 + index })));
    snapshot.state.categories.push(...catalogue.categories);
  }
  let failSave = false;
  return {
    fail: () => { failSave = true; },
    connect: async (context: BrowserContext) => {
      let authenticated = false;
      await context.route('**/api/index.php?route=*', async route => {
        const request = route.request(), endpoint = new URL(request.url()).searchParams.get('route');
        let status = 200, body: unknown = {};
        if (endpoint === 'session') body = { authenticated, csrf: 'test-csrf' };
        else if (endpoint === 'login') {
          const credentials = request.postDataJSON();
          authenticated = credentials.username === 'owner' && credentials.password === 'owner-test-password';
          body = authenticated ? { authenticated: true, csrf: 'logged-in-csrf' } : { error: 'Invalid username or password.' };
          if (!authenticated) status = 401;
        } else if (endpoint === 'logout') { authenticated = false; body = { csrf: 'logged-out-csrf' }; }
        else if (endpoint === 'orders') body = { orders: [] };
        else if (endpoint === 'store' && request.method() === 'GET') body = snapshot;
        else if (endpoint === 'store' && request.method() === 'PUT') {
          if (!authenticated) { status = 401; body = { error: 'Please log in again.' }; }
          else if (failSave) { status = 503; body = { error: 'Test server unavailable.' }; }
          else { const input = request.postDataJSON(); snapshot = { state: input.state, revision: snapshot.revision + 1 }; body = snapshot; }
        }
        await route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
      });
    },
  };
}

test('server login ignores a forged local auth flag and hides demo access', async ({ page, context }) => {
  const db = database(); await db.connect(context);
  await page.addInitScript(() => localStorage.setItem('idogtc_admin_auth', 'true'));
  await page.goto('/admin');
  await expect(page.getByRole('button', { name: 'Login to Control Panel' })).toBeVisible();
  await expect(page.getByText('admin123', { exact: false })).toHaveCount(0);
  await page.locator('input[type="text"]').fill('admin');
  await page.locator('input[type="password"]').fill('admin123');
  await page.getByRole('button', { name: 'Login to Control Panel' }).click();
  await expect(page.getByText('Invalid username or password.')).toBeVisible();
});

test('all catalogue pages are reachable and quote-only products retain their item codes', async ({ page, context }) => {
  await database(true).connect(context);
  await page.goto('/');
  await expect(page.locator('#recent')).toContainText('260 products');
  await expect(page.locator('#recent .product-item').first()).toContainText('BM-0001');
  await expect(page.locator('#featured')).not.toContainText('Premium Basmati');
  await page.getByLabel('Catalogue page', { exact: true }).selectOption('13');
  await expect(page.locator('#recent')).toContainText('PT-0098');
  await expect(page.locator('#recent')).toContainText('Premium Basmati');
  await page.getByLabel('Catalogue group', { exact: true }).selectOption('Paints & Coatings');
  await expect(page.locator('#recent')).toContainText('98 products');
  await page.getByLabel('Catalogue group', { exact: true }).selectOption('All');
  await page.locator('#site-header input[type="text"]').fill('BM-0141');
  await expect(page.locator('#recent')).toContainText('1 products');
  await expect(page.locator('#recent')).toContainText('Steel Scaffolding');
  await expect(page.locator('#recent')).toContainText('Request quote');
  const quoteLink = page.locator('#recent').getByRole('link', { name: 'Request quote: Steel Scaffolding BM-0141', exact: true });
  await expect(quoteLink).toHaveAttribute('target', '_blank');
  const quoteAddress = new URL((await quoteLink.getAttribute('href'))!);
  expect(quoteAddress.hostname).toBe('wa.me');
  expect(quoteAddress.searchParams.get('text')).toContain('Steel Scaffolding [BM-0141]');
  expect(quoteAddress.searchParams.get('text')).toContain('Quantity: 1 Set');
  await expect(page.locator('#recent')).not.toContainText('$0.00');
  await expect(page.locator('#recent .product-item')).toHaveCount(1);
  await page.locator('#recent h3').click();
  await expect(page.getByText('Code: BM-0141', { exact: false })).toBeVisible();
  await expect(page.getByText('Illustration - actual product may vary.', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: /Add to Cart \(1 units\)/ }).click();
  await page.getByTitle('Cart', { exact: true }).filter({ visible: true }).click();
  await expect(page.getByRole('button', { name: /Order via WhatsApp/ })).toBeVisible();
  await expect(page.locator('body')).toContainText('Request quote');
  await page.keyboard.press('Escape');
  await page.setViewportSize({ width: 390, height: 844 });
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('admin can price an imported item without losing its code, unit or illustration status', async ({ page, context }) => {
  await database(true).connect(context);
  await page.goto('/admin');
  await page.locator('input[type="text"]').fill('owner');
  await page.locator('input[type="password"]').fill('owner-test-password');
  await page.getByRole('button', { name: 'Login to Control Panel' }).click();
  await page.getByRole('button', { name: /^Products/ }).click();
  await page.getByPlaceholder('Search by product name, category, or price...').fill('PT-0098');
  await page.getByTitle('Edit Product', { exact: true }).click();
  await expect(page.getByLabel('Price on request', { exact: true })).toBeChecked();
  await expect(page.getByLabel('Item code', { exact: true })).toHaveValue('PT-0098');
  await expect(page.getByLabel('Product unit', { exact: true })).toHaveValue('Piece');
  await expect(page.getByRole('textbox', { name: 'Wholesale Price', exact: true })).toBeEnabled();
  await expect(page.getByRole('textbox', { name: 'Wholesale Price', exact: true })).toHaveValue('');
  await page.getByRole('textbox', { name: 'Wholesale Price', exact: true }).fill('$8.50');
  await expect(page.getByLabel('Price on request', { exact: true })).not.toBeChecked();
  await page.getByRole('button', { name: 'Save Product', exact: true }).click();
  await expect(page.locator('form')).toHaveCount(0);
  await expect(page.locator('tbody')).toContainText('$8.50');
  await page.getByTitle('Edit Product', { exact: true }).click();
  await expect(page.getByLabel('Item code', { exact: true })).toHaveValue('PT-0098');
  await expect(page.getByLabel('Illustration image', { exact: true })).toBeChecked();
  await expect(page.getByRole('textbox', { name: 'Wholesale Price', exact: true })).toHaveValue('$8.50');
  await page.getByRole('textbox', { name: 'Wholesale Price', exact: true }).fill('');
  await expect(page.getByLabel('Price on request', { exact: true })).toBeChecked();
  await page.getByRole('button', { name: 'Save Product', exact: true }).click();
  await expect(page.locator('tbody')).toContainText('Request quote');
});

test('catalog saves are shared with another visitor and failures keep the edit form open', async ({ page, context, browser }) => {
  const db = database(); await db.connect(context);
  await page.goto('/admin');
  await page.locator('input[type="text"]').fill('owner');
  await page.locator('input[type="password"]').fill('owner-test-password');
  await page.getByRole('button', { name: 'Login to Control Panel' }).click();
  await page.getByRole('button', { name: /^Products/ }).click();
  await page.getByTitle('Edit Product', { exact: true }).first().click();
  await page.locator('form input[type="text"]').first().fill('Shared server product');
  await page.getByRole('button', { name: 'Save Product', exact: true }).click();
  await expect(page.locator('form')).toHaveCount(0);
  const other = await browser.newContext();
  await db.connect(other);
  const visitor = await other.newPage(); await visitor.goto('/');
  await expect(visitor.locator('#featured')).toContainText('Shared server product');
  expect(await visitor.evaluate(() => localStorage.getItem('idogtc_products'))).toBeNull();
  await other.close();
  db.fail();
  await page.getByTitle('Edit Product', { exact: true }).first().click();
  await page.locator('form input[type="text"]').first().fill('Must not be saved');
  await page.getByRole('button', { name: 'Save Product', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Test server unavailable.');
  await expect(page.locator('form')).toBeVisible();
  await expect(page.locator('tbody')).not.toContainText('Must not be saved');
});

test('header edits persist across visitors and control desktop, mobile and WhatsApp', async ({ page, context, browser }) => {
  const db = database(); await db.connect(context);
  await page.goto('/admin');
  await page.locator('input[type="text"]').fill('owner');
  await page.locator('input[type="password"]').fill('owner-test-password');
  await page.getByRole('button', { name: 'Login to Control Panel' }).click();
  await page.getByRole('button', { name: 'Header / Menu & Logo' }).click();
  await expect(page.getByRole('tabpanel')).toHaveCount(1);
  await expect(page.getByRole('tab', { name: 'Logo & brand', exact: true })).toHaveAttribute('aria-selected', 'true');
  await page.getByLabel('brandPrimary', { exact: true }).fill('TESTCO');
  await page.getByLabel('logoAlt', { exact: true }).fill('Custom company logo');
  await page.getByTitle('Paste image link').click();
  await page.getByPlaceholder('https://example.com/image.jpg...').fill('/assets/aistudio/lOGO_2_266fa5f6.png');
  await page.getByRole('tab', { name: 'Phone & WhatsApp', exact: true }).click();
  await page.getByLabel('WhatsApp number', { exact: true }).fill('+971 50 123 4567');
  await page.getByLabel('Customer service number', { exact: true }).fill('+252 90 500 0000');
  await page.getByLabel('WhatsApp message en', { exact: true }).fill('Please send a quote');
  await page.getByLabel('WhatsApp message so', { exact: true }).fill('Qiime ii soo dir');
  await page.getByRole('tab', { name: 'Header text', exact: true }).click();
  await page.getByLabel('Search placeholder en', { exact: true }).fill('Find wholesale goods');
  await page.getByRole('tab', { name: 'Top links', exact: true }).click();
  await page.getByLabel('Top links 1 en', { exact: true }).fill('Our story');
  await page.getByRole('tab', { name: 'Main menu', exact: true }).click();
  await page.getByLabel('Main menu 1 en', { exact: true }).fill('Reach us');
  await page.getByLabel('Main menu 1 so', { exact: true }).fill('Nala hadal');
  await page.getByLabel('Main menu destination 1', { exact: true }).selectOption('contact');
  await page.getByRole('button', { name: 'Move Main menu 1 down', exact: true }).click();
  await page.getByRole('tab', { name: 'Visibility', exact: true }).click();
  await page.getByLabel('Show wishlist', { exact: true }).uncheck();
  await page.getByLabel('Show currency', { exact: true }).uncheck();
  await page.getByRole('button', { name: 'Save Header / Kaydi Header-ka', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Header saved successfully.');
  await page.reload();
  await page.getByRole('button', { name: 'Header / Menu & Logo' }).click();
  await expect(page.getByLabel('brandPrimary', { exact: true })).toHaveValue('TESTCO');
  // An existing Company settings form must not restore an old header object.
  await page.getByRole('button', { name: 'Company & Contact', exact: true }).click();
  await page.getByRole('button', { name: 'Save Changes', exact: true }).click();
  const other = await browser.newContext(); await db.connect(other);
  const visitor = await other.newPage(); await visitor.goto('/');
  const header = visitor.locator('#site-header');
  await expect(header).toContainText('TESTCO');
  await expect(header.getByAltText('Custom company logo')).toHaveAttribute('src', '/assets/aistudio/lOGO_2_266fa5f6.png');
  await expect(header.getByPlaceholder('Find wholesale goods')).toBeVisible();
  await expect(header).toContainText('+252 90 500 0000');
  await expect(header.locator('nav button').nth(1)).toHaveText('Reach us');
  await expect(header.locator('a[href^="https://wa.me/"]').first()).toHaveAttribute('href', 'https://wa.me/971501234567?text=Please%20send%20a%20quote');
  await expect(header.getByTitle('Wishlist', { exact: true })).toHaveCount(0);
  await expect(header.locator('select')).toHaveCount(0);
  await header.getByRole('button', { name: 'Reach us', exact: true }).click();
  await expect.poll(() => visitor.evaluate(() => Math.abs(document.getElementById('contact')!.getBoundingClientRect().top))).toBeLessThan(200);
  await visitor.setViewportSize({ width: 390, height: 844 });
  await visitor.evaluate(() => window.scrollTo(0, 0));
  await header.getByRole('button', { name: 'SO', exact: true }).click();
  await header.getByRole('button', { name: 'Toggle Navigation', exact: true }).click();
  await expect(header.getByRole('button', { name: 'Nala hadal', exact: true }).filter({ visible: true })).toBeVisible();
  await expect(header.locator('a[href^="https://wa.me/"]').filter({ visible: true })).toHaveAttribute('href', 'https://wa.me/971501234567?text=Qiime%20ii%20soo%20dir');
  await other.close();
  db.fail();
  await page.getByRole('button', { name: 'Header / Menu & Logo' }).click();
  await page.getByLabel('brandPrimary', { exact: true }).fill('Unsaved header');
  await page.getByRole('button', { name: 'Save Header / Kaydi Header-ka', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Test server unavailable.');
});

test('header tabs support keyboard, mobile layout and validation in another section', async ({ page, context }) => {
  await database().connect(context);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/admin');
  await page.locator('input[type="text"]').fill('owner');
  await page.locator('input[type="password"]').fill('owner-test-password');
  await page.getByRole('button', { name: 'Login to Control Panel' }).click();
  await page.getByRole('button', { name: 'Header / Menu & Logo' }).click();
  const brand = page.getByRole('tab', { name: 'Logo & brand', exact: true });
  await brand.focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('tab', { name: 'Phone & WhatsApp', exact: true })).toBeFocused();
  await page.getByLabel('Bosaso phone', { exact: true }).fill('');
  await brand.click();
  await page.getByRole('button', { name: 'Save Header / Kaydi Header-ka', exact: true }).click();
  await expect(page.getByRole('tab', { name: 'Phone & WhatsApp', exact: true })).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('status')).toContainText('Enter the Bosaso and Dubai phone numbers.');
  await expect(page.getByRole('tabpanel')).toHaveCount(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
});
