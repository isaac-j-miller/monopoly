#!/bin/sh
set -euo pipefail

node ${@:-""} --require ts-node/register --require tsconfig-paths/register src/host/index.ts