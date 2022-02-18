#!/bin/bash

source './scripts/.env'

. ./scripts/functions.sh

if [[ ! $(command -v mkcert) ]]; then
  log "Installing mkcert"
  apt-get update && apt install -y wget libnss3-tools

  LATEST_RELEASE_DOWNLOAD_URL=$(curl -s "https://api.github.com/repos/FiloSottile/mkcert/releases" | jq -r 'first | .assets[] | select(.name | contains("linux-amd64")) | .browser_download_url')
  printf "$LATEST_RELEASE_DOWNLOAD_URL"

  wget "$LATEST_RELEASE_DOWNLOAD_URL"
  mv mkcert-v*-linux-amd64 mkcert
  chmod a+x mkcert
  mv mkcert /usr/local/bin/
fi

CERTS_DIR="/etc/ssl/certs"
if [[ -v CI ]]; then
  CERTS_DIR="./docker/certs"
fi

if [ -f "$CERTS_DIR/localhost.pem" ]; then
  log "Found SSL certificate in $CERTS_DIR"
else
  log "Creating SSL certificate in $CERTS_DIR…"

  # Create certificate for localhost.
  mkcert -install
  mkcert localhost

  mkdir -p $CERTS_DIR
  mv localhost.pem "$CERTS_DIR/localhost.pem"
  mv localhost-key.pem "$CERTS_DIR/localhost-key.pem"
fi
