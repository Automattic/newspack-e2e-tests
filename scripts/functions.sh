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
      LATEST_PRERELEASE_TAG=$(curl -s "https://api.github.com/repos/Automattic/$PLUGIN_NAME/releases" | jq -r 'first | if .prerelease == true then .tag_name else "null" end')
      if [ "$LATEST_PRERELEASE_TAG" == "null" ]; then
        log "Last release of $PLUGIN_NAME is not a prerelease, installing latest release."
        wp plugin install https://github.com/Automattic/$PLUGIN_NAME/releases/latest/download/$PLUGIN_NAME.zip --force --allow-root
      else
        log "Installing alpha version: $PLUGIN_NAME@$LATEST_PRERELEASE_TAG"
        ALPHA_PLUGIN_NAME="$PLUGIN_NAME-$LATEST_PRERELEASE_TAG"
        wp plugin install https://github.com/Automattic/$PLUGIN_NAME/releases/download/$LATEST_PRERELEASE_TAG/$PLUGIN_NAME.zip  --force --allow-root
      fi
    else
      log "Installing $PLUGIN_NAME"
      wp plugin install $PLUGIN_NAME --force --allow-root
    fi
  fi
  wp plugin is-active $PLUGIN_NAME --allow-root
  if [[ $? == 1 ]]; then
    wp plugin activate $PLUGIN_NAME --allow-root
  fi
}
