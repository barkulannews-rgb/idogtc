import fs from 'node:fs';
import path from 'node:path';
import { Writable } from 'node:stream';
import { randomUUID } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { Client } from 'basic-ftp';

export function ftpConfiguration(env) {
  const host = env.IDO_FTP_HOST || '';
  const user = env.IDO_FTP_USER || '';
  const port = Number(env.IDO_FTP_PORT || '21');
  if (!/^[a-zA-Z0-9][a-zA-Z0-9.-]*$/.test(host)) throw new Error('Set the FTPS server hostname.');
  if (!user || /[\r\n]/.test(user)) throw new Error('Set the full FTP account username.');
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid FTPS port.');
  if (!env.IDO_FTP_PASSWORD || /[\r\n]/.test(env.IDO_FTP_PASSWORD)) throw new Error('Add SOSTEK_FTP_PASSWORD to GitHub Actions Secrets.');
  if (!['true', 'false'].includes(env.IDO_DRY_RUN || 'true')) throw new Error('IDO_DRY_RUN must be true or false.');
  return { host, port, user, password: env.IDO_FTP_PASSWORD, secure: true,
    secureOptions: { servername: host, minVersion: 'TLSv1.2', rejectUnauthorized: true },
    dryRun: (env.IDO_DRY_RUN || 'true') === 'true' };
}

export function uploadPlan(source) {
  const files = [];
  function visit(relative) {
    const absolute = path.join(source, relative);
    const info = fs.lstatSync(absolute);
    if (info.isSymbolicLink()) throw new Error('Symlinks are not allowed in the deployment build.');
    if (info.isDirectory()) {
      for (const name of fs.readdirSync(absolute).sort()) visit(relative ? `${relative}/${name}` : name);
    } else if (info.isFile()) {
      const hidden = relative.split('/').some(segment => segment.startsWith('.'));
      if (relative === 'api/.htaccess' || relative === 'api/index.php' ||
        (!hidden && /^(assets|images)\/[^\r\n]+\.(js|css|png|jpe?g|webp|svg|gif|ico|woff2?|ttf|map)$/.test(relative))) files.push(relative);
    }
  }
  for (const directory of ['assets', 'images', 'api']) visit(directory);
  for (const file of ['logo.png', 'index.html']) {
    const info = fs.lstatSync(path.join(source, file));
    if (!info.isFile() || info.isSymbolicLink()) throw new Error('Build is missing a required regular file.');
  }
  if (!files.includes('api/index.php')) throw new Error('Database-enabled API is missing from the build.');
  return [...files, 'logo.png', 'index.html'];
}

export async function verifyRoot(client) {
  const entries = await client.list();
  if (!entries.some(item => item.name === 'api' && item.isDirectory) ||
      !entries.some(item => item.name === 'index.html' && item.isFile)) throw new Error('FTP account must open directly inside the existing public_html website.');
  const chunks = [];
  let size = 0;
  const stream = new Writable({ write(chunk, _encoding, callback) {
    size += chunk.length;
    if (size > 131072) return callback(new Error('Unexpected remote index.html size.'));
    chunks.push(chunk); callback();
  } });
  await client.downloadTo(stream, 'index.html');
  if (!Buffer.concat(chunks).toString('utf8').includes('IDO General Trading Company')) throw new Error('The FTP directory does not appear to be the IDO website.');
}

export async function publish(client, source, files, dryRun) {
  const directories = new Set(['.']);
  const runId = randomUUID();
  for (const file of files) {
    if (dryRun) { console.log(`Would upload: ${file}`); continue; }
    const directory = path.posix.dirname(file);
    if (!directories.has(directory)) {
      await client.ensureDir(directory);
      await client.cd('/');
      directories.add(directory);
    }
    // Preserve the extension so PHP source is never exposed as a plaintext .tmp file.
    const temporary = path.posix.join(directory, `.idogtc-${runId}-${path.posix.basename(file)}`);
    await client.uploadFrom(path.join(source, file), temporary);
    await client.rename(temporary, file);
    console.log(`Uploaded: ${file}`);
  }
}

export async function deployFtps(env = process.env) {
  const config = ftpConfiguration(env);
  const source = path.resolve('release/public_html');
  const files = uploadPlan(source);
  const client = new Client(30000);
  // Protocol debug logging must remain off: it can expose FTP credentials.
  client.ftp.verbose = false;
  try {
    await client.access(config);
    await client.cd('/');
    await verifyRoot(client);
    console.log(config.dryRun ? 'FTPS verified. Preview only; no remote files will be changed.' : 'FTPS verified. Uploading application files; production data is preserved.');
    await publish(client, source, files, config.dryRun);
  } finally { client.close(); }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  deployFtps().catch(error => {
    // Mask the password if a server happens to echo it in an error message.
    const message = String(error.message).split(process.env.IDO_FTP_PASSWORD || '\0').join('[redacted]');
    console.error(message); process.exitCode = 1;
  });
}
