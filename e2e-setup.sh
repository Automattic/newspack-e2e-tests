#!/bin/bash

# Provision a Newspack site into a known state for the e2e suite.
#
# This wraps newspack-manager's general `scripts/site-setup.sh` (which rebuilds
# the whole site from scratch using the CURRENTLY installed plugin code) and then
# layers the e2e-specific configuration that the general script deliberately does
# not carry: the NEWSPACK_IS_E2E flag, the e2e helper plugin, the extra Newspack
# plugins the suite drives, Stripe test credentials, editor preferences, etc.
#
# It is meant to be copied to the site's WordPress root and run there – locally in
# the Docker container (as root, with --allow-root) or on a remote host over SSH.
#
# Usage: e2e-setup.sh [--woo|--no-woo] [passthrough options...]
#   --woo / --no-woo   Provision with or without the WooCommerce stack (default: --woo)
# All other options (--url, --admin-user, --admin-password, --allow-root, --reset)
# are passed straight through to site-setup.sh.

set -e

# Load Stripe test keys (and any other config) from .env when present.
if [ -f .env ]; then
  set -o allexport
  source .env
  set +o allexport
fi

WOO=true
ALLOW_ROOT=false
SITE_URL="http://localhost"
ADMIN_USER="admin"
ADMIN_PASSWORD="password"

# Options we both consume here and forward to site-setup.sh.
PASSTHROUGH=()
while [[ $# -gt 0 ]]; do
  case $1 in
    --woo)
      WOO=true
      shift
      ;;
    --no-woo)
      WOO=false
      shift
      ;;
    --allow-root)
      ALLOW_ROOT=true
      PASSTHROUGH+=("$1")
      shift
      ;;
    --url)
      SITE_URL="$2"
      PASSTHROUGH+=("$1" "$2")
      shift 2
      ;;
    --admin-user)
      ADMIN_USER="$2"
      PASSTHROUGH+=("$1" "$2")
      shift 2
      ;;
    --admin-password)
      ADMIN_PASSWORD="$2"
      PASSTHROUGH+=("$1" "$2")
      shift 2
      ;;
    *)
      PASSTHROUGH+=("$1")
      shift
      ;;
  esac
done

# WP-CLI wrapper mirroring site-setup.sh: inject --allow-root only when asked.
WP_GLOBAL_OPTS=()
if [ "$ALLOW_ROOT" = true ]; then
  WP_GLOBAL_OPTS+=(--allow-root)
fi
wp() {
  command wp "${WP_GLOBAL_OPTS[@]}" "$@"
}

# Resolve site-setup.sh. Defaults to the copy shipped inside the installed
# newspack-manager plugin; override with SITE_SETUP_SCRIPT to point at another copy
# (e.g. when testing a branch that isn't deployed to the site yet).
if [ -n "$SITE_SETUP_SCRIPT" ]; then
  SITE_SETUP="$SITE_SETUP_SCRIPT"
else
  PLUGINS_DIR="$(wp --skip-plugins --skip-themes eval 'echo WP_PLUGIN_DIR;')"
  SITE_SETUP="$PLUGINS_DIR/newspack-manager/scripts/site-setup.sh"
fi
if [ ! -f "$SITE_SETUP" ]; then
  echo "ERROR: site-setup.sh not found at $SITE_SETUP – is newspack-manager installed?" >&2
  exit 1
fi

echo "==> Running site-setup.sh (woo=$WOO)"
SITE_SETUP_ARGS=(
  --posts-count 20      # A handful is plenty for e2e; 40 is slow to generate.
  --customers-count 10  # Ditto: the suite doesn't need 100 customers.
  --no-campaigns        # Leave campaigns empty: campaigns.spec.ts builds a prompt
                        # from a clean slate and asserts an empty segment at the end,
                        # so the RAS preset prompts must not be seeded.
)
if [ "$WOO" = false ]; then
  SITE_SETUP_ARGS+=(--no-woocommerce)
fi
bash "$SITE_SETUP" "${SITE_SETUP_ARGS[@]}" "${PASSTHROUGH[@]}"

echo "==> Applying e2e-specific configuration"

# Feature flags (written to wp-config.php, so they survive the DB rebuild above).
wp --skip-plugins --skip-themes config set NEWSPACK_IS_E2E true --raw
# Note: this flag is slated for removal upstream.
wp --skip-plugins --skip-themes config set NEWSPACK_EMAIL_CHANGE_ENABLED true --raw

wp --skip-themes option update timezone_string 'America/New_York'

# Activate the remaining Newspack plugins the suite exercises, plus the e2e helper
# plugin (custom logout endpoint, outgoing-email log, admin-email-check bypass).
for plugin in newspack-ads newspack-newsletters newspack-manager e2e-plugin; do
  wp --skip-themes plugin activate "$plugin" || echo "WARNING: could not activate $plugin"
done

# Run Newspack's own setup routine (creates default pages/config the wizard would).
wp --skip-themes newspack setup || echo "WARNING: 'wp newspack setup' failed"

# Disable the block-editor welcome guide for the admin so it doesn't cover the UI.
wp --skip-plugins --skip-themes user meta delete "$ADMIN_USER" wp_persisted_preferences || true
wp --skip-plugins --skip-themes user meta add "$ADMIN_USER" wp_persisted_preferences \
  '{"core/edit-post":{"welcomeGuide":false}}' --format=json || true

# A recognisable, time-stamped title so it's obvious which run a report came from.
wp --skip-plugins --skip-themes option update blogname "The Daily Test: $(date -u '+%Y-%m-%d %H:%M UTC')"

if [ "$WOO" = true ]; then
  echo "==> Applying e2e WooCommerce configuration"

  # Activate the Stripe gateway. site-setup.sh doesn't (it's not part of the
  # generic Newspack bootstrap), but the @with-woo donation tests need a gateway
  # that supports subscriptions.
  wp --skip-themes plugin activate woocommerce-gateway-stripe || echo "WARNING: could not activate woocommerce-gateway-stripe"

  # Options site-setup.sh doesn't set but the suite relies on.
  wp --skip-plugins --skip-themes option update woocommerce_coming_soon 'no'
  wp --skip-plugins --skip-themes option update woocommerce_task_list_hidden 'yes'
  wp --skip-plugins --skip-themes option update woocommerce_task_list_complete 'yes'
  wp --skip-plugins --skip-themes option update woocommerce_task_list_welcome_modal_dismissed 'yes'
  wp --skip-plugins --skip-themes option update woocommerce_show_marketplace_suggestions 'no'
  wp --skip-plugins --skip-themes option update wc_memberships_admin_restricted_content_notice 'no'

  if [ -n "$STRIPE_PUB_KEY" ]; then
    echo "==> Configuring Stripe test gateway"
    wp --skip-plugins --skip-themes option update woocommerce_stripe_settings '{
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
fi

wp cache flush || true
echo "==> e2e site setup complete (woo=$WOO)"
