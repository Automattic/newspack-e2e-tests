#!/bin/bash

source './scripts/.env'

. ./scripts/install-wp-cli.sh
. ./scripts/functions.sh

URL="http://localhost:8000"
wp core install --allow-root --url=$URL --title=NewspackE2E --admin_user=admin --admin_password=password --admin_email=newspacke2etesting@gmail.com
VERSION=$(wp core version --allow-root)
if [[ $WP_VERSION && $VERSION != $WP_VERSION ]]; then
  log "Update WP version to $WP_VERSION"
  wp core update --version=$WP_VERSION --allow-root --force
else
  log "WP version is $VERSION"
fi

# Installation during E2E tests is too brittle.
log "Install and activate necessary plugins & the theme"
install_plugin newspack-plugin
install_plugin newspack-blocks
install_plugin newspack-newsletters
install_plugin newspack-popups
install_plugin jetpack
install_plugin amp
install_plugin pwa
install_plugin wordpress-seo
install_plugin google-site-kit

wp theme is-installed newspack-theme --allow-root
if [[ $? == 1 ]]; then
  wp theme install https://github.com/Automattic/newspack-theme/releases/latest/download/newspack-theme.zip --force --allow-root
fi

log "Set WP config variables"
wp config set WP_NEWSPACK_IS_E2E true --allow-root

log "Create the config file for Newspack Campaigns"
echo "
<?php
define( 'DB_USER', 'wordpress' );
define( 'DB_PASSWORD', 'wordpress' );
define( 'DB_NAME', 'wordpress' );
define( 'DB_HOST', 'db:3306' );
define( 'DB_CHARSET', 'utf8' );
define( 'DB_PREFIX', 'wp_' );
" >> wp-content/newspack-popups-config.php
