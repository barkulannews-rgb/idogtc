# IDO General Trading Company

React + TypeScript storefront and admin panel. The existing layout, languages and WhatsApp inquiry flow are preserved.

## Local development

Use Node.js 22.12+ or 24. Run `npm ci`, then `npm run dev`.
Without `VITE_API_BASE`, the app uses browser storage and a demo admin login. This mode is for local previews, not a shared business database.

## cPanel / Sostek

Run `npm run build:hosting`. This produces `release/public_html`, a private configuration template and Somali setup instructions.
The package uses the same React app with a PHP API, MySQL/MariaDB, server sessions and disk image uploads. The database stores the existing content structure as a versioned JSON document, with separate tables for admins, orders, subscribers and request limits. Stale writes are rejected instead of silently overwriting another administrator's changes.

Read [hosting/AKHRI-MARKA-HORE.md](hosting/AKHRI-MARKA-HORE.md) before uploading. Hosting requires PHP 8.2+ (8.4 recommended), PDO MySQL and HTTPS. Keep `idogtc-config.php` outside `public_html`. Setup creates a real admin; demo credentials cannot authorize API writes. Existing browser edits are not automatically imported.

`npm run build` still produces a static browser-storage preview in `dist`; use `build:hosting` for the database deployment.

Header content is managed at `/admin` → **Header / Menu & Logo**: logo, brand text, bilingual menu labels and destinations, link ordering/visibility, office and service phones, and the WhatsApp quote number/message. Header settings are stored inside the existing company settings; older databases keep the original defaults until an administrator saves changes. No schema migration or setup rerun is needed.

## GitHub deployment

Repository: https://github.com/barkulannews-rgb/idogtc

The Actions workflow builds the hosting bundle on pushes and pull requests. Set `DEPLOY_METHOD=ftps` to use the dedicated FTP account rooted at `public_html`; explicit FTPS is required and TLS certificate verification stays enabled. Automatic uploads remain disabled until `DEPLOY_ENABLED=true`; a manual dry-run can test the connection first. An SSH alternative remains available. Routine deployments preserve the database, uploads, private config, hosting `.htaccess`, seed and SQL schema. Read [the Somali connection guide](hosting/GITHUB-DEPLOY-SO.md) for the one-time setup and dry-run instructions.

## Verification

- `npm run lint` checks TypeScript.
- `npm run build` and `npm run build:hosting` validate both bundles.
- `npm test` runs the browser-storage regression tests. Install a Playwright browser, or set `PLAYWRIGHT_CHANNEL=chrome` when Chrome is installed.
- To test database-mode UI, serve `release/public_html` on port 4173 and run Playwright with `IDO_DATABASE_TEST=1`. These UI tests mock the API.
- `node --test tests/backend-smoke.mjs` tests the real PHP API against a fresh, isolated `ido_test` database and a local PHP server on port 4180. Never run this setup test against production.

Local backend test configuration: db_host=127.0.0.1, db_port=3309, db_name=ido_test, test-only root account, setup_token=local-test-setup-secret-32-characters-long, site_url=https://idogtc.com. Configure a writable local PHP session directory. Keep the test config outside the test document root. Production credentials are never required for local tests.
