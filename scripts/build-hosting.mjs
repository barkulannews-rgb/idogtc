import fs from 'node:fs';
import vm from 'node:vm';
import { spawnSync } from 'node:child_process';
import { transformSync } from 'esbuild';

const compiled = transformSync(fs.readFileSync('src/data/storeDefaults.ts', 'utf8'), { loader: 'ts', format: 'cjs' });
const module = { exports: {} };
vm.runInNewContext(compiled.code, { module, exports: module.exports });
const { DEFAULT_STATE } = module.exports;
const result = spawnSync(process.execPath, ['node_modules/vite/bin/vite.js', 'build', '--outDir', 'release/public_html'], {
  env: { ...process.env, VITE_API_BASE: '/api/index.php' }, stdio: 'inherit',
});
if (result.status !== 0) process.exit(result.status || 1);
fs.cpSync('hosting/api', 'release/public_html/api', { recursive: true });
fs.cpSync('hosting/uploads', 'release/public_html/uploads', { recursive: true });
fs.writeFileSync('release/public_html/api/seed.json', JSON.stringify(DEFAULT_STATE, null, 2));
fs.copyFileSync('hosting/idogtc-config.example.php', 'release/idogtc-config.example.php');
fs.copyFileSync('hosting/AKHRI-MARKA-HORE.md', 'release/AKHRI-MARKA-HORE.md');
console.log('Hosting files ready in release/. Database credentials are not included.');
