#!/bin/bash

if [[ ! $(command -v wp) ]]; then
  printf "===========> Install WP CLI\n"
  curl -O https://raw.githubusercontent.com/wp-cli/builds/gh-pages/phar/wp-cli.phar
  chmod +x wp-cli.phar
  mv wp-cli.phar /usr/local/bin/wp
fi
