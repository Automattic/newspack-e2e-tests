#!/bin/bash

source './scripts/.env'

if [[ ! $(command -v wp) ]]; then
  printf "===========> Install WP CLI\n"
  curl -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar
  chmod +x wp-cli.phar
  mv wp-cli.phar /usr/local/bin/wp
fi

URL="http://localhost:8000"
wp core install --allow-root --url=$URL --title=NewspackE2E --admin_user=admin --admin_password=password --admin_email=newspacke2etesting@gmail.com
VERSION=$(wp core version --allow-root)
if [[ $WP_VERSION && $VERSION != $WP_VERSION ]]; then
  printf "\n===========> Update WP version to $WP_VERSION\n"
  wp core update --version=$WP_VERSION --allow-root --force
else
  printf "\n===========> WP version is $VERSION\n"
fi

printf "\n===========> Install & activate latest version of Newspack plugin\n"
wp plugin install https://github.com/Automattic/newspack-plugin/releases/latest/download/newspack-plugin.zip --force --activate --allow-root
