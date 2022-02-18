#!/bin/bash

. ./scripts/functions.sh

if [[ ! $(command -v mysql) ]]; then
  log "Install mysql client"
  apt-get update && apt-get install -y default-mysql-client
fi

log "Reset DB"
wp db clean --yes --allow-root

log "Re-run setup script "
./scripts/setup.sh
