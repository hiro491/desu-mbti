#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

if ! npx vercel whoami >/dev/null 2>&1; then
  echo "Vercel CLI にログインしてください:"
  echo "  npx vercel login"
  exit 1
fi

SERVICE_ACCOUNT_JSON="$(python3 - <<'PY'
import json
from pathlib import Path

path = Path.home() / "Downloads" / "dethtype-firebase-adminsdk-fbsvc-e21f34f320.json"
if not path.exists():
    raise SystemExit(f"サービスアカウント JSON が見つかりません: {path}")
print(json.dumps(json.loads(path.read_text()), separators=(",", ":")))
PY
)"

add_env() {
  local name="$1"
  local value="$2"
  printf '%s' "$value" | npx vercel env add "$name" production --force
  echo "設定済み: $name"
}

add_env "NEXT_PUBLIC_SITE_URL" "https://desu-mbti.vercel.app"
add_env "FIREBASE_PROJECT_ID" "dethtype"
add_env "FIREBASE_CLIENT_EMAIL" "firebase-adminsdk-fbsvc@dethtype.iam.gserviceaccount.com"
add_env "FIREBASE_SERVICE_ACCOUNT_JSON" "$SERVICE_ACCOUNT_JSON"

echo "環境変数の設定が完了しました。本番デプロイを実行します..."
npx vercel deploy --prod --yes
