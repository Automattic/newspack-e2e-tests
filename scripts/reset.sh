#!/bin/bash

if [[ ! $(command -v mysql) ]]; then
  printf "===========> Install mysql client\n"
  apt-get update && apt-get install -y default-mysql-client
fi

if [[ $1 == 'plugins' ]]; then
  printf "\n===========> Remove all plugins\n"
  rm -rf wp-content/plugins/*
fi

printf "===========> Reset DB\n"
wp db clean --yes --allow-root

printf "===========> Re-run start script \n"
./scripts/start.sh
