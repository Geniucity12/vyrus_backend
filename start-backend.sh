#!/bin/sh
# Always start the backend server from the correct directory so .env is loaded
cd "$(dirname "$0")"
pnpm run dev
