#!/bin/bash

if [[ ! $(command -v jq) ]]; then
  printf "===========> Install jq\n"
  apt-get update && apt-get install -y jq
fi

# Nice logging with color and timestamp.
function log(){
  TYPE=${2:-ok}
  TIMESTAMP=$(date +"%H:%M:%S")
  COLOR="32m" # green
  if [[ $TYPE == "error" ]]; then
    COLOR="31m" # red
  fi
  if [[ $TYPE == "warning" ]]; then
    COLOR="33m" # orange
  fi
  printf "\x1B[01;$COLOR[$TIMESTAMP] $1\x1B[0m\n"
}

function install_plugin() {
  PLUGIN_NAME=$1
  wp plugin is-installed $PLUGIN_NAME --allow-root
  if [[ $? == 1 ]]; then
    if [[ "$PLUGIN_NAME" =~ ^newspack-* ]]; then
      log "Installing Newspack plugin: $PLUGIN_NAME"
      wp plugin install https://github.com/Automattic/$PLUGIN_NAME/releases/latest/download/$PLUGIN_NAME.zip --force --allow-root
    else
      log "Installing $PLUGIN_NAME"
      wp plugin install $PLUGIN_NAME --force --allow-root
    fi
  fi
  wp plugin activate $PLUGIN_NAME --allow-root
}
