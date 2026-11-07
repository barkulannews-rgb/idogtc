<?php
// Copy to the HOME folder beside public_html as idogtc-config.php.
// Never place database credentials inside public_html or frontend .env files.
return [
    'db_host' => 'localhost',
    'db_port' => 3306,
    'db_name' => 'idogtcco_idogtcco',
    'db_user' => 'idogtcco_idogtcco',
    'db_password' => 'REPLACE_WITH_DATABASE_PASSWORD',
    // Choose a random secret of at least 32 characters for the one-time setup.
    'setup_token' => 'REPLACE_WITH_RANDOM_SETUP_SECRET',
    'site_url' => 'https://idogtc.com',
];
