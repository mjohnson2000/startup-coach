#!/usr/bin/env bash
# Run on a fresh Ubuntu VPS (Hostinger) after SSH login.
# Usage:
#   export DOMAIN=bizstarteragent.com
#   export OPENAI_API_KEY=sk-...
#   bash deploy/vps-setup.sh
set -euo pipefail

DOMAIN="${DOMAIN:-}"
OPENAI_API_KEY="${OPENAI_API_KEY:-}"
APP_DIR="/var/www/startup-coach"
REPO_URL="${REPO_URL:-https://github.com/mjohnson2000/startup-coach.git}"
NODE_MAJOR="${NODE_MAJOR:-20}"

if [[ -z "$DOMAIN" ]]; then
  echo "Set DOMAIN first, e.g. export DOMAIN=bizstarteragent.com"
  exit 1
fi

if [[ $EUID -ne 0 ]]; then
  echo "Run as root or with sudo."
  exit 1
fi

echo "==> Installing system packages"
apt-get update
apt-get install -y curl git nginx certbot python3-certbot-nginx

if ! command -v node >/dev/null 2>&1; then
  echo "==> Installing Node.js ${NODE_MAJOR}"
  curl -fsSL "https://deb.nodesource.com/setup_${NODE_MAJOR}.x" | bash -
  apt-get install -y nodejs
fi

if ! command -v pm2 >/dev/null 2>&1; then
  echo "==> Installing PM2"
  npm install -g pm2
fi

echo "==> Cloning app to ${APP_DIR}"
mkdir -p /var/www
if [[ -d "${APP_DIR}/.git" ]]; then
  git -C "${APP_DIR}" pull --ff-only
else
  git clone "${REPO_URL}" "${APP_DIR}"
fi

cd "${APP_DIR}"
echo "==> Installing dependencies and building"
npm ci
npm run build

echo "==> Writing .env"
cat > "${APP_DIR}/.env" <<EOF
NODE_ENV=production
PORT=3000
HOST=127.0.0.1
OPENAI_API_KEY=${OPENAI_API_KEY}
EOF
chmod 600 "${APP_DIR}/.env"

echo "==> Starting app with PM2"
pm2 delete startup-coach 2>/dev/null || true
set -a
source "${APP_DIR}/.env"
set +a
pm2 start deploy/ecosystem.config.cjs
pm2 save
STARTUP_CMD="$(pm2 startup systemd -u root --hp /root 2>/dev/null | grep -E '^(sudo )?env PATH' || true)"
if [[ -n "$STARTUP_CMD" ]]; then
  eval "$STARTUP_CMD"
fi

echo "==> Configuring nginx"
sed "s/DOMAIN_PLACEHOLDER/${DOMAIN}/g" deploy/nginx-startup-coach.conf \
  > /etc/nginx/sites-available/startup-coach
ln -sf /etc/nginx/sites-available/startup-coach /etc/nginx/sites-enabled/startup-coach
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx

if [[ -n "$OPENAI_API_KEY" ]]; then
  echo "==> OPENAI_API_KEY set — live AI mode enabled"
else
  echo "==> No OPENAI_API_KEY — app will run in demo mode until you add one"
fi

echo "==> Requesting SSL certificate"
certbot --nginx -d "${DOMAIN}" -d "www.${DOMAIN}" --non-interactive --agree-tos -m "admin@${DOMAIN}" || {
  echo "Certbot failed. Point DNS to this server, then run:"
  echo "  certbot --nginx -d ${DOMAIN} -d www.${DOMAIN}"
}

echo
echo "Done. Visit https://${DOMAIN}"
echo "Logs: pm2 logs startup-coach"
echo "Redeploy after git pull: cd ${APP_DIR} && git pull && npm ci && npm run build && pm2 restart startup-coach"
