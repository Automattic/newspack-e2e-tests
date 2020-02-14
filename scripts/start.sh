#!/bin/bash

if [[ ! $(command -v wp) ]]; then
  printf "===========> Install WP CLI\n"
  curl -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar
  chmod +x wp-cli.phar
  mv wp-cli.phar /usr/local/bin/wp
fi

printf "\n===========> Install WP\n"
wp core install --allow-root --url=http://localhost:8000 --title=NewspackE2E --admin_user=admin --admin_password=password --admin_email=foo@bar.com

# check of Newspack plugin is installed, install if not
wp plugin is-installed newspack-plugin --allow-root
if [[ $? == 1 ]]; then
  printf "\n===========> Install Newspack plugin\n"
  wp plugin install https://github.com/Automattic/newspack-plugin/releases/latest/download/newspack-plugin.zip --force --allow-root
fi

# check of Newspack plugin is activated, active if not
wp plugin is-active newspack-plugin --allow-root
if [[ $? == 1 ]]; then
  printf "\n===========> Activate Newspack plugin\n"
  wp plugin activate newspack-plugin --allow-root
fi
