#!/bin/bash

source './scripts/.env'

./scripts/install-wp-cli.sh

URL="http://localhost:8000"
wp core install --allow-root --url=$URL --title=NewspackE2E --admin_user=admin --admin_password=password --admin_email=newspacke2etesting@gmail.com
VERSION=$(wp core version --allow-root)
if [[ $WP_VERSION && $VERSION != $WP_VERSION ]]; then
  printf "\n===========> Update WP version to $WP_VERSION\n"
  wp core update --version=$WP_VERSION --allow-root --force
else
  printf "\n===========> WP version is $VERSION\n"
fi

wp plugin is-installed newspack-plugin --allow-root
if [[ $? == 1 ]]; then
  printf "\n===========> Install latest version of Newspack suite\n"
  # Installation during E2E tests is too brittle.
  wp plugin install https://github.com/Automattic/newspack-plugin/releases/latest/download/newspack-plugin.zip --force --allow-root
  wp plugin install https://github.com/Automattic/newspack-blocks/releases/latest/download/newspack-blocks.zip --force --allow-root
  wp plugin install https://github.com/Automattic/newspack-newsletters/releases/latest/download/newspack-newsletters.zip --force --allow-root
  wp theme install https://github.com/Automattic/newspack-theme/releases/latest/download/newspack-theme.zip --force --allow-root
  wp plugin install jetpack --allow-root
  wp plugin install amp --allow-root
  wp plugin install pwa --allow-root
  wp plugin install wordpress-seo --allow-root
  wp plugin install google-site-kit --allow-root
fi

wp plugin activate newspack-plugin --allow-root
wp plugin activate newspack-blocks --allow-root
wp plugin activate newspack-newsletters --allow-root
wp theme activate newspack-theme --allow-root
wp plugin activate jetpack --allow-root
wp plugin activate amp --allow-root
wp plugin activate pwa --allow-root
wp plugin activate wordpress-seo --allow-root
wp plugin activate google-site-kit --allow-root

printf "\n===========> Set WP config variables\n"
wp config set WP_NEWSPACK_IS_E2E true --allow-root
