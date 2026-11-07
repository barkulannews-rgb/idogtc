import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';

export function configuration(env) {
  const host = env.IDO_SSH_HOST || '';
  const user = env.IDO_SSH_USER || '';
  const port = env.IDO_SSH_PORT || '22';
  const destination = env.IDO_DEPLOY_PATH || '';
  if (!/^[a-zA-Z0-9][a-zA-Z0-9.-]*$/.test(host)) throw new Error('Set SOSTEK_SSH_HOST to the SSH hostname or IPv4 address.');
  if (!/^[a-zA-Z0-9_][a-zA-Z0-9_-]*$/.test(user)) throw new Error('Set SOSTEK_SSH_USER to the cPanel SSH username.');
  if (!/^\d+$/.test(port) || Number(port) < 1 || Number(port) > 65535) throw new Error('Invalid SSH port.');
  // This site uses the main cPanel domain. Never accept /, /home, or a parent folder.
  if (!/^\/home\/[a-zA-Z0-9_-]+\/public_html$/.test(destination)) throw new Error('SOSTEK_DEPLOY_PATH must be the exact /home/USERNAME/public_html path.');
  if (!['true', 'false'].includes(env.IDO_DRY_RUN || 'true')) throw new Error('IDO_DRY_RUN must be true or false.');
  if (!env.IDO_SSH_PRIVATE_KEY?.trim() || !env.IDO_SSH_KNOWN_HOSTS?.trim()) throw new Error('Configure the SSH private key and verified known_hosts entry in GitHub Secrets.');
  return { host, user, port, destination, dryRun: (env.IDO_DRY_RUN || 'true') === 'true' };
}

export function transfers(source, config, transport) {
  const common = ['--archive', '--compress', '--delay-updates', '--itemize-changes', '--protect-args', '-e', transport];
  if (config.dryRun) common.push('--dry-run');
  const destination = `${config.user}@${config.host}:${config.destination}/`;
  return [
    [...common,
      '--exclude=/uploads/***', '--exclude=/.htaccess', '--exclude=/index.html',
      '--exclude=/api/seed.json', '--exclude=/api/schema.sql',
      '--exclude=**/idogtc-config.php', '--exclude=**/.env*', '--exclude=**/.git/***',
      '--include=/assets/***', '--include=/images/***', '--include=/api/***', '--include=/logo.png',
      '--exclude=*', `${source}/`, destination],
    // Publish HTML after its assets exist. Rsync writes files through temporary files.
    [...common, `${source}/index.html`, `${destination}index.html`],
  ];
}

function run(command, args) {
  const result = spawnSync(command, args, { stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} failed. Deployment stopped; existing files were not deleted.`);
}

export function deploy(env = process.env) {
  const config = configuration(env);
  if (process.platform !== 'linux') throw new Error('Run deployment on the GitHub Actions Linux runner.');
  const source = path.resolve('release/public_html');
  if (!fs.existsSync(path.join(source, 'index.html')) || !fs.existsSync(path.join(source, 'api/index.php'))) throw new Error('Database-enabled hosting build is missing.');
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'idogtc-deploy-'));
  try {
    const key = path.join(temporary, 'key'), known = path.join(temporary, 'known_hosts');
    fs.writeFileSync(key, env.IDO_SSH_PRIVATE_KEY.replace(/\r/g, '').trim() + '\n', { mode: 0o600 });
    fs.writeFileSync(known, env.IDO_SSH_KNOWN_HOSTS.replace(/\r/g, '').trim() + '\n', { mode: 0o600 });
    const ssh = ['-i', key, '-p', config.port, '-o', 'BatchMode=yes', '-o', 'IdentitiesOnly=yes', '-o', 'StrictHostKeyChecking=yes', '-o', `UserKnownHostsFile=${known}`];
    const parent = path.posix.dirname(config.destination);
    run('ssh', [...ssh, `${config.user}@${config.host}`,
      `test -d '${config.destination}' && test ! -L '${config.destination}' && test -f '${parent}/idogtc-config.php' && command -v rsync`]);
    // All remote values have been restricted above; quote local paths for rsync's SSH parser.
    const transport = ['ssh', ...ssh].map(value => "'" + value.replace(/'/g, "'\\''") + "'").join(' ');
    console.log(config.dryRun ? 'Preview only: no website files will be uploaded.' : 'Uploading application files; database, uploads and hosting configuration are preserved.');
    for (const args of transfers(source, config, transport)) run('rsync', args);
  } finally {
    fs.rmSync(temporary, { recursive: true, force: true });
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try { deploy(); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
