#!/bin/bash

source './scripts/.env'

if [[ ! $(command -v wp) ]]; then
  printf "===========> Install WP CLI\n"
  curl -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar
  chmod +x wp-cli.phar
  mv wp-cli.phar /usr/local/bin/wp
fi

if [[ $NGROK_AUTH_TOKEN ]]; then
  URL="http://$NGROK_SUBDOMAIN.ngrok.io"
else
  URL="http://localhost:8000"
fi

printf "\n===========> Install WP as $URL\n"
wp core install --allow-root --url=$URL --title=NewspackE2E --admin_user=admin --admin_password=password --admin_email=newspacke2etesting@gmail.com
if [[ $WP_VERSION ]]; then
  printf "\n===========> Update WP version to $WP_VERSION\n"
  wp core update --version=$WP_VERSION --allow-root --force
fi


# check of Newspack plugin is installed, install if not
wp plugin is-installed newspack-plugin --allow-root
if [[ $? == 1 ]]; then
  printf "\n===========> Install Newspack plugin\n"
  wp plugin install https://github.com/Automattic/newspack-plugin/releases/latest/download/newspack-plugin.zip --force --allow-root --activate
fi

# check of Newspack plugin is activated, active if not
wp plugin is-active newspack-plugin --allow-root
if [[ $? == 1 ]]; then
  printf "\n===========> Activate Newspack plugin\n"
  wp plugin activate newspack-plugin --allow-root
fi

printf "\n===========> Set WP_DEBUG & WP_DEBUG_LOG\n"
wp config set WP_DEBUG true --allow-root --raw
wp config set WP_DEBUG_LOG true --allow-root --raw

printf "\n===========> Set WP_NEWSPACK_DETERMINISTIC_STARTER_CONTENT\n"
wp config set WP_NEWSPACK_DETERMINISTIC_STARTER_CONTENT 1 --allow-root

if [[ $NGROK_AUTH_TOKEN ]]; then
  if [ ! -f ./ngrok ]; then
    if [[ ! $(command -v unzip) ]]; then
      printf "\n===========> Install unzip\n"
      apt-get update
      apt-get install unzip
    fi
    printf "\n===========> Install ngrok (so there's a public URL for the site)\n"
    curl https://bin.equinox.io/c/4VmDzA7iaHb/ngrok-stable-linux-amd64.zip -o ngrok.zip
    unzip ngrok.zip
  fi

  printf "\n===========> Run ngrok\n"
  ./ngrok authtoken $NGROK_AUTH_TOKEN
  ./ngrok http 80 --subdomain="$NGROK_SUBDOMAIN" --log=stdout > ngrok.log &
else
  printf "\n===========> NO public URL\n"
  echo 'no ngrok token found, please provide it in ./scripts/.env file if a public URL is needed'
fi

printf "\n===========> Done!\n"
