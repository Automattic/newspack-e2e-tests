#!/bin/bash

source './scripts/.env'

. ./scripts/install-wp-cli.sh
. ./scripts/functions.sh

# Unless on CI, set up SSL.
if [[ -z "$CI" ]]; then
  . ./scripts/ssl.sh
fi

URL="https://localhost"
log "Site URL: $URL"
wp core install --allow-root --url=$URL --title=NewspackE2E --admin_user=admin --admin_password=password --admin_email=newspacke2etesting@gmail.com
VERSION=$(wp core version --allow-root)
if [[ $WP_VERSION && $VERSION != $WP_VERSION ]]; then
  log "Update WP version to $WP_VERSION"
  wp core update --version=$WP_VERSION --allow-root --force
else
  log "WP version is $VERSION"
fi

TEST_CHANNEL="${TEST_CHANNEL:-stable}"

log "Test channel is: $TEST_CHANNEL"

# Installation during E2E tests is too brittle.
log "Installing and activating necessary plugins & the theme"
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

# DB host locally is db:3306, but on CircleCI it's 127.0.0.1
DB_HOST='db:3306'
if [[ -v CI ]]; then
  DB_HOST='127.0.0.1'
fi

log "Create the config file for Newspack Campaigns"
echo "<?php
define( 'DB_USER', 'wordpress' );
define( 'DB_PASSWORD', 'wordpress' );
define( 'DB_NAME', 'wordpress' );
define( 'DB_HOST', '$DB_HOST' );
" > wp-content/newspack-popups-config.php

log "Set up SSL"
if [[ -v CI ]]; then
  # on CI, where built-in PHP server is used, HTTPS has to be forced in this way to prevent
  # a redirect loop on /wp-admin.
  # https://wordpress.org/support/article/administration-over-ssl/#using-a-reverse-proxy
  # https://stackoverflow.com/a/31604002/3772847
  wp config set FORCE_SSL_ADMIN true --allow-root
  # add `$_SERVER['HTTPS']='on';` right after the line defining `FORCE_SSL_ADMIN`:
  awk '1;/WP_DEBUG/{print "$_SERVER[\"HTTPS\"]=\"on\";"}' wp-config.php > wp-config-new.php && mv wp-config-new.php wp-config.php
else
  # Locally, SSL for wp-admin is already configured by the Docker image.
  # SSL has to be turned on for the Apache server.
  a2enmod ssl && a2ensite default-ssl.conf
  service apache2 reload
fi
