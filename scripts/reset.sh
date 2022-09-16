#!/bin/bash

. ./scripts/functions.sh

if [[ ! $(command -v mysql) ]]; then
  log "Installing mysql client"
  apt-get update && apt-get install -y default-mysql-client
fi

log "Resetting the DB"
wp db clean --yes --allow-root

log "Remove plugins & themes"
rm -rf ./wp-content/plugins/*
rm -rf ./wp-content/themes/*

log "Re-running setup script "
./scripts/setup.sh
