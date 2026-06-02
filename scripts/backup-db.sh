#!/usr/bin/env bash
#
# MySQL 日次バックアップ（ConoHa VPS 本番）
# - mysql コンテナから mysqldump し、gzip してローカルに保存。
# - 14 日より古いものは削除。
# - ★ オフサイト退避（オブジェクトストレージ等）を強く推奨（末尾コメント参照）。
#
# 使い方（cron 例・毎日 3:15）:
#   15 3 * * * /var/www/ichigo-step/scripts/backup-db.sh >> /var/log/ichigo-backup.log 2>&1
#
set -euo pipefail

# このスクリプトのあるリポジトリ直下へ移動
cd "$(dirname "$0")/.."

# compose 用 .env から DB 認証情報を読む
# shellcheck disable=SC1091
set -a; source ./.env; set +a

BACKUP_DIR="${BACKUP_DIR:-/var/backups/ichigo-step}"
RETENTION_DAYS="${RETENTION_DAYS:-14}"
STAMP="$(date +%Y%m%d-%H%M%S)"
OUT="${BACKUP_DIR}/${DB_DATABASE}-${STAMP}.sql.gz"

mkdir -p "$BACKUP_DIR"

echo "[$(date)] dumping ${DB_DATABASE} -> ${OUT}"
docker compose -f docker-compose.prod.yml exec -T mysql \
  mysqldump -u root -p"${DB_ROOT_PASSWORD}" \
  --single-transaction --quick --routines --triggers \
  "${DB_DATABASE}" | gzip > "${OUT}"

# サイズ 0 なら失敗とみなす
if [ ! -s "${OUT}" ]; then
  echo "[$(date)] ERROR: dump is empty" >&2
  rm -f "${OUT}"
  exit 1
fi

# 古い世代を削除
find "${BACKUP_DIR}" -name "${DB_DATABASE}-*.sql.gz" -mtime "+${RETENTION_DAYS}" -delete

echo "[$(date)] done: $(du -h "${OUT}" | cut -f1)"

# --- オフサイト退避（任意・推奨）------------------------------------------
# VPS 自体が飛ぶとローカルバックアップごと失う。別の場所へコピーすること。
# 例（rclone でオブジェクトストレージへ）:
#   rclone copy "${OUT}" remote:ichigo-step-backups/
# 例（別ホストへ scp）:
#   scp "${OUT}" backup@another-host:/backups/ichigo-step/
