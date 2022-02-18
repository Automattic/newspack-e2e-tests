#!/bin/bash

. ./scripts/functions.sh

if [[ ! $(command -v wp) ]]; then
  log "Install WP CLI"
  curl -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar
  chmod +x wp-cli.phar
  mv wp-cli.phar /usr/local/bin/wp
fi
