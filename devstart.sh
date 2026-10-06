#!/usr/bin/env bash

set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACK_PID=""
FRONT_PID=""

cleanup() {
  trap - EXIT INT TERM

  echo
  echo "Deteniendo frontend y backend..."

  if [[ -n "$BACK_PID" ]]; then
    kill "$BACK_PID" 2>/dev/null || true
  fi

  if [[ -n "$FRONT_PID" ]]; then
    kill "$FRONT_PID" 2>/dev/null || true
  fi

  wait "$BACK_PID" "$FRONT_PID" 2>/dev/null || true
}

trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

echo "Iniciando backend..."
npm --prefix "$ROOT_DIR/back" run back &
BACK_PID=$!

echo "Iniciando frontend..."
npm --prefix "$ROOT_DIR/front" run front &
FRONT_PID=$!

echo "Frontend y backend iniciados. Presiona Ctrl+C para detenerlos."

if wait -n "$BACK_PID" "$FRONT_PID"; then
  exit 0
else
  exit $?
fi
