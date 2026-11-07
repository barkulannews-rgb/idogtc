import { test } from 'node:test';
import assert from 'node:assert/strict';
import { configuration, transfers } from '../scripts/deploy-hosting.mjs';

const env = {
  IDO_SSH_HOST: 'hosting.example.com', IDO_SSH_USER: 'idogtcco',
  IDO_DEPLOY_PATH: '/home/idogtcco/public_html',
  IDO_SSH_PRIVATE_KEY: 'test-only-key', IDO_SSH_KNOWN_HOSTS: 'test-only-host-entry',
};

test('deployment defaults to a preview and refuses parent directories or shell input', () => {
  assert.equal(configuration(env).dryRun, true);
  for (const destination of ['/', '/home', '/home/idogtcco', '/home/idogtcco/public_html/../', '/home/idogtcco/public_html;id']) {
    assert.throws(() => configuration({ ...env, IDO_DEPLOY_PATH: destination }));
  }
  assert.throws(() => configuration({ ...env, IDO_SSH_HOST: 'host;id' }));
  assert.throws(() => configuration({ ...env, IDO_SSH_PORT: '70000' }));
  assert.throws(() => configuration({ ...env, IDO_SSH_KNOWN_HOSTS: '' }));
});

test('routine updates preserve production data and publish HTML last', () => {
  const commands = transfers('/build/public_html', configuration({ ...env, IDO_DRY_RUN: 'false' }), 'ssh');
  assert.equal(commands.length, 2);
  for (const args of commands) {
    assert.equal(args.some(value => value.startsWith('--delete')), false);
    assert.equal(args.includes('--dry-run'), false);
  }
  for (const excluded of ['/uploads/***', '/.htaccess', '/api/seed.json', '/api/schema.sql', '**/idogtc-config.php']) {
    assert.ok(commands[0].includes(`--exclude=${excluded}`));
  }
  assert.equal(commands[1].at(-2), '/build/public_html/index.html');
  assert.equal(commands[1].at(-1), 'idogtcco@hosting.example.com:/home/idogtcco/public_html/index.html');
});

test('preview uses dry-run for both assets and HTML', () => {
  for (const args of transfers('/build/public_html', configuration(env), 'ssh')) assert.ok(args.includes('--dry-run'));
});
