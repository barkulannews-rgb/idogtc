import { test, expect, BrowserContext } from '@playwright/test';
import fs from 'node:fs';

function database() {
  let snapshot = { state: JSON.parse(fs.readFileSync('release/public_html/api/seed.json', 'utf8')), revision: 1 };
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
