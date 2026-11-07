import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { Writable } from 'node:stream';
import { ftpConfiguration, uploadPlan, verifyRoot, publish, changedFiles } from '../scripts/deploy-ftps.mjs';

const env = { IDO_FTP_HOST: 'srv1101.sostectechno.com', IDO_FTP_USER: 'githubdeploy@idogtc.com', IDO_FTP_PASSWORD: 'test-only-password' };

test('FTPS requires certificate verification and previews by default', () => {
  const config = ftpConfiguration(env);
  assert.equal(config.secure, true);
  assert.equal(config.secureOptions.rejectUnauthorized, true);
  assert.equal(config.secureOptions.servername, env.IDO_FTP_HOST);
  assert.equal(config.dryRun, true);
  assert.throws(() => ftpConfiguration({ ...env, IDO_FTP_USER: 'user\r\nDELE index.html' }));
  assert.throws(() => ftpConfiguration({ ...env, IDO_FTP_PASSWORD: '' }));
});

test('upload plan excludes live data and publishes HTML last', () => {
  const base = path.resolve('.local-tests');
  fs.mkdirSync(base, { recursive: true });
  const source = fs.mkdtempSync(path.join(base, 'ftp-fixture-'));
  try {
    for (const file of ['index.html', 'logo.png', '.htaccess', 'idogtc-config.php', 'uploads/customer.png', 'api/index.php', 'api/.htaccess', 'api/seed.json', 'api/schema.sql', 'api/config.php', 'assets/app.js', 'assets/.env', 'assets/.hidden.js', 'images/logo.png']) {
      const target = path.join(source, file);
      fs.mkdirSync(path.dirname(target), { recursive: true }); fs.writeFileSync(target, 'fixture');
    }
    const files = uploadPlan(source);
    for (const excluded of ['.htaccess', 'idogtc-config.php', 'uploads/customer.png', 'api/seed.json', 'api/schema.sql', 'api/config.php', 'assets/.env', 'assets/.hidden.js']) assert.equal(files.includes(excluded), false);
    assert.ok(files.includes('api/index.php')); assert.ok(files.includes('assets/app.js'));
    assert.equal(files.at(-1), 'index.html');
  } finally {
    // The freshly created fixture is verified to be inside this workspace's test directory.
    assert.equal(path.dirname(source), base);
    fs.rmSync(source, { recursive: true, force: true });
  }
});

test('FTP root check rejects an unrelated directory', async () => {
  await assert.rejects(() => verifyRoot({ list: async () => [] }));
  const fake = {
    list: async () => [{ name: 'api', isDirectory: true }, { name: 'index.html', isFile: true }],
    downloadTo: async (stream) => { assert.ok(stream instanceof Writable); stream.end('Another website'); },
  };
  await assert.rejects(() => verifyRoot(fake), /does not appear/);
  fake.downloadTo = async stream => { stream.end('<title>IDO General Trading Company</title>'); };
  await verifyRoot(fake);
});

test('preview never creates directories, uploads or renames; real uploads rename HTML last', async () => {
  const calls = [];
  const client = {
    ensureDir: async directory => calls.push(['mkdir', directory]),
    cd: async directory => calls.push(['cd', directory]),
    uploadFrom: async (_source, temporary) => calls.push(['upload', temporary]),
    rename: async (temporary, target) => calls.push(['rename', temporary, target]),
  };
  await publish(client, '/build', ['api/index.php', 'index.html'], true);
  assert.equal(calls.length, 0);
  await publish(client, '/build', ['api/index.php', 'index.html'], false);
  assert.equal(calls.at(-1)[0], 'rename');
  assert.equal(calls.at(-1)[2], 'index.html');
  assert.ok(calls.find(call => call[0] === 'upload')[1].endsWith('.php'));
});

test('static content is skipped only when actual bytes match, and PHP is always uploaded', async () => {
  const root = path.resolve('.local-tests'); fs.mkdirSync(root, { recursive: true });
  const source = fs.mkdtempSync(path.join(root, 'ftp-hashes-'));
  try {
    for (const name of ['images/same.jpg', 'images/changed.jpg', 'images/missing.jpg', 'api/index.php', 'index.html']) {
      fs.mkdirSync(path.dirname(path.join(source, name)), { recursive: true }); fs.writeFileSync(path.join(source, name), 'local-file');
    }
    const result = await changedFiles(source, ['images/same.jpg', 'images/changed.jpg', 'images/missing.jpg', 'api/index.php', 'index.html'], async url =>
      url.endsWith('same.jpg') ? new Response('local-file', { headers: { 'content-type': 'image/jpeg' } }) :
        url.endsWith('missing.jpg') ? new Response('local-file', { headers: { 'content-type': 'text/html' } }) : new Response('other-file'));
    assert.deepEqual(result, ['images/changed.jpg', 'images/missing.jpg', 'api/index.php', 'index.html']);
  } finally { assert.equal(path.dirname(source), root); fs.rmSync(source, { recursive: true, force: true }); }
});
