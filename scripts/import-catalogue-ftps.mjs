import fs from 'node:fs';
import { Readable } from 'node:stream';
import { randomBytes, randomUUID, createHash } from 'node:crypto';
import { Client } from 'basic-ftp';
import { ftpConfiguration, verifyRoot } from './deploy-ftps.mjs';

const config = ftpConfiguration(process.env);
if (config.dryRun) throw new Error('Catalogue import must be explicitly requested with dry_run=false.');
const data = fs.readFileSync('catalogue/idogtc-catalogue-2026-11.json');
const manifest = JSON.parse(data);
if (manifest.products.length !== 246 || new Set(manifest.products.map(p => p.sku)).size !== 246) throw new Error('Catalogue item codes are invalid.');
const token = randomBytes(32).toString('hex');
let code = `define('IDO_IMPORT_TOKEN_HASH', '${createHash('sha256').update(token).digest('hex')}');\ndefine('IDO_IMPORT_EXPIRES', ${Math.floor(Date.now() / 1000) + 900});\ndefine('IDO_CATALOGUE_DATA', '${data.toString('base64')}');`;
if (process.env.IDO_CATALOGUE_IMAGES === 'true') {
  const images = fs.readFileSync('catalogue/product-images.json');
  const mapping = JSON.parse(images);
  for (const [sku, image] of Object.entries(mapping)) {
    if (!manifest.products.some(product => product.sku === sku) || image !== `/images/products/${sku}.jpg`) throw new Error('Invalid generated image map.');
  }
  code += `\ndefine('IDO_CATALOGUE_IMAGE_DATA', '${images.toString('base64')}');`;
}
const php = fs.readFileSync('hosting/catalogue-import.php', 'utf8').replace('/* IDO_CATALOGUE_CONFIG */', code);
const remote = `api/catalogue-import-${randomUUID()}.php`;
const client = new Client(30000);
client.ftp.verbose = false;
let installed = false;
try {
  await client.access(config);
  await client.cd('/');
  await verifyRoot(client);
  await client.uploadFrom(Readable.from([php]), remote);
  installed = true;
  const response = await fetch(`https://idogtc.com/${remote}`, {
    method: 'POST', headers: { 'X-IDO-Import-Token': token }, redirect: 'error', signal: AbortSignal.timeout(90000),
  });
  const result = await response.json();
  if (!response.ok || result.added + result.skipped !== 246) throw new Error(result.error || 'Catalogue import did not complete.');
  console.log(JSON.stringify(result));
} finally {
  if (installed) {
    // Remove only the exact temporary maintenance script created by this run.
    try {
      if (client.closed) await client.access(config);
      await client.cd('/'); await client.remove(remote);
      console.log('Temporary import endpoint removed.');
    } catch { console.error('Temporary import endpoint cleanup failed; its authorization expires after 15 minutes.'); process.exitCode = 1; }
  }
  client.close();
}
