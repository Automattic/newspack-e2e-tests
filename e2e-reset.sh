#!/bin/bash

echo ""
echo "Making sure all necessary plugins are active"
wp --allow-root --skip-plugins --skip-themes plugin activate newspack-plugin newspack-blocks newspack-popups newspack-ads newspack-newsletters

echo ""
echo "Enabling RAS"
wp --allow-root --skip-plugins --skip-themes option set newspack_reader_activation_enabled 1

echo ""
echo "Activating the E2E plugin"
wp --allow-root  --skip-plugins --skip-themes plugin activate e2e-plugin

echo ""
echo "Removing saved emails…"
wp --allow-root --skip-plugins --skip-themes post delete $(wp --allow-root --skip-plugins --skip-themes post list --post_type=email_log --format=ids) --force || true

echo ""
echo "Selective resetting for E2E tests…"

echo ""
echo "Resetting user editor preferences…"
wp --allow-root --skip-plugins --skip-themes user meta delete 1 wp_persisted_preferences
# Disable the post editor welcome guide
wp --allow-root --skip-plugins --skip-themes user meta add 1 wp_persisted_preferences "{\"core/edit-post\":{\"welcomeGuide\": false}}" --format=json

echo ""
echo "Deleting all Campaigns entities…"
# Remove all posts of type newspack_popups_cpt
wp --allow-root --skip-plugins --skip-themes post delete $(wp --allow-root --skip-plugins --skip-themes post list --post_type=newspack_popups_cpt --format=ids) --force || true
# Remove all segments
wp --allow-root --skip-plugins --skip-themes option delete newspack_popups_segments || true
# Remove the "Campaigns"
wp --allow-root --skip-plugins --skip-themes term list newspack_popups_taxonomy --field=term_id | xargs wp --allow-root --skip-plugins --skip-themes term delete newspack_popups_taxonomy || true

# Site setup - could be a testing scenario of its own some day, via UI.
echo ""
echo "Setup the site - Reader Revenue"
wp --allow-root --skip-plugins --skip-themes post update $(wp --allow-root --skip-plugins --skip-themes option get newspack_donation_page_id) --post_status=publish
# Create the donation products – this happens when the RR settings are saved in RR wizard.
wp --allow-root --skip-themes eval "\Newspack\Donations::update_donation_product();"
# Limit the fields required for checkout.
wp --allow-root --skip-plugins --skip-themes option set newspack_donations_billing_fields '["billing_email","billing_first_name","billing_last_name"]' --format=json
