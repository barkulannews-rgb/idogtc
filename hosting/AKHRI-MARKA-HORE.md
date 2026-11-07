# Ku xiridda idogtc.com

Faylashan waxaa loo diyaariyey domain-ka idogtc.com, document root: public_html.
Website-ka live-ka ah weli lama beddelin. Database-ka Sostek weli laguma tijaabin.

1. Samee backup website-ka iyo database kasta oo hore jira. Xogta admin-ka hore kuugu kaydsan browser-ka si toos ah looma guurinayo: xirmadani waxay ku bilaabataa alaabta iyo settings-ka folder-ka mashruuca ku jira. Haddii aad browser-ka wax ku beddeshay, ilaali xogtaas ka hor intaadan beddelin website-ka.
2. PHP Selector → Per Domain Settings: idogtc.com u dooro PHP 8.4. Hubi pdo_mysql inuu shidan yahay. SSL ha shaqeeyo, dabadeed cPanel Domains ka shid Force HTTPS Redirect. Adeegso https://idogtc.com; hal domain oo joogto ah ka dhig, www haddii aad isticmaasho u redirect-garee domain-kaas.
3. cPanel → Database Wizard: samee database, user iyo password adag; user-ka ku xiro database-ka oo sii ALL PRIVILEGES database-kan oo keliya. Qor magacyada buuxa, oo ay ku jiraan prefix-ka cPanel. Haddii database-ka lagu maamulo database wizard, phpMyAdmin gacanta ha uga samayn tables-ka; setup-ka ayaa sameynaya.
4. File Manager → Home: geli idogtc-config.example.php, una bixi idogtc-config.php. Faylkani waa inuu ku ag yaallaa public_html, gudaha ha gelin. Ku buuxi db_name, db_user, db_password iyo setup_token random ah oo ugu yaraan 32 xaraf ah. site_url ha ahaado https://idogtc.com. Database credentials-ka ha gelin frontend-ka ama chat-ka. Permission 0600 haddii hosting-ku oggol yahay.
5. Faylasha gudaha release/public_html geli public_html-ka hosting-ka. Ha tirtirin .well-known iyo faylasha cPanel maamulo. Hubi .htaccess, api/.htaccess iyo uploads/.htaccess inay jiraan; hadday .htaccess hore leedahay PHP handler ama sharciyo kale, marka hore backup ka qaad oo sharciyada routing-ka si taxaddar leh ugu dar. Faylka config-ga ha gelin public_html.
6. Fur https://idogtc.com/api/index.php?route=setup. Geli setup_token-ka config-ga, username-ka admin-ka cusub iyo password 12–72 xaraf ah. Badhanka ayaa sameynaya tables-ka iyo admin-ka. Setup-ku ma beddelo database kale; tables-ku waxay leeyihiin prefix ido_. Hal mar ayuu shaqeeyaa. Marka uu dhamaado ka saar setup_token config-ga. Haddii aad password-ka lumiso, database-ka ha tirtirin; waxaa loo baahan yahay reset gaar ah oo ammaan ah.
7. Fur /admin, ku gal account-kaaga cusub; login-ka demo-ga halkan ma shaqaynayo. Beddel hal alaab, ka eeg qalab kale; tijaabi refresh, sawir, dalab WhatsApp iyo newsletter. Dalabku waa inquiry/draft WhatsApp, ma aha caddayn lacag-bixin ama in fariinta WhatsApp la diray.

## Kaydinta

MySQL: ido_store wuxuu kaydiyaa qaabka xogta app-ka hadda jira (JSON) iyo revision ka hortagta laba admin inay isku tirtiraan isbeddel. ido_admins wuxuu hayaa password hash; ido_orders wuxuu hayaa dalabyada; ido_subscribers emails; ido_limits xaddidaadda codsiyada. Xog ganacsi iyo login kuma tiirsana localStorage marka xirmadan la isticmaalo. Luqadda, cart-ka iyo wishlist-ka ayaa qalabka ku sii jira.

Sawirrada cusub waxay galaan public_html/uploads, database-kuna wuxuu hayaa jidkooda. Image library entry oo la tirtiro kama tirtirayso file-ka disk-ka: alaab kale ayaa weli isticmaali karta. Backups-ka ku dar database-ka, uploads, iyo config-ga sirta ah. Subscribers-ka hadda waxaa laga arki karaa phpMyAdmin → ido_subscribers; admin UI cusub laguma darin.

Backend-ku wuxuu xaqiijiyaa session-ka admin-ka, CSRF token iyo xogta; total-ka dalabka server-ka ayaa ka xisaabiya qiimaha database-ka. Isbeddel isku mar ah oo conflict sameeya waxaa lagu tusayaa fariin refresh ah. Haddii server-ku fashilmo app-ku ma sheegayo inuu xogta ku kaydiyey browser-ka.

## Haddii cilad timaaddo

Database connection: hubi magaca/user-ka oo prefix buuxa leh, password-ka, privileges iyo pdo_mysql. Logs-ka PHP ka eeg cPanel Errors; sirta lama soo bandhigo bogga. Upload: hubi uploads inuu yahay writable, post_max_size ugu yaraan 16M iyo memory_limit ugu yaraan 128M. Sawir kasta ugu badnaan 5 MB; PNG, JPEG ama WebP.

Haddii hosting-ku u baahan yahay DB host ka duwan localhost, config-ga db_host ku beddel kan ay Sostek ku siiyaan. Rollback: soo celi backup-kii website-ka iyo database-ka; config-ga iyo uploads-ka ilaali.

PHP versions: https://www.php.net/supported-versions.php
