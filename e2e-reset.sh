#!/bin/bash

# This is a script to reset the Newspack E2E test environment.
# You probably don't need to run this often because you can use snapshots,
# but it's here in case you need to reset the environment for some reason.
# Put keys for stripe in .env file (see the "Setting up Stripe" section in this file).

if [ -f .env ]; then
  set -o allexport
  source .env
  set +o allexport
  echo "Loaded configuration from .env file"
else
  echo "No .env file found, using default values"
fi

echo ""
echo "Activating Newspack plugins"
wp --allow-root --skip-plugins --skip-themes plugin activate newspack-plugin newspack-blocks newspack-popups newspack-ads newspack-newsletters newspack-manager

echo ""
echo "Setting up Newspack"
wp --allow-root --skip-themes option update timezone_string 'America/New_York'
wp --allow-root --skip-plugins --skip-themes config set NEWSPACK_IS_E2E true --raw
# Note that this feature flag will be removed in the future.
wp --allow-root --skip-plugins --skip-themes config set NEWSPACK_EMAIL_CHANGE_ENABLED true --raw
wp --allow-root --skip-themes newspack setup

echo ""
echo "Activating the E2E plugin"
wp --allow-root --skip-plugins --skip-themes plugin activate e2e-plugin

echo ""
echo "Enabling RAS"
wp --allow-root --skip-plugins --skip-themes option set newspack_reader_activation_enabled 1

echo ""
echo "Enabling email address updates feature flag"
wp --allow-root --skip-plugins --skip-themes config set NEWSPACK_EMAIL_CHANGE_ENABLED true

echo ""
echo "Selective resetting for E2E tests…"

echo ""
echo "Removing saved emails…"
wp --allow-root --skip-plugins --skip-themes post delete "$(wp --allow-root --skip-plugins --skip-themes post list --post_type=email_log --format=ids)" --force || true

echo ""
echo "Removing test users…"
wp --allow-root --skip-plugins --skip-themes user delete "$(wp --allow-root --skip-plugins --skip-themes user list --field=ID | grep -v 1)" --yes || true

echo ""
echo "Setting the site title…"
wp --allow-root --skip-plugins --skip-themes option update blogname "The Daily Test: $(date -u '+%Y-%m-%d %H:%M UTC')"

echo ""
echo "Resetting user editor preferences…"
wp --allow-root --skip-plugins --skip-themes user meta delete 1 wp_persisted_preferences
# Disable the post editor welcome guide
wp --allow-root --skip-plugins --skip-themes user meta add 1 wp_persisted_preferences "{\"core/edit-post\":{\"welcomeGuide\": false}}" --format=json

echo ""
echo "Deleting all Campaigns entities…"
# Remove all posts of type newspack_popups_cpt
wp --allow-root --skip-plugins --skip-themes post delete "$(wp --allow-root --skip-plugins --skip-themes post list --post_type=newspack_popups_cpt --format=ids)" --force || true
# Remove all segments
wp --allow-root --skip-plugins --skip-themes option delete newspack_popups_segments || true
# Remove the "Campaigns"
wp --allow-root --skip-plugins --skip-themes term list newspack_popups_taxonomy --field=term_id | xargs wp --allow-root --skip-plugins --skip-themes term delete newspack_popups_taxonomy || true

wp --allow-root --skip-plugins config set NP_MANAGER_SNAPSHOTS_ENABLED true --type=constant --raw
wp --allow-root --skip-plugins config set NP_MANAGER_SNAPSHOTS_EXCLUDE_MEDIA true --type=constant --raw

wp --allow-root cache flush
wp --allow-root newspack-manager site-testing-snapshots delete vanilla
wp --allow-root newspack-manager site-testing-snapshots create vanilla

echo ""
echo "Activating third-party plugins"
wp --allow-root --skip-themes plugin install --activate woocommerce woocommerce-gateway-stripe
wp --allow-root --skip-themes plugin activate woocommerce-subscriptions woocommerce-memberships woocommerce-name-your-price
wp --allow-root cache flush

echo ""
echo "Configuring WooCommerce"
wp --allow-root --skip-plugins --skip-themes option update woocommerce_onboarding_profile '{"skipped":"1"}' --format=json
wp --allow-root --skip-plugins --skip-themes option update woocommerce_coming_soon 'no'
wp --allow-root --skip-plugins --skip-themes option update woocommerce_allow_tracking 'no'
wp --allow-root --skip-plugins --skip-themes option update woocommerce_show_marketplace_suggestions 'no'
wp --allow-root --skip-plugins --skip-themes option update woocommerce_allow_tracking 'no'
wp --allow-root --skip-plugins --skip-themes option update woocommerce_task_list_hidden 'yes'
wp --allow-root --skip-plugins --skip-themes option update woocommerce_task_list_complete 'yes'
wp --allow-root --skip-plugins --skip-themes option update woocommerce_task_list_welcome_modal_dismissed 'yes'
wp --allow-root --skip-plugins --skip-themes option update woocommerce_default_country 'US:NY'
wp --allow-root --skip-plugins --skip-themes option update woocommerce_currency 'USD'
wp --allow-root --skip-plugins --skip-themes option update wc_memberships_admin_restricted_content_notice 'no'

if [ -n "$STRIPE_PUB_KEY" ]; then
  echo ""
  echo "Setting up Stripe"
  wp --allow-root --skip-plugins --skip-themes option update woocommerce_stripe_settings '{
    "title": "Credit Card (Stripe test mode)",
    "enabled": "yes",
    "testmode": "yes",
    "test_publishable_key": "'"$STRIPE_PUB_KEY"'",
    "test_secret_key": "'"$STRIPE_SECRECT_KEY"'",
    "inline_cc_form": "no",
    "statement_descriptor": "E2E test store",
    "capture": "yes",
    "payment_request": "yes",
    "debug": "yes"
  }' --format=json
fi

echo ""
echo "Setup the site - Reader Revenue"
# Calling this method will create the page if it does not exist.
wp --allow-root --skip-themes eval "\Newspack\Donations::get_donation_page_info();"
wp --allow-root --skip-plugins --skip-themes post update "$(wp --allow-root --skip-plugins --skip-themes option get newspack_donation_page_id)" --post_status=publish
# Create the donation products – this happens when the RR settings are saved in RR wizard.
wp --allow-root --skip-themes eval "\Newspack\Donations::update_donation_product();"
# Limit the fields required for checkout.
wp --allow-root --skip-plugins --skip-themes option set newspack_donations_billing_fields '["billing_email","billing_first_name","billing_last_name"]' --format=json

wp --allow-root cache flush
wp --allow-root newspack-manager site-testing-snapshots delete with-woo
wp --allow-root newspack-manager site-testing-snapshots create with-woo