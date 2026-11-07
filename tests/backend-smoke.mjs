// Run against an isolated local PHP server and a fresh ido_test database only.
// No production credentials or hosting access are used.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';

const base = process.env.IDO_TEST_API || 'http://127.0.0.1:4180/api/index.php';
function client() {
  let cookie = '', csrf = '';
  return async (route, method = 'GET', body, extra = {}) => {
    const response = await fetch(`${base}?route=${route}`, {
      method,
      headers: { 'Content-Type': 'application/json', Cookie: cookie, 'X-CSRF-Token': csrf, ...extra },
      body: body === undefined ? undefined : typeof body === 'string' ? body : JSON.stringify(body),
    });
    const setCookie = response.headers.get('set-cookie');
    if (setCookie) cookie = setCookie.split(';')[0];
    const value = await response.json();
    if (value.csrf) csrf = value.csrf;
    return { status: response.status, value, headers: response.headers };
  };
}

test('PHP + MariaDB API integration', async t => {
  const visitor = client(), admin = client();
  let snapshot, orderId;
  await t.test('setup requires the secret', async () => {
    const result = await visitor('setup', 'POST', 'token=wrong', { 'Content-Type': 'application/x-www-form-urlencoded' });
    assert.equal(result.status, 403);
  });
  await t.test('setup seeds products and creates a real admin', async () => {
    const form = new URLSearchParams({ token: 'local-test-setup-secret-32-characters-long', username: 'owner', password: 'Testing-only-Password42!' });
    const result = await visitor('setup', 'POST', form.toString(), { 'Content-Type': 'application/x-www-form-urlencoded' });
    assert.equal(result.status, 200, JSON.stringify(result.value));
    snapshot = (await visitor('store')).value;
    assert.equal(snapshot.state.products.length, 14);
  });
  await t.test('setup cannot overwrite an existing admin', async () => {
    const result = await visitor('setup', 'POST', new URLSearchParams({ token: 'local-test-setup-secret-32-characters-long', username: 'other', password: 'Another-Test-Password42!' }).toString(), { 'Content-Type': 'application/x-www-form-urlencoded' });
    assert.equal(result.status, 409);
  });
  await t.test('public users cannot read orders or write catalog data', async () => {
    await visitor('session');
    assert.equal((await visitor('orders')).status, 401);
    assert.equal((await visitor('store', 'PUT', snapshot)).status, 401);
  });
  await t.test('login rejects demo credentials and checks CSRF and origin', async () => {
    await admin('session');
    assert.equal((await admin('login', 'POST', { username: 'admin', password: 'admin123' })).status, 401);
    assert.equal((await admin('login', 'POST', {}, { 'X-CSRF-Token': 'wrong' })).status, 403);
    assert.equal((await admin('login', 'POST', {}, { Origin: 'https://other.invalid' })).status, 403);
    const result = await admin('login', 'POST', { username: 'owner', password: 'Testing-only-Password42!' });
    assert.equal(result.status, 200);
    assert.equal((await admin('session')).value.authenticated, true);
    assert.match(result.headers.get('set-cookie'), /secure/i);
    assert.match(result.headers.get('set-cookie'), /httponly/i);
  });
  await t.test('a saved product is visible to a separate visitor', async () => {
    const changed = structuredClone(snapshot);
    changed.state.products[0].name = 'Server-saved rice';
    const saved = await admin('store', 'PUT', changed);
    assert.equal(saved.status, 200, JSON.stringify(saved.value));
    assert.equal(saved.value.revision, snapshot.revision + 1);
    assert.equal((await visitor('store')).value.state.products[0].name, 'Server-saved rice');
    const conflict = await admin('store', 'PUT', snapshot);
    assert.equal(conflict.status, 409);
    snapshot = saved.value;
  });
  await t.test('invalid data is rejected without modifying the store', async () => {
    const invalid = structuredClone(snapshot);
    invalid.state.products[0].numericPrice = -1;
    assert.equal((await admin('store', 'PUT', invalid)).status, 400);
    assert.equal((await visitor('store')).value.revision, snapshot.revision);
  });
  await t.test('header settings persist without replacing store content and unsafe links are rejected', async () => {
    const changed = structuredClone(snapshot);
    changed.state.companySettings.header = {
      image: '/logo.png', logoAlt: 'New company logo', brandPrimary: 'New brand', brandSecondary: 'GTC',
      tagline: { en: 'Trade partner', so: 'Ganacsi' }, whatsappPhone: '+971 50 123 4567', customerServicePhone: '',
      whatsappMessage: { en: 'Please send a quote', so: '' },
      labels: Object.fromEntries(['bosaso','dubai','customerService','search','categories','allCategories','whatsapp','wishlist','cart'].map(key => [key, { en: key, so: '' }])),
      visibility: Object.fromEntries(['topBar','logo','brand','tagline','search','customerService','categories','whatsapp','currency','language','wishlist','cart'].map(key => [key, true])),
      topLinks: [], navigation: [{ id: 'contact', label: { en: 'Talk to us', so: '' }, target: 'contact', visible: true }],
    };
    const result = await admin('store', 'PUT', changed);
    assert.equal(result.status, 200, JSON.stringify(result.value));
    const visible = (await visitor('store')).value;
    assert.equal(visible.state.companySettings.header.brandPrimary, 'New brand');
    assert.deepEqual(visible.state.products, snapshot.state.products);
    const invalid = structuredClone(result.value);
    invalid.state.companySettings.header.navigation[0].target = 'javascript:alert(1)';
    assert.equal((await admin('store', 'PUT', invalid)).status, 400);
    snapshot = result.value;
  });
  await t.test('valid images become real upload files and SVG data is rejected', async () => {
    const changed = structuredClone(snapshot);
    changed.state.products[0].image = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aZ1cAAAAASUVORK5CYII=';
    changed.state.companySettings.header.image = changed.state.products[0].image;
    const saved = await admin('store', 'PUT', changed);
    assert.equal(saved.status, 200, JSON.stringify(saved.value));
    assert.match(saved.value.state.products[0].image, /^\/uploads\/[a-f0-9]+\.png$/);
    assert.equal(saved.value.state.companySettings.header.image, saved.value.state.products[0].image);
    const image = await fetch(new URL(saved.value.state.products[0].image, base));
    assert.equal(image.status, 200);
    const invalid = structuredClone(saved.value);
    invalid.state.products[0].image = 'data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=';
    assert.equal((await admin('store', 'PUT', invalid)).status, 400);
    snapshot = saved.value;
  });
  await t.test('order totals come from database prices and repeated requests do not duplicate', async () => {
    const product = snapshot.state.products[0];
    const request = { items: [{ productId: product.id, quantity: 3 }], totalAmount: 0.01, revision: snapshot.revision, requestId: randomUUID() };
    const result = await visitor('orders', 'POST', request);
    assert.equal(result.status, 201, JSON.stringify(result.value));
    assert.equal(result.value.order.totalAmount, product.numericPrice * 3);
    const repeated = await visitor('orders', 'POST', request);
    assert.equal(repeated.value.order.id, result.value.order.id);
    const orders = (await admin('orders')).value.orders;
    assert.equal(orders.length, 1);
    orderId = orders[0].id;
    assert.equal((await visitor('orders', 'POST', { ...request, revision: snapshot.revision - 1, requestId: randomUUID() })).status, 409);
  });
  await t.test('order status persists and subscriber emails are validated', async () => {
    const result = await admin('orders', 'PATCH', { id: orderId, status: 'Contacted' });
    assert.equal(result.status, 200);
    assert.equal((await admin('orders')).value.orders[0].status, 'Contacted');
    assert.equal((await visitor('subscribe', 'POST', { email: 'invalid' })).status, 400);
    assert.equal((await visitor('subscribe', 'POST', { email: 'customer@example.com' })).status, 200);
  });
  await t.test('logout revokes server access', async () => {
    assert.equal((await admin('logout', 'POST', {})).status, 200);
    assert.equal((await admin('orders')).status, 401);
    assert.equal((await admin('store', 'PUT', snapshot)).status, 401);
  });
});
