#!/usr/bin/env bash
# One-shot VPS setup for denogenesis.com — automates the README runbook:
#
#   1. Install + start the systemd service for the Deno app (127.0.0.1:8004).
#   2. Obtain the Let's Encrypt certificate if it does not exist yet
#      (standalone on :80, so nginx is stopped briefly on first run only).
#   3. Install the nginx scanner-probe snippet and site config, then
#      validate (nginx -t) and reload/start nginx.
#   4. On first issuance, switch certbot renewals to the zero-downtime
#      webroot method and verify with a dry run.
#   5. Health-check the app (loopback) and the public HTTPS endpoint.
#
# Idempotent: safe to re-run after pulling new config or code.
#
# Usage (on the VPS, from the repo root):
#   sudo ./deploy/setup-vps.sh

set -euo pipefail

DOMAIN="denogenesis.com"
WWW_DOMAIN="www.denogenesis.com"
CERTBOT_EMAIL="pedro.dfedro@gmail.com"
APP_USER="sysadmin"
APP_HOME="/home/${APP_USER}"
EXPECTED_REPO="${APP_HOME}/.local/src/development/dg-website"
APP_HEALTH_URL="http://127.0.0.1:8004/healthz"
WEBROOT="/var/www/certbot"
CERT_DIR="/etc/letsencrypt/live/${DOMAIN}"
NGINX_SNIPPET="/etc/nginx/snippets/deny-probes.conf"
NGINX_SITE_AVAILABLE="/etc/nginx/sites-available/${DOMAIN}"
NGINX_SITE_ENABLED="/etc/nginx/sites-enabled/${DOMAIN}"
SERVICE_NAME="denogenesis.service"

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

log()  { printf '\033[1;32m==>\033[0m %s\n' "$*"; }
warn() { printf '\033[1;33mWARN:\033[0m %s\n' "$*" >&2; }
die()  { printf '\033[1;31mERROR:\033[0m %s\n' "$*" >&2; exit 1; }

# --- Preflight ---------------------------------------------------------------

[[ ${EUID} -eq 0 ]] || die "run as root: sudo $0"

for cmd in nginx certbot systemctl curl; do
    command -v "${cmd}" >/dev/null || die "missing required command: ${cmd}"
done

if ! [[ -x "${APP_HOME}/.deno/bin/deno" ]] && ! command -v deno >/dev/null; then
    die "deno not found for ${APP_USER} (expected ${APP_HOME}/.deno/bin/deno)"
fi

if [[ "${REPO_ROOT}" != "${EXPECTED_REPO}" ]]; then
    warn "repo is at ${REPO_ROOT} but ${SERVICE_NAME} expects ${EXPECTED_REPO};"
    warn "the service will fail to start unless the unit's WorkingDirectory is updated."
fi

# --- 1. Systemd service for the Deno app -------------------------------------

log "Installing ${SERVICE_NAME}"
install -m 0644 "${REPO_ROOT}/deploy/systemd/denogenesis.service" \
    "/etc/systemd/system/${SERVICE_NAME}"
systemctl daemon-reload
systemctl enable --now "${SERVICE_NAME}"
systemctl restart "${SERVICE_NAME}"

log "Waiting for the app to answer on ${APP_HEALTH_URL}"
for i in {1..10}; do
    if curl -fsS -o /dev/null "${APP_HEALTH_URL}"; then
        break
    fi
    [[ ${i} -eq 10 ]] && die "app never became healthy; check: journalctl -u ${SERVICE_NAME} -n 50"
    sleep 1
done
log "App is healthy"

# --- 2. Certificate (first run only) ------------------------------------------

mkdir -p "${WEBROOT}"

first_issuance=0
if [[ -e "${CERT_DIR}/fullchain.pem" ]]; then
    log "Certificate for ${DOMAIN} already exists — skipping issuance"
else
    first_issuance=1
    log "No certificate yet — issuing via standalone (nginx stops briefly)"
    if systemctl is-active --quiet nginx; then
        systemctl stop nginx
    fi
    certbot certonly --standalone -n \
        -d "${DOMAIN}" -d "${WWW_DOMAIN}" \
        --agree-tos -m "${CERTBOT_EMAIL}" --no-eff-email
fi

# --- 3. Nginx snippet + site config -------------------------------------------

log "Installing nginx snippet and site config"
install -m 0644 "${REPO_ROOT}/deploy/nginx/snippets/deny-probes.conf" "${NGINX_SNIPPET}"
install -m 0644 "${REPO_ROOT}/deploy/nginx/denogenesis.com.conf" "${NGINX_SITE_AVAILABLE}"
ln -sf "${NGINX_SITE_AVAILABLE}" "${NGINX_SITE_ENABLED}"

log "Validating nginx configuration"
nginx -t

if systemctl is-active --quiet nginx; then
    systemctl reload nginx
else
    systemctl enable --now nginx
fi
log "Nginx is up"

# --- 4. Zero-downtime renewals (first run only) --------------------------------

if [[ ${first_issuance} -eq 1 ]]; then
    log "Switching renewals to the webroot method (${WEBROOT})"
    certbot certonly --webroot -w "${WEBROOT}" -n \
        -d "${DOMAIN}" -d "${WWW_DOMAIN}" \
        --cert-name "${DOMAIN}" --force-renewal
    systemctl reload nginx

    log "Verifying auto-renewal with a dry run"
    certbot renew --dry-run
fi

# --- 5. Public health check ----------------------------------------------------

log "Checking https://${DOMAIN}/healthz"
if curl -fsS -o /dev/null --max-time 10 "https://${DOMAIN}/healthz"; then
    log "Site is live: https://${DOMAIN}/"
else
    warn "https://${DOMAIN}/healthz not reachable from this host —"
    warn "fine if DNS has not been pointed at this VPS yet."
fi

log "Done"
