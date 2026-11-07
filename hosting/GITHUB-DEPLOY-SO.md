# GitHub → Sostek → idogtc.com

Qaabkii hadda jira waa la sii hayaa. Database iyo setup cusub looma baahna.
Repository: https://github.com/barkulannews-rgb/idogtc

## Waxa hadda diyaarsan

Push kasta oo main ah wuxuu hubiyaa TypeScript iyo deployment tests, kadib sameeyaa database-enabled hosting build. GitHub Actions → workflow run → Artifacts → hosting-build waxaa laga soo dejisan karaa build-ka.

Dirista hosting-ka waa dansan tahay ilaa aad DEPLOY_ENABLED=true dejiso. Build-ka keliya ma beddelo website-ka live-ka ah.

## Hal mar: hosting-ka ku xir GitHub

1. cPanel → SSH Access. Xaqiiji Sostek inay account-ka u fasaxeen SSH shell iyo rsync. SSH/SFTP oo keliya, shell la'aan, kuma filna workflow-kan. Haddii aysan jirin, ha shidin DEPLOY_ENABLED; artifact-ka ZIP ahaan ayaa loo isticmaali karaa ilaa hab FTPS gaar ah la diyaariyo.
2. Samee SSH key pair gaar u ah deployment-ka. Public key-ga geli cPanel → Manage SSH Keys → Import Key → Authorize. Private key-ga geli GitHub Secret, repo ama chat ha gelin. cPanel password-ka iyo database password-ka workflow-ku uma baahna.
3. Sostek ka xaqiiji SSH hostname/IP, port, username iyo server host-key fingerprint. SOSTEK_SSH_KNOWN_HOSTS waa known_hosts line la xaqiijiyey; StrictHostKeyChecking waa shidan yahay. Ha ku beddelin "no". Haddii port-ku ka duwan yahay 22, known_hosts entry-ga waa inuu adeegsadaa [hostname]:port.
4. GitHub repository → Settings → Secrets and variables → Actions → Secrets: geli magacyadan:

| Secret | Qiimaha |
|---|---|
| SOSTEK_SSH_HOST | Hostname/IP-ga SSH ee Sostek |
| SOSTEK_SSH_USER | Username-ka cPanel/SSH |
| SOSTEK_SSH_PORT | Port-ka Sostek, inta badan 22 |
| SOSTEK_SSH_PRIVATE_KEY | Private key-ga deployment-ka, OpenSSH format, aan u baahnayn interactive passphrase |
| SOSTEK_SSH_KNOWN_HOSTS | known_hosts entry-ga server-ka ee fingerprint-kiisa la xaqiijiyey |

5. Isla meesha → Variables: SOSTEK_DEPLOY_PATH geli waddada buuxda ee document root-ka, tusaale /home/idogtcco/public_html. Ka xaqiiji File Manager; script-ku ma aqbalo Home ama waddo waalid ah. Config-ga /home/USERNAME/idogtc-config.php waa inuu hore u jiraa, sidii setup-kii hadda la sameeyey.
6. Samee backup website-ka iyo database-ka. Variables ku dar DEPLOY_ENABLED=true. Tani waxay awoodsiinaysaa automatic deployment-ka push-yada main ee xiga.
7. Marka hore Actions → Build and deploy IDO website → Run workflow → main → dry_run=true. Tani waxay hubisaa xiriirka oo keliya, waxayna muujisaa faylasha isbeddeli lahaa iyadoo aan upload la samayn. Marka preview-gu sax yahay, mar kale Run workflow → dry_run=false. Hadda website-ka eeg, kadibna admin-ka iyo qalab kale ku tijaabi.

## Markasta oo code la beddelo

VS Code: Source Control → Stage → Commit → Push/Sync. GitHub Actions ayaa build-ka diyaarinaya, kadibna code-ka cusub geynaya hosting-ka haddii DEPLOY_ENABLED=true. Wax-ka-beddelka admin-ka sida alaab iyo qiime GitHub ma maro: database-ka ayuu si toos ah ugu kaydsamaa.

Deployment-ku:

- Wuxuu diraa assets, images, API code iyo logo, kadib index.html ugu dambayn.
- Ma isticmaalo --delete. Faylasha hosting-ka ma tirtiro; assets-kii hore waxay sii jiri karaan si bog hore u furnaa u shaqeeyo.
- Ma beddelo uploads, root .htaccess, config-ga gaarka ah, seed.json ama schema.sql.
- Ma ordo setup, SQL migrations ama reset. Database-ka iyo admin-kaaga lama cusboonaysiiyo marka default data-ga code-ka la beddelo.
- Isbeddel database schema ah mustaqbalka wuxuu u baahan yahay migration gaar ah. Root .htaccess iyo uploads/.htaccess updates sidoo kale gacanta ayaa loo eegayaa.

Automatic deploy joojin: DEPLOY_ENABLED=false. Push/commit la'aan isbeddelka folder-ka computer-ka keligii kuma muuqdo website-ka.

## Haddii push-ku login dalbado

VS Code → Accounts → Sign in to GitHub, kuna gal barkulannews-rgb; kadib Source Control → Publish Branch/Push. Haddii repo-ga dibadda laga beddelay, marka hore Pull samee; ha isticmaalin force push. Password/token/private key chat-ka ha soo dirin.

Tilmaamaha rasmiga ah:
- https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/use-secrets
- https://docs.cpanel.net/cpanel/security/ssh-access/
