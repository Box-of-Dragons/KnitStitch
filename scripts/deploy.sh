#!/usr/bin/env bash
# KnitStitch post-reset deploy steps. Runs on the VPS after git fetch + reset,
# invoked by the shared family-deploy workflow during a release run.
set -euo pipefail

npm ci
npm run build-info
npm run build
